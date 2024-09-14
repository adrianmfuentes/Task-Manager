const mysql = require('mysql'); // Import MySQL library for interacting with the database
const util = require('util');   // Import util library for using utility functions, such as promisify

// Database object to manage the MySQL connection and queries
let database = {
    // Configuration object containing the connection details for the MySQL database
    configuration: {
        host: 'localhost',      // Host where the MySQL database is running
        user: 'root',           // MySQL user with necessary privileges
        password: '1926',       // Password for the MySQL user
        database: 'auctions',   // Name of the database to connect to
        multipleStatements: true, // Allow executing multiple SQL statements in a single query
        port: 3307              // Port on which MySQL is running (default is 3306, but here it is set to 3307)
    },
    connected: false,            // Flag to track connection status
    mysqlConnection: null,        // Variable to hold the MySQL connection object
    query: null,                  // Function for executing queries, which will be promisified

    // Method to establish a connection to the database
    connect() {
        // Check if already connected; if not, establish a connection
        if (this.connected == false) {
            this.connected = true; // Update connection status
            this.mysqlConnection = mysql.createConnection(this.configuration); // Create a MySQL connection using the configuration
            // Promisify the query method of the connection to allow the use of promises (instead of callbacks)
            this.query = util.promisify(this.mysqlConnection.query).bind(this.mysqlConnection);
        }
    },

    // Method to close the database connection
    disConnect() {
        // Check if currently connected; if so, close the connection
        if (this.connected == true) {
            this.connected = false; // Update connection status
            this.mysqlConnection.end(); // Close the MySQL connection
        }
    }
}

// Export the database object to be used in other parts of the application
module.exports = database;
