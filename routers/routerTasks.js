const express = require('express') // Import Express for handling HTTP requests and routing

const routerTasks = express.Router() // Create a new router object for handling task-related routes
const database = require("../database") // Import the database module to interact with the MySQL database

// Route to create a new task
routerTasks.post('/', async (req, res) => {
    const { title, description, status, priority, due_date } = req.body // Extract task details from the request body
    const userId = req.infoInApiKey.id // Retrieve the authenticated user's ID from the API key

    // Validate that the title is provided
    if (!title) {
        return res.status(400).json({ error: 'Title is required' }) // Return a 400 error if the title is missing
    }

    try {
        database.connect() // Establish a connection to the database

        // Insert the new task into the database
        const result = await database.query(
            'INSERT INTO tasks (user_id, title, description, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, description, status || 'pending', priority || 'medium', due_date]
        )

        database.disConnect() // Disconnect from the database after the operation
        res.status(201).json({ insertedId: result.insertId }) // Return the ID of the newly created task

    } catch (error) {
        database.disConnect() // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }) // Return a 500 error if the database operation fails
    }
})

// Route to retrieve all tasks for the authenticated user
routerTasks.get('/', async (req, res) => {
    const userId = req.infoInApiKey.id // Retrieve the authenticated user's ID from the API key

    try {
        database.connect() // Establish a connection to the database

        // Fetch all tasks for the authenticated user from the database
        const tasks = await database.query(
            'SELECT * FROM tasks WHERE user_id = ?',
            [userId]
        )

        database.disConnect() // Disconnect from the database after the operation
        res.json(tasks) // Return the list of tasks as a JSON response

    } catch (error) {
        database.disConnect() // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }) // Return a 500 error if the database operation fails
    }
})

// Route to retrieve a specific task by its ID
routerTasks.get('/:id', async (req, res) => {
    const taskId = req.params.id // Extract the task ID from the request parameters
    const userId = req.infoInApiKey.id // Retrieve the authenticated user's ID from the API key

    try {
        database.connect() // Establish a connection to the database

        // Fetch the specific task by ID and user ID
        const tasks = await database.query(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        )

        database.disConnect() // Disconnect from the database after the operation

        // Check if the task exists, otherwise return a 404 error
        if (tasks.length === 0) {
            return res.status(404).json({ error: 'Task not found' })
        }

        res.json(tasks[0]) // Return the task details as a JSON response

    } catch (error) {
        database.disConnect() // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }) // Return a 500 error if the database operation fails
    }
})

// Route to update a specific task by its ID
routerTasks.put('/:id', async (req, res) => {
    const taskId = req.params.id // Extract the task ID from the request parameters
    const { title, description, status, priority, due_date } = req.body // Extract task details from the request body
    const userId = req.infoInApiKey.id // Retrieve the authenticated user's ID from the API key

    try {
        database.connect() // Establish a connection to the database

        // Update the task details in the database
        const result = await database.query(
            'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?',
            [title, description, status, priority, due_date, taskId, userId]
        )

        database.disConnect() // Disconnect from the database after the operation

        // Check if any rows were affected, otherwise return a 404 error
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found or no changes made' })
        }

        res.json({ updated: true }) // Return a success response indicating the task was updated

    } catch (error) {
        database.disConnect() // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }) // Return a 500 error if the database operation fails
    }
})

// Route to delete a specific task by its ID
routerTasks.delete('/:id', async (req, res) => {
    const taskId = req.params.id // Extract the task ID from the request parameters
    const userId = req.infoInApiKey.id // Retrieve the authenticated user's ID from the API key

    try {
        database.connect() // Establish a connection to the database

        // Delete the task from the database
        const result = await database.query(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        )

        database.disConnect() // Disconnect from the database after the operation

        // Check if any rows were affected, otherwise return a 404 error
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' })
        }

        res.json({ deleted: true }) // Return a success response indicating the task was deleted

    } catch (error) {
        database.disConnect() // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }) // Return a 500 error if the database operation fails
    }
})

module.exports = routerTasks // Export the router for use in other parts of the application
