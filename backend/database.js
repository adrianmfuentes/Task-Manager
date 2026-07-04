const mysql = require('mysql2/promise'); // Promise-native MySQL client

// Connection pool shared across the app - avoids the overhead and race
// conditions of opening/closing a raw connection on every request.
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'task-manager',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

const database = {
    /**
     * Runs a query against the pool and returns just the rows/result,
     * matching the shape the routers already expect.
     */
    async query(sql, params) {
        const [rows] = await pool.query(sql, params);
        return rows;
    },
};

module.exports = database;
