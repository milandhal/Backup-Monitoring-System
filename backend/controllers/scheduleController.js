const db = require("../config/db");
const scheduler = require("../services/backupScheduler");

// GET /api/schedules — list all schedules joined with instance name
exports.getSchedules = (req, res) => {
    const sql = `
        SELECT
            bs.*,
            i.name AS instance_name,
            i.db_type,
            i.ip
        FROM backup_schedules bs
        JOIN instances i ON bs.instance_id = i.id
        ORDER BY bs.created_at DESC
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Failed to fetch schedules:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
};

// GET /api/schedules/:instanceId — get schedule for a specific instance
exports.getScheduleByInstance = (req, res) => {
    const { instanceId } = req.params;
    const sql = `
        SELECT bs.*, i.name AS instance_name, i.db_type, i.ip
        FROM backup_schedules bs
        JOIN instances i ON bs.instance_id = i.id
        WHERE bs.instance_id = ?
        ORDER BY bs.created_at DESC
        LIMIT 1
    `;
    db.query(sql, [instanceId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0] || null);
    });
};

// POST /api/schedules — create a new schedule
exports.createSchedule = (req, res) => {
    const {
        instance_id,
        frequency,
        backup_time,
        start_date,
        storage_destination,
        backup_path,
        retention_policy,
        email_alert,
        sms_alert
    } = req.body;

    if (!instance_id || !frequency || !backup_time || !start_date) {
        return res.status(400).json({ error: "instance_id, frequency, backup_time, and start_date are required." });
    }

    const sql = `
        INSERT INTO backup_schedules
        (instance_id, frequency, backup_time, start_date, storage_destination, backup_path, retention_policy, email_alert, sms_alert, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `;

    db.query(
        sql,
        [
            instance_id,
            frequency,
            backup_time,
            start_date,
            storage_destination || "Local Drive",
            backup_path || null,
            retention_policy || "30 Days",
            email_alert ? 1 : 0,
            sms_alert ? 1 : 0
        ],
        (err, result) => {
            if (err) {
                console.error("Failed to create schedule:", err);
                return res.status(500).json({ error: err.message });
            }

            const newId = result.insertId;

            // Fetch full schedule row (with instance name) and register cron immediately
            db.query(
                "SELECT bs.*, i.name AS instance_name FROM backup_schedules bs JOIN instances i ON bs.instance_id = i.id WHERE bs.id = ?",
                [newId],
                (fetchErr, rows) => {
                    if (!fetchErr && rows.length > 0) {
                        scheduler.register(rows[0]);
                    }
                }
            );

            res.json({
                message: "Schedule created and activated successfully.",
                schedule_id: newId
            });
        }
    );
};

// PATCH /api/schedules/:id/status — toggle Active <-> Paused
exports.updateScheduleStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Active", "Paused"].includes(status)) {
        return res.status(400).json({ error: "status must be 'Active' or 'Paused'." });
    }

    db.query(
        "UPDATE backup_schedules SET status = ? WHERE id = ?",
        [status, id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });

            if (status === "Paused") {
                scheduler.pause(parseInt(id));
            } else {
                scheduler.resume(parseInt(id));
            }

            res.json({ message: `Schedule ${status === "Active" ? "resumed" : "paused"} successfully.` });
        }
    );
};

// DELETE /api/schedules/:id — remove a schedule
exports.deleteSchedule = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM backup_schedules WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err.message });

        scheduler.cancel(parseInt(id));
        res.json({ message: "Schedule deleted and cron job cancelled." });
    });
};

// POST /api/schedules/:id/run-now — immediately execute backup for a schedule
exports.runScheduleNow = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT bs.*, i.name AS instance_name, i.db_type, i.ip,
               i.username, i.db_password, i.db_name, i.backup_location, i.port
        FROM backup_schedules bs
        JOIN instances i ON bs.instance_id = i.id
        WHERE bs.id = ?
    `;

    db.query(sql, [id], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(404).json({ error: "Schedule or linked instance not found." });
        }

        const schedule = rows[0];

        // Check it is a MySQL instance
        if (schedule.db_type !== "MySQL") {
            return res.status(400).json({
                error: `Instance '${schedule.instance_name}' uses ${schedule.db_type}. Only MySQL is supported for live backup.`
            });
        }

        // Missing credentials check
        if (!schedule.db_name) {
            return res.status(400).json({
                error: `Instance '${schedule.instance_name}' has no target database name configured. Edit the instance and add db_name.`
            });
        }

        // Trigger backup via shared scheduler logic
        scheduler.runBackupNow(schedule, (result) => {
            if (result.success) {
                res.json({
                    success: true,
                    message: `Backup completed for '${schedule.instance_name}'.`,
                    backupPath: result.backupPath,
                    backupSize: result.backupSize,
                    duration:   result.duration,
                    fileHash:   result.fileHash
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: `Backup failed for '${schedule.instance_name}'.`,
                    error: result.error
                });
            }
        });
    });
};
