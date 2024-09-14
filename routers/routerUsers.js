const express = require('express'); // Import Express for handling HTTP requests and routing

const routerUsers = express.Router(); // Create a new router object for handling user-related routes
const database = require("../database"); // Import the database module to interact with the MySQL database

const activeApiKeys = require("../activeApiKeys"); // Import the module that manages active API keys
const jwt = require("jsonwebtoken"); // Import JSON Web Token (JWT) library for token creation and verification

// Route to handle user login
routerUsers.post("/login", async (req, res) => {
    // Extract email and password from the request body
    let email = req.body.email;
    let password = req.body.password;
    let errors = [];

    // Validate the presence of email and password in the request
    if (email == undefined) {
        errors.push("no email in body");
    }
    if (password == undefined) {
        errors.push("no password in body");
    }

    // If validation fails, return a 400 Bad Request response with error details
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }

    database.connect(); // Establish a connection to the database

    let selectedUsers = null;
    try {
        // Query the database for a user matching the provided email and password
        selectedUsers = await database.query(
            'SELECT id, email FROM users WHERE email = ? AND password = ?',
            [email, password]
        );

    } catch (e) {
        database.disConnect(); // Disconnect from the database if an error occurs
        return res.status(400).json({ error: e }); // Return the error in the response
    }

    // If no matching user is found, return a 401 Unauthorized response
    if (selectedUsers.length == 0) {
        return res.status(401).json({ error: "invalid email or password" });
    }

    database.disConnect(); // Disconnect from the database after the query is completed

    // Generate an API key using JWT, embedding the user's email and id in the token
    let apiKey = jwt.sign(
        { 
            email: selectedUsers[0].email,
            id: selectedUsers[0].id
        },
        "secret" // Secret key used for signing the token
    );
    activeApiKeys.push(apiKey); // Add the generated API key to the active keys list

    // Respond with the generated API key and the user's email and id
    res.json({
        apiKey: apiKey,
        id: selectedUsers[0].id,
        email: selectedUsers[0].email,
    });
});

// Route to handle user disconnection (logout)
routerUsers.get("/disconect", async (req, res) => {
    const index = activeApiKeys.indexOf(req.query.apiKey); // Find the index of the provided API key
    if (index > -1) {
        activeApiKeys.splice(index, 1); // Remove the API key from the active keys list
        res.json({ removed: true }); // Respond with success
    } else {
        return res.status(400).json({ error: "user not found" }); // Return an error if the API key was not found
    }
});

// Route to handle user registration
routerUsers.post("/", async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    let errors = [];

    // Validate the presence of email and password in the request
    if (email == undefined) {
        errors.push("no email in body");
    }
    if (password == undefined) {
        errors.push("no password in body");
    }

    // If validation fails, return a 400 Bad Request response with error details
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }

    database.connect(); // Establish a connection to the database

    let insertedUser = null;
    try {
        // Check if there is already a user with the same email in the database
        userWithSameEmail = await database.query(
            'SELECT email FROM users WHERE email = ?',
            [email]
        );

        // If a user with the same email exists, return a 400 Bad Request response
        if (userWithSameEmail.length > 0) {
            database.disConnect(); // Disconnect from the database
            return res.status(400).json({ error: "Already a user with that email" });
        }

        // Insert the new user into the database
        insertedUser = await database.query(
            'INSERT INTO users (email, password) VALUES (?,?)',
            [email, password]
        );

    } catch (e) {
        database.disConnect(); // Disconnect from the database if an error occurs
        return res.status(400).json({ error: e }); // Return the error in the response
    }

    database.disConnect(); // Disconnect from the database after the query is completed
    res.json({ inserted: insertedUser }); // Respond with the result of the insertion
});

module.exports = routerUsers; // Export the router to be used in other parts of the application
