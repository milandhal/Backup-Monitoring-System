const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.query('SELECT COUNT(*) AS cnt, status FROM backups GROUP BY status', (err, results) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Backup Counts by Status:', results);
  }
  
  connection.query('SELECT COUNT(*) AS cnt FROM instances WHERE status = "Disconnected"', (err, instResults) => {
    if (err) {
      console.error('Error:', err);
    } else {
      console.log('Disconnected Instances:', instResults);
    }
    
    connection.query('SELECT * FROM backups ORDER BY id DESC LIMIT 5', (err, recentBackups) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Recent Backups:', recentBackups);
      }
      connection.end();
    });
  });
});
