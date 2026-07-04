require('dotenv').config()
const express = require('express');
const helmet = require('helmet');
const cors = require('cors'); // Middleware for handling Cross-Origin Resource Sharing (CORS) requests
const jwt = require("jsonwebtoken"); // Library for generating and verifying JSON Web Tokens (JWT)
const rateLimit = require("express-rate-limit");
const activeApiKeys = require("./activeApiKeys"); // A module that stores active API keys
const { JWT_SECRET } = require("./config");

// Importing routers for handling specific routes
const routerUsers = require("./routers/routerUsers");
const routerTasks = require("./routers/routerTasks");
const routerSubTasks = require("./routers/routerSubTasks");
const routerProjects = require("./routers/routerProjects");

const server = express(); // Initialize Express server
const port = process.env.PORT || 4000; // Port on which the server will listen

server.set('trust proxy', 1);
server.use(helmet()); // Security-related HTTP headers

// Restrict CORS to an explicit allowlist when configured; otherwise allow all
// (handy for local development against a random frontend port).
const allowedOrigins = (process.env.CORS_ORIGIN || "").split(",").map(o => o.trim()).filter(Boolean);
server.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));

server.use(express.json({ limit: '100kb' })); // Middleware to parse incoming JSON requests
server.use(express.static('public')); // Serve static files from 'public' directory

// Slow down brute-force attempts against login/registration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later" },
});
server.use(["/users/login", "/users"], authLimiter);

// Middleware for validating API keys for specific routes
server.use(["/tasks", "/projects", "/subtasks"], (req, res, next) => {
  const apiKey = req.query.apiKey || req.get("apiKey"); // Extract API key from query params or header

  // If no API key is provided, return a 401 Unauthorized response
  if (!apiKey) {
    return res.status(401).json({ error: "No API key provided" });
  }

  try {
    // Verify the API key using the server's secret
    const infoInApiKey = jwt.verify(apiKey, JWT_SECRET);

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

server.get("/health", (req, res) => res.json({ status: "ok" }));

// Only bind a port when run directly (e.g. `node server.js`) - importing this
// module from tests should not start a real listener.
if (require.main === module) {
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`); // Log server start
  });
}

module.exports = server;
