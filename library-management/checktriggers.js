const mysql = require('mysql2');

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Srishtiturki@11',
  database: 'LIBRARY_MANAGEMENT'
});

// Query to show triggers
const sql = "SHOW TRIGGERS";

connection.query(sql, (err, results) => {
  if (err) {
    console.error('Error fetching triggers:', err);
  } else {
    console.log('Triggers:', results);
  }

  connection.end(); // close connection
});
