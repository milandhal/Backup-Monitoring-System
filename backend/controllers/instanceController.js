const db = require("../config/db");

exports.getInstances = (req, res) => {

    const sql = `
        SELECT i.*,
            (SELECT MAX(backup_date) FROM backups b WHERE b.instance_id = i.id AND b.status = 'Success') AS lastBackup,
            (SELECT b.duration FROM backups b WHERE b.instance_id = i.id ORDER BY b.backup_date DESC LIMIT 1) AS last_backup_duration,
            (SELECT b.backup_size FROM backups b WHERE b.instance_id = i.id ORDER BY b.backup_date DESC LIMIT 1) AS last_backup_size,
            (SELECT b.status FROM backups b WHERE b.instance_id = i.id ORDER BY b.backup_date DESC LIMIT 1) AS last_backup_status,
            (SELECT b.remarks FROM backups b WHERE b.instance_id = i.id ORDER BY b.backup_date DESC LIMIT 1) AS last_backup_remarks,
            (SELECT b.backup_location FROM backups b WHERE b.instance_id = i.id ORDER BY b.backup_date DESC LIMIT 1) AS last_backup_location
        FROM instances i
    `;

    db.query(
        sql,
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(result);
        }
    );
};

exports.addInstance = (req, res) => {

    const {
        name,
        ip,
        db_type,
        port,
        status,
        backup_location,
        username,
        db_password,
        db_name,
        remarks
    } = req.body;

    const sql = `
        INSERT INTO instances
        (
            name,
            ip,
            db_type,
            port,
            status,
            backup_location,
            username,
            db_password,
            db_name,
            remarks
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            name,
            ip,
            db_type,
            port,
            status,
            backup_location,
            username,
            db_password || null,
            db_name || null,
            remarks
        ],
        (err, result) => {

            if (err) {
                console.error("DB Error adding instance:", err);
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: "Instance Added Successfully"
            });
        }
    );
};

exports.deleteInstance = (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM instances WHERE id = ?",
        [id],
        (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Instance Unregistered Successfully"
            });
        }
    );
};