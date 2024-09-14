const express = require('express')
const jwt = require("jsonwebtoken") // Library for generating and verifying JSON Web Tokens (JWT)
const activeApiKeys = require("./activeApiKeys") // A module that stores active API keys
const database = require("./database") // Database connection and utilities module

// Importing routers for handling specific routes
const routerUsers = require("./routers/routerUsers")
const routerTasks = require("./routers/routerTasks")
const routerSubTasks = require("./routers/routerSubTasks")
const routerProjects = require("./routers/routerProjects")

const app = express() // Initialize Express app
const port = 4000 // Port on which the server will listen

const cors = require('cors') // Middleware for handling Cross-Origin Resource Sharing (CORS) requests

app.use(cors()) // Enable CORS for all routes
app.use(express.json()) // Middleware to parse incoming JSON requests

// Optimized Middleware for validating API keys for specific routes
app.use(["/tasks", "/projects"], (req, res, next) => {
  console.log("Middleware execution")

  const apiKey = req.query.apiKey // Extract API key from query parameters

  // If no API key is provided, return a 401 Unauthorized response
  if (!apiKey) {
    return res.status(401).json({ error: "No API key provided" })
  }

  try {
    // Verify the API key using a secret key
    const infoInApiKey = jwt.verify(apiKey, "secret")

    // Check if the API key is active
    if (!activeApiKeys.includes(apiKey)) {
      return res.status(401).json({ error: "Invalid or inactive API key" })
    }

    // Store decrypted API key info in the request object for use in subsequent middleware or routes
    req.infoInApiKey = infoInApiKey
    next() // Pass control to the next middleware or route handler
  } catch (error) {
    // If JWT verification fails, return a 401 Unauthorized response
    return res.status(401).json({ error: "Invalid API key", details: error.message })
  }
})

// Attach the user, tasks, subtasks, and projects routers to their respective paths
app.use("/users", routerUsers)
app.use("/tasks", routerTasks)
app.use("/subtasks", routerSubTasks)
app.use("/projects", routerProjects)

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
