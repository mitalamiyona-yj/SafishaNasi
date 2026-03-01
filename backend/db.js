// backend/db.js
const mysql = require('mysql2');

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'safi_shanasi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Export promise-based pool
module.exports = pool.promise();