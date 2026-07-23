require('dotenv').config();
const db = require('./config/db');
const sql = "SELECT backup_size FROM backups WHERE status='Success' AND DATE(backup_date)=CURDATE()";
db.query(sql, (err, rows) => {
  if (err) {
    console.error(err.message);
    process.exit(1);
  }
  console.log(JSON.stringify(rows));
  db.end();
});
