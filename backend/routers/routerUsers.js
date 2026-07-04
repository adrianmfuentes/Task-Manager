const express = require('express'); // Import Express for handling HTTP requests and routing
const bcrypt = require('bcryptjs');

const routerUsers = express.Router(); // Create a new router object for handling user-related routes
const database = require("../database"); // Import the database module to interact with the MySQL database
const activeApiKeys = require("../activeApiKeys"); // Import the module that manages active API keys
const jwt = require("jsonwebtoken"); // Import JSON Web Token (JWT) library for token creation and verification
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 10;

// Route to handle user login
routerUsers.post("/login", async (req, res) => {
    // Extract email and password from the request body
    const { email, password } = req.body;
    const errors = []; // Array to hold validation errors

    // Validate the presence of email and password in the request
    if (!email) errors.push("no email in body");
    if (!password) errors.push("no password in body");

    // If validation fails, return a 400 Bad Request response with error details
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }

    try {
        // Query the database for a user matching the provided email
        const selectedUsers = await database.query(
            'SELECT id, email, password FROM users WHERE email = ?',
            [email]
        );

        // If no matching user is found, return a 401 Unauthorized response
        if (selectedUsers.length === 0) {
            return res.status(401).json({ error: "invalid email or password" });
        }

        const user = selectedUsers[0];
        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return res.status(401).json({ error: "invalid email or password" });
        }

        // Generate an API key using JWT, embedding the user's email and id in the token
        const apiKey = jwt.sign(
            {
                email: user.email,
                id: user.id
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        activeApiKeys.push(apiKey); // Add the generated API key to the active keys list

        // Respond with the generated API key and the user's email and id
        res.json({
            apiKey,
            id: user.id,
            email: user.email,
        });
    } catch (e) {
        return res.status(500).json({ error: "Database error", details: e.message });
    }
});

// Route to handle user disconnection (logout)
routerUsers.get("/disconnect", async (req, res) => {
    const { apiKey } = req.query; // Extract the API key from query parameters
    const index = activeApiKeys.indexOf(apiKey); // Find the index of the provided API key

    if (index > -1) {
        activeApiKeys.splice(index, 1); // Remove the API key from the active keys list
        return res.json({ removed: true }); // Respond with success
    }

    return res.status(400).json({ error: "user not found" }); // Return an error if the API key was not found
});

// Route to handle user registration
routerUsers.post("/", async (req, res) => {
    const { email, password } = req.body;
    const errors = []; // Array to hold validation errors

    // Validate the presence and format of email and password in the request
    if (!email) errors.push("no email in body");
    else if (!emailPattern.test(email)) errors.push("invalid email format");

    if (!password) errors.push("no password in body");
    else if (password.length < 5) errors.push("password must be at least 5 characters long");

    // If validation fails, return a 400 Bad Request response with error details
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }

    try {
        // Check if there is already a user with the same email in the database
        const userWithSameEmail = await database.query(
            'SELECT email FROM users WHERE email = ?',
            [email]
        );

        // If a user with the same email exists, return a 400 Bad Request response
        if (userWithSameEmail.length > 0) {
            return res.status(400).json({ error: "Already a user with that email" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert the new user into the database
        const insertedUser = await database.query(
            'INSERT INTO users (email, password) VALUES (?,?)',
            [email, hashedPassword]
        );

        return res.json({ inserted: insertedUser }); // Respond with the result of the insertion

    } catch (e) {
        return res.status(400).json({ error: e.message }); // Return the error in the response
    }
});

module.exports = routerUsers; // Export the router to be used in other parts of the application
