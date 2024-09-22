require('dotenv').config()
const express = require('express');
const jwt = require("jsonwebtoken"); // Library for generating and verifying JSON Web Tokens (JWT)
const activeApiKeys = require("./activeApiKeys"); // A module that stores active API keys

// Importing routers for handling specific routes
const routerUsers = require("./routers/routerUsers");
const routerTasks = require("./routers/routerTasks");
const routerSubTasks = require("./routers/routerSubTasks");
const routerProjects = require("./routers/routerProjects");

const server = express(); // Initialize Express server
const port = 4000; // Port on which the server will listen

const cors = require('cors'); // Middleware for handling Cross-Origin Resource Sharing (CORS) requests

server.use(cors()); // Enable CORS for all routes
server.use(express.json()); // Middleware to parse incoming JSON requests
server.use(express.static('public')); // Serve static files from 'public' directory

// Optimized Middleware for validating API keys for specific routes
server.use(["/tasks", "/projects"], (req, res, next) => {
  console.log("Middleware execution"); // Log for debugging

  const apiKey = req.query.apiKey; // Extract API key from query parameters

  // If no API key is provided, return a 401 Unauthorized response
  if (!apiKey) {
    return res.status(401).json({ error: "No API key provided" });
  }

  try {
    // Verify the API key using a secret key
    const infoInApiKey = jwt.verify(apiKey, "secret");

    // Check if the API key is active
    if (!activeApiKeys.includes(apiKey)) {
      return res.status(401).json({ error: "Invalid or inactive API key" });
    }

    // Store decrypted API key info in the request object for use in subsequent middleware or routes
    req.infoInApiKey = infoInApiKey;
    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    // If JWT verification fails, return a 401 Unauthorized response
    return res.status(401).json({ error: "Invalid API key", details: error.message });
  }
});

// Attach the user, tasks, subtasks, and projects routers to their respective paths
server.use("/users", routerUsers);
server.use("/tasks", routerTasks);
server.use("/subtasks", routerSubTasks);
server.use("/projects", routerProjects);

// Start the server and listen on the specified port
server.listen(port, () => {
  console.log(`Server listening on port ${port}`); // Log server start
});
