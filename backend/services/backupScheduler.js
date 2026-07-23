const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const db = require("../config/db");
const { runMysqldump } = require("./backupRunner");

// In-memory map of running cron tasks: scheduleId -> cron.ScheduledTask
const activeTasks = {};

/**
 * Convert frequency + backup_time into a valid 5-field cron expression.
 * backup_time is HH:MM or HH:MM:SS
 */
function buildCronExpression(frequency, backupTime) {
    const parts = backupTime.split(":");
    const hour = parseInt(parts[0], 10);
    const minute = parseInt(parts[1], 10);

    switch (frequency) {
        case "Hourly":
            return `${minute} * * * *`;
        case "Daily":
            return `${minute} ${hour} * * *`;
        case "Weekly":
            return `${minute} ${hour} * * 0`; // Every Sunday
        case "Monthly":
            return `${minute} ${hour} 1 * *`; // 1st of every month
        default:
            return `${minute} ${hour} * * *`; // Default to daily
    }
}

/**
 * Execute a real mysqldump for a given instance and log the result.
 */
function runBackupForInstance(instance) {
    let backupDir = instance.backup_location || "C:/backup";
    try {
        backupDir = path.normalize(backupDir);
        fs.mkdirSync(backupDir, { recursive: true });
    } catch {
        backupDir = path.join(__dirname, "../backups");
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `${instance.name.replace(/\s+/g, "_")}_scheduled_${timestamp}.dump`;
    const backupPath = path.join(backupDir, filename);

    console.log(`[Scheduler] Running scheduled backup for '${instance.name}'...`);
    const startTime = process.hrtime();

    runMysqldump({
        host: instance.ip,
        port: instance.port,
        username: instance.username,
        password: instance.db_password,
        database: instance.db_name,
        outputPath: backupPath
    }).then(() => {
        const diff = process.hrtime(startTime);
        const durationSeconds = (diff[0] + diff[1] / 1e9).toFixed(2);
        const durationStr = `${durationSeconds}s`;

        const status = "Success";
        let sizeStr = "0 KB";
        let fileHash = "N/A";
        let remarks = "";

        try {
            const stats = fs.statSync(backupPath);
            const sizeBytes = stats.size;
            sizeStr = sizeBytes > 1024 * 1024
                ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
                : `${(sizeBytes / 1024).toFixed(2)} KB`;
        } catch {}

        try {
            const fileBuffer = fs.readFileSync(backupPath);
            const hashSum = crypto.createHash("md5");
            hashSum.update(fileBuffer);
            fileHash = hashSum.digest("hex");
        } catch {}

        remarks = `Scheduled backup. MD5: ${fileHash}`;
        console.log(`[Scheduler] Backup SUCCESS for '${instance.name}': ${sizeStr} in ${durationStr}`);

        const sql = `
            INSERT INTO backups (instance_id, backup_date, status, backup_size, duration, backup_location, remarks)
            VALUES (?, NOW(), ?, ?, ?, ?, ?)
        `;

        db.query(sql, [instance.id, status, sizeStr, durationStr, backupPath, remarks], (dbErr) => {
            if (dbErr) {
                console.error("[Scheduler] Failed to log backup record:", dbErr.message);
            } else {
                db.query("UPDATE instances SET status = 'Connected' WHERE id = ?", [instance.id], (updErr) => {
                    if (updErr) console.error("[Scheduler] Failed to update instance status:", updErr.message);
                });
            }
        });
    }).catch((error) => {
        const diff = process.hrtime(startTime);
        const durationSeconds = (diff[0] + diff[1] / 1e9).toFixed(2);
        const durationStr = `${durationSeconds}s`;

        console.error(`[Scheduler] Backup FAILED for '${instance.name}':`, error.message);

        db.query(
            "INSERT INTO backups (instance_id, backup_date, status, backup_size, duration, backup_location, remarks) VALUES (?, NOW(), 'Failed', '0 KB', ?, NULL, ?)",
            [instance.id, durationStr, `Scheduled backup failed: ${error.message.substring(0, 200)}`],
            () => {}
        );

        db.query("UPDATE instances SET status = 'Disconnected' WHERE id = ?", [instance.id], () => {});
    });
}

/**
 * Register a single schedule as an active cron job.
 */
function register(schedule) {
    const cronExpr = buildCronExpression(schedule.frequency, schedule.backup_time);

    if (!cron.validate(cronExpr)) {
        console.error(`[Scheduler] Invalid cron expression '${cronExpr}' for schedule ID ${schedule.id}`);
        return;
    }

    // Cancel any existing task for this ID first
    if (activeTasks[schedule.id]) {
        activeTasks[schedule.id].stop();
        delete activeTasks[schedule.id];
    }

    const task = cron.schedule(cronExpr, () => {
        // Fetch latest instance credentials at fire time (not cached)
        db.query("SELECT * FROM instances WHERE id = ?", [schedule.instance_id], (err, rows) => {
            if (err || rows.length === 0) {
                console.error(`[Scheduler] Instance ${schedule.instance_id} not found at job fire time.`);
                return;
            }
            runBackupForInstance(rows[0]);
        });
    }, { scheduled: true });

    activeTasks[schedule.id] = task;
    console.log(`[Scheduler] Registered schedule ID ${schedule.id} (${schedule.instance_name || schedule.instance_id}) — cron: ${cronExpr}`);
}

/**
 * Pause a running cron task without deleting it.
 */
function pause(scheduleId) {
    if (activeTasks[scheduleId]) {
        activeTasks[scheduleId].stop();
        console.log(`[Scheduler] Paused schedule ID ${scheduleId}`);
    }
}

/**
 * Resume a paused cron task by re-registering from DB.
 */
function resume(scheduleId) {
    db.query("SELECT * FROM backup_schedules WHERE id = ?", [scheduleId], (err, rows) => {
        if (err || rows.length === 0) return;
        register(rows[0]);
        console.log(`[Scheduler] Resumed schedule ID ${scheduleId}`);
    });
}

/**
 * Permanently cancel and remove a cron task.
 */
function cancel(scheduleId) {
    if (activeTasks[scheduleId]) {
        activeTasks[scheduleId].stop();
        delete activeTasks[scheduleId];
        console.log(`[Scheduler] Cancelled schedule ID ${scheduleId}`);
    }
}

/**
 * Load all active schedules from DB and register them as cron jobs.
 * Called once on server startup.
 */
function loadAndRegisterAll() {
    db.query(
        "SELECT bs.*, i.name AS instance_name FROM backup_schedules bs JOIN instances i ON bs.instance_id = i.id WHERE bs.status = 'Active'",
        (err, schedules) => {
            if (err) {
                console.error("[Scheduler] Failed to load schedules from DB:", err.message);
                return;
            }
            if (schedules.length === 0) {
                console.log("[Scheduler] No active schedules found.");
                return;
            }
            schedules.forEach(schedule => register(schedule));
            console.log(`[Scheduler] Loaded and registered ${schedules.length} active schedule(s).`);
        }
    );
}

/**
 * Run a backup immediately for a given instance object (or schedule row with instance fields joined).
 * Calls callback(result) where result = { success, backupPath, backupSize, duration, fileHash, error }
 */
function runBackupNow(instance, callback) {
    let backupDir = instance.backup_path || instance.backup_location || "C:/backup";
    try {
        backupDir = path.normalize(backupDir);
        fs.mkdirSync(backupDir, { recursive: true });
    } catch {
        backupDir = path.join(__dirname, "../backups");
        fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeName = (instance.instance_name || instance.name || "db").replace(/\s+/g, "_");
    const filename = `${safeName}_manual_${timestamp}.dump`;
    const backupPath = path.join(backupDir, filename);

    console.log(`[Scheduler] Running immediate backup for '${safeName}'...`);
    const startTime = process.hrtime();

    runMysqldump({
        host: instance.ip,
        port: instance.port,
        username: instance.username,
        password: instance.db_password,
        database: instance.db_name,
        outputPath: backupPath
    }).then(() => {
        const diff = process.hrtime(startTime);
        const durationSeconds = (diff[0] + diff[1] / 1e9).toFixed(2);
        const durationStr = `${durationSeconds}s`;

        let sizeStr = "0 KB";
        let fileHash = "N/A";

        try {
            const stats = fs.statSync(backupPath);
            const sizeBytes = stats.size;
            sizeStr = sizeBytes > 1024 * 1024
                ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`
                : `${(sizeBytes / 1024).toFixed(2)} KB`;
        } catch {}

        try {
            const fileBuffer = fs.readFileSync(backupPath);
            const hashSum = crypto.createHash("md5");
            hashSum.update(fileBuffer);
            fileHash = hashSum.digest("hex");
        } catch {}

        console.log(`[Scheduler] Immediate backup SUCCESS for '${safeName}': ${sizeStr} in ${durationStr}`);

        const instanceId = instance.instance_id || instance.id;
        db.query(
            "INSERT INTO backups (instance_id, backup_date, status, backup_size, duration, backup_location, remarks) VALUES (?, NOW(), 'Success', ?, ?, ?, ?)",
            [instanceId, sizeStr, durationStr, backupPath, `Manual run. MD5: ${fileHash}`],
            () => {}
        );

        db.query("UPDATE instances SET status = 'Connected' WHERE id = ?", [instanceId], () => {});

        if (callback) callback({ success: true, backupPath, size: sizeStr, duration: durationStr, fileHash });
    }).catch((error) => {
        const diff = process.hrtime(startTime);
        const durationSeconds = (diff[0] + diff[1] / 1e9).toFixed(2);
        const durationStr = `${durationSeconds}s`;

        console.error(`[Scheduler] Immediate backup FAILED for '${safeName}':`, error.message);

        const instanceId = instance.instance_id || instance.id;
        db.query(
            "INSERT INTO backups (instance_id, backup_date, status, backup_size, duration, backup_location, remarks) VALUES (?, NOW(), 'Failed', '0 KB', ?, NULL, ?)",
            [instanceId, durationStr, `Manual run failed: ${error.message.substring(0, 200)}`],
            () => {}
        );

        db.query("UPDATE instances SET status = 'Disconnected' WHERE id = ?", [instanceId], () => {});

        if (callback) callback({ success: false, error: error.message });
    });
}

module.exports = { loadAndRegisterAll, register, pause, resume, cancel, runBackupNow };