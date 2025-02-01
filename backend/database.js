const mysql = require('mysql2'); // Import mysql2 for native promise support
const util = require('util');     // Import util for utility functions

// Database object to manage MySQL connection and queries
const database = {
    // Configuration object for MySQL connection
    configuration: {
        host: process.env.DB_HOST || 'localhost', // Database host
        user: process.env.DB_USER || 'root',      // Database user
        password: process.env.DB_PASSWORD || '1926', // User password
        database: process.env.DB_NAME || 'task-manager', // Database name
        multipleStatements: true, // Allow multiple SQL statements in a single query
        port: process.env.DB_PORT || 3306 // Database port (default 3306)
    },
    connected: false,            // Connection status flag
    mysqlConnection: null,       // MySQL connection instance
    query: null,                 // Function for executing queries

    /**
     * Establishes a connection to the MySQL database.
     * Sets up the query method to be promisified for async operations.
     */
    connect() {
        if (!this.connected) {
            this.connected = true; // Update connection status
            this.mysqlConnection = mysql.createConnection(this.configuration); // Create MySQL connection
            this.query = util.promisify(this.mysqlConnection.query).bind(this.mysqlConnection); // Promisify query method

            // Connect to the database
            this.mysqlConnection.connect(err => {
                if (err) {
                    console.error('Database connection failed: ', err); // Log connection error
                    this.connected = false; // Reset connection status on failure
                } else {
                    console.log('Database connected successfully'); // Log successful connection
                }
            });
        }
    },

    /**
     * Closes the connection to the MySQL database if currently connected.
     */
    disConnect() {
        // Check if currently connected and if the connection is not already closed
        if (this.connected && this.mysqlConnection) {
            this.connected = false; // Update connection status
            this.mysqlConnection.end(err => {
                if (err) {
                    console.error('Error while disconnecting: ', err); // Log disconnection error
                } else {
                    console.log('Database disconnected successfully'); // Log successful disconnection
                }
            });
        } else {
            console.log('Database was already disconnected or connection object is not set');
        }
    }    
};

module.exports = database; // Export the database object for use in other modules
