const db = require("../config/db");

// Wrap db.query in a Promise for cleaner async usage
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

exports.getDashboardStats = async (req, res) => {
    try {
        const [
            totalResult,
            connectedResult,
            disconnectedResult,
            todayResult,
            successResult,
            failedResult,
            scheduledResult,
            recentBackups,
            sizesResult
        ] = await Promise.all([
            query("SELECT COUNT(*) AS totalInstances FROM instances"),
            query("SELECT COUNT(*) AS connectedInstances FROM instances WHERE status='Connected'"),
            query("SELECT COUNT(*) AS disconnectedInstances FROM instances WHERE status='Disconnected'"),
            query("SELECT COUNT(*) AS todayBackups FROM backups WHERE DATE(backup_date) = CURDATE()"),
            query("SELECT COUNT(*) AS successfulBackups FROM backups WHERE status='Success'"),
            query("SELECT COUNT(*) AS failedBackups FROM backups WHERE status='Failed'"),
            query("SELECT COUNT(*) AS scheduledBackups, GROUP_CONCAT(DISTINCT frequency) AS frequencies FROM backup_schedules WHERE status='Active'"),
            query(`
                SELECT b.id, i.name AS instance_name, i.db_type, b.duration,
                       b.backup_size, b.status, b.backup_date
                FROM backups b
                LEFT JOIN instances i ON b.instance_id = i.id
                ORDER BY b.backup_date DESC
                LIMIT 5
            `),
            query("SELECT backup_size FROM backups WHERE status='Success' AND DATE(backup_date) = CURDATE()")
        ]);

        let todaySizeGB = 0;
        sizesResult.forEach(row => {
            const sizeStr = row.backup_size;
            if (sizeStr) {
                const match = sizeStr.match(/^([\d.]+)\s*(GB|MB|KB|Bytes|B)?/i);
                if (match) {
                    const value = parseFloat(match[1]);
                    const unit = (match[2] || '').toUpperCase();
                    if (unit === 'GB') {
                        todaySizeGB += value;
                    } else if (unit === 'MB') {
                        todaySizeGB += value / 1024;
                    } else if (unit === 'KB') {
                        todaySizeGB += value / (1024 * 1024);
                    } else if (unit === 'BYTES' || unit === 'B') {
                        todaySizeGB += value / (1024 * 1024 * 1024);
                    }
                }
            }
        });
        todaySizeGB = parseFloat(todaySizeGB.toFixed(2));

        res.json({
            totalInstances:      totalResult[0].totalInstances,
            connectedInstances:  connectedResult[0].connectedInstances,
            disconnectedInstances: disconnectedResult[0].disconnectedInstances,
            todayBackups:        todayResult[0].todayBackups,
            successfulBackups:   successResult[0].successfulBackups,
            failedBackups:       failedResult[0].failedBackups,
            scheduledBackups:    scheduledResult[0].scheduledBackups || 0,
            scheduledFrequencies: scheduledResult[0].frequencies || null,
            totalBackupSize:     todaySizeGB,
            recentBackups
        });
    } catch (err) {
        console.error("Dashboard stats error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getChartData = async (req, res) => {
    try {
        const [
            dbDistribution,
            dailyTrend,
            weeklyTrend,
            instanceDurations,
            statusBreakdown
        ] = await Promise.all([
            // RDBMS engine distribution
            query("SELECT db_type AS label, COUNT(*) AS value FROM instances GROUP BY db_type"),

            // Daily backup counts for last 7 days
            query(`
                SELECT DATE_FORMAT(backup_date, '%Y-%m-%d') AS day,
                       SUM(CASE WHEN status='Success' THEN 1 ELSE 0 END) AS success,
                       SUM(CASE WHEN status='Failed'  THEN 1 ELSE 0 END) AS failed
                FROM backups
                WHERE backup_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY DATE_FORMAT(backup_date, '%Y-%m-%d')
                ORDER BY day ASC
            `),

            // Weekly backup counts (last 4 weeks)
            query(`
                SELECT WEEK(backup_date) AS week_num,
                       MIN(DATE(backup_date)) AS week_start,
                       SUM(CASE WHEN status='Success' THEN 1 ELSE 0 END) AS success,
                       SUM(CASE WHEN status='Failed'  THEN 1 ELSE 0 END) AS failed
                FROM backups
                WHERE backup_date >= DATE_SUB(CURDATE(), INTERVAL 28 DAY)
                GROUP BY WEEK(backup_date)
                ORDER BY week_num ASC
            `),

            // Average backup duration per instance (parse numeric seconds from duration field)
            query(`
                SELECT i.name,
                       COUNT(b.id) AS total_backups,
                       b.duration
                FROM backups b
                JOIN instances i ON b.instance_id = i.id
                GROUP BY i.name, b.duration
                ORDER BY i.name
            `),

            // Backup status breakdown
            query(`
                SELECT status AS label, COUNT(*) AS value
                FROM backups
                GROUP BY status
            `)
        ]);

        // Build daily success rate (%) for last 7 days using local timezone
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            last7Days.push(`${year}-${month}-${day}`);
        }
        const dailyMap = {};
        dailyTrend.forEach(r => { dailyMap[r.day] = r; });

        const dailyLabels = last7Days.map(d => {
            const parts = d.split("-");
            return parts[2] + "-" + parts[1];
        });
        const dailySuccess = last7Days.map(d => {
            const row = dailyMap[d];
            if (!row) return null;
            const total = Number(row.success) + Number(row.failed);
            return total === 0 ? null : Math.round((Number(row.success) / total) * 100);
        });
        const dailyFailed = last7Days.map(d => {
            const row = dailyMap[d];
            if (!row) return null;
            const total = Number(row.success) + Number(row.failed);
            return total === 0 ? null : Math.round((Number(row.failed) / total) * 100);
        });

        // Weekly stacked bar
        const weeklyLabels = weeklyTrend.map((r, i) => {
            const d = new Date(r.week_start);
            return "Week of " + d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        });
        const weeklySuccess = weeklyTrend.map(r => Number(r.success));
        const weeklyFailed  = weeklyTrend.map(r => Number(r.failed));

        // DB distribution
        const dbLabels = dbDistribution.map(r => r.label);
        const dbValues = dbDistribution.map(r => Number(r.value));

        // Status breakdown (Success / Failed / Scheduled)
        const statusLabels = statusBreakdown.map(r => r.label);
        const statusValues = statusBreakdown.map(r => Number(r.value));

        // Per-instance backup count (for duration chart)
        const instMap = {};
        instanceDurations.forEach(r => {
            if (!instMap[r.name]) instMap[r.name] = 0;
            instMap[r.name] += r.total_backups;
        });
        const instLabels = Object.keys(instMap);
        const instValues = Object.values(instMap);

        res.json({
            dbDistribution:  { labels: dbLabels, values: dbValues },
            dailyTrend:      { labels: dailyLabels, success: dailySuccess, failed: dailyFailed },
            weeklyTrend:     { labels: weeklyLabels, success: weeklySuccess, failed: weeklyFailed },
            instanceBackups: { labels: instLabels, values: instValues },
            statusBreakdown: { labels: statusLabels, values: statusValues }
        });
    } catch (err) {
        console.error("Chart data error:", err);
        res.status(500).json({ error: err.message });
    }
};