const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { runMysqldump } = require("../services/backupRunner");


// Get all backups
exports.getBackups = (req, res) => {

    const sql = `
        SELECT
            b.*,
            i.name AS instance_name,
            i.db_type
        FROM backups b
        JOIN instances i
        ON b.instance_id = i.id
        ORDER BY b.backup_date DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);
    });
};

// Add backup record
exports.addBackup = (req, res) => {

    const {
        instance_id,
        backup_date,
        status,
        backup_size,
        duration,
        backup_location
    } = req.body;

    const sql = `
        INSERT INTO backups
        (
            instance_id,
            backup_date,
            status,
            backup_size,
            duration,
            backup_location
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            instance_id,
            backup_date,
            status,
            backup_size,
            duration,
            backup_location
        ],
        (err, result) => {

           if (err) {
    console.error("MYSQL ERROR:", err);
    return res.status(500).json({
        error: err.message
    });
}


   res.json({
        message: "Backup Record Added Successfully"
            });
        }
    );
};

exports.createRealBackup = (req, res) => {
    const instanceId = req.body.instance_id;
    const instanceSql = `
        SELECT *
        FROM instances
        WHERE id = ?
    `;

    db.query(instanceSql, [instanceId], (err, result) => {
        if (err || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Instance not found"
            });
        }

        const instance = result[0];
        let backupDir = instance.backup_location || "C:/backup";

        // Sanitize and resolve backup directory path
        try {
            backupDir = path.normalize(backupDir);
            fs.mkdirSync(backupDir, { recursive: true });
        } catch (dirErr) {
            console.error("Failed to create configured backup directory, falling back to temp workspace directory:", dirErr);
            backupDir = path.join(__dirname, "../backups");
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const timestamp = Date.now();
        const filename = `${instance.name.replace(/\s+/g, "_")}_backup_${timestamp}.dump`;
        const backupPath = path.join(backupDir, filename);

        console.log("Executing mysqldump backup for instance:", instance.name);
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

            // Calculate real file size
            let sizeStr = "0 KB";
            try {
                const stats = fs.statSync(backupPath);
                const sizeBytes = stats.size;
                if (sizeBytes > 1024 * 1024) {
                    sizeStr = `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
                } else {
                    sizeStr = `${(sizeBytes / 1024).toFixed(2)} KB`;
                }
            } catch (statErr) {
                console.error("Failed to calculate backup file size:", statErr);
            }

            // Calculate MD5 checksum
            let fileHash = "N/A";
            try {
                const fileBuffer = fs.readFileSync(backupPath);
                const hashSum = crypto.createHash("md5");
                hashSum.update(fileBuffer);
                fileHash = hashSum.digest("hex");
            } catch (hashErr) {
                console.error("Failed to calculate backup MD5 hash:", hashErr);
            }

            // Insert backup record into SQL table
            const sql = `
                INSERT INTO backups
                (
                    instance_id,
                    backup_date,
                    status,
                    backup_size,
                    duration,
                    backup_location,
                    remarks
                )
                VALUES (?, NOW(), ?, ?, ?, ?, ?)
            `;

            db.query(
                sql,
                [
                    instanceId,
                    "Success",
                    sizeStr,
                    durationStr,
                    backupPath,
                    `MD5: ${fileHash}`
                ],
                (dbErr) => {
                    if (dbErr) {
                        console.error("Database log insert error:", dbErr);
                    } else {
                        // Update instance status to Connected
                        db.query("UPDATE instances SET status = 'Connected' WHERE id = ?", [instanceId], (updErr) => {
                            if (updErr) console.error("Failed to update instance status:", updErr);
                        });
                    }
                }
            );

            res.json({
                success: true,
                backupPath,
                backupSize: sizeStr,
                duration: durationStr,
                fileHash,
                fileName: filename
            });
        }).catch((error) => {
            console.error("mysqldump exec error:", error);

            const insertSql = `
                INSERT INTO backups
                (
                    instance_id,
                    backup_date,
                    status,
                    backup_size,
                    duration,
                    backup_location,
                    remarks
                )
                VALUES (?, NOW(), 'Failed', '0 KB', ?, NULL, ?)
            `;

            db.query(
                insertSql,
                [
                    instanceId,
                    `${((process.hrtime(startTime)[0] + process.hrtime(startTime)[1] / 1e9).toFixed(2))}s`,
                    `Manual run failed: ${error.message.substring(0, 200)}`
                ],
                (dbErr) => {
                    if (dbErr) {
                        console.error("Database log insert error (on failure):", dbErr);
                    }
                }
            );

            db.query("UPDATE instances SET status = 'Disconnected' WHERE id = ?", [instanceId], (updErr) => {
                if (updErr) {
                    console.error("Failed to update instance status (on failure):", updErr);
                }
            });

            return res.status(500).json({
                success: false,
                message: "Backup failed",
                error: error.message
            });
        });
    });
};

exports.downloadBackup = (req, res) => {
    const id = req.params.id;
    const sql = "SELECT backup_location FROM backups WHERE id=?";

    db.query(
        sql,
        [id],
        (err, result) => {
            if (err || result.length === 0) {
                return res.status(404).json({
                    message: "Backup not found"
                });
            }

            const filePath = result[0].backup_location;
            if (!filePath || !fs.existsSync(filePath)) {
                return res.status(404).json({
                    message: "Backup archive file not found on disk"
                });
            }

            res.download(filePath);
        }
    );
};