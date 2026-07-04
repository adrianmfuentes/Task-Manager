const express = require('express'); // Import Express for handling HTTP requests and routing

const routerTasks = express.Router(); // Create a new router object for handling task-related routes
const database = require("../database"); // Import the database module to interact with the MySQL database

const VALID_STATUSES = ['pending', 'in-progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// Route to create a new task
routerTasks.post('/', async (req, res) => {
    const { title, description, priority, dateFinish } = req.body; // Extract task details from the request body
    const userId = req.infoInApiKey.id; // Retrieve the authenticated user's ID from the API key

    // Validate that the title is provided
    if (!title) {
        return res.status(400).json({ error: 'Title is required' }); // Return a 400 error if the title is missing
    }

    try {
        // Insert the new task into the database
        const result = await database.query(
            'INSERT INTO tasks (user_id, title, description, status, priority, dateFinish) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, title, description, 'pending', priority, dateFinish]
        );

        res.status(201).json({ insertedId: result.insertId }); // Return the ID of the newly created task

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    }
});

// Route to retrieve all tasks for the authenticated user
routerTasks.get('/', async (req, res) => {
    const userId = req.infoInApiKey.id; // Retrieve the authenticated user's ID from the API key

    try {
        // Fetch all tasks for the authenticated user from the database
        const tasks = await database.query(
            'SELECT * FROM tasks WHERE user_id = ?',
            [userId]
        );

        res.json(tasks); // Return the list of tasks as a JSON response

    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    }
});

// Route to retrieve a specific task by its ID
routerTasks.get('/:id', async (req, res) => {
    const taskId = req.params.id; // Extract the task ID from the request parameters
    const userId = req.infoInApiKey.id; // Retrieve the authenticated user's ID from the API key

    try {
        // Fetch the specific task by ID and user ID
        const tasks = await database.query(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        );

        // Check if the task exists, otherwise return a 404 error
        if (tasks.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(tasks[0]); // Return the task details as a JSON response

    } catch (error) {
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    }
});

// Route to update a specific task by its ID. Only fields present in the body
// are changed - e.g. sending just { status } won't blank out the rest.
routerTasks.put('/:id', async (req, res) => {
    const taskId = req.params.id; // Extract the task ID from the request parameters
    const { title, description, priority, dateFinish, status } = req.body; // Extract task details from the request body
    const userId = req.infoInApiKey.id; // Retrieve the authenticated user's ID from the API key

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: `priority must be one of: ${VALID_PRIORITIES.join(', ')}` });
    }

    try {
        // Update only the fields that were actually provided
        const result = await database.query(
            `UPDATE tasks SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                priority = COALESCE(?, priority),
                dateFinish = COALESCE(?, dateFinish),
                status = COALESCE(?, status)
             WHERE id = ? AND user_id = ?`,
            [title, description, priority, dateFinish, status, taskId, userId]
        );

        // Check if any rows were affected, otherwise return a 404 error
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ updated: true }); // Return a success response indicating the task was updated

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    }
});

// Route to delete a specific task by its ID
routerTasks.delete('/:id', async (req, res) => {
    const taskId = req.params.id; // Extract the task ID from the request parameters
    const userId = req.infoInApiKey.id; // Retrieve the authenticated user's ID from the API key

    try {
        // Delete the task from the database
        const result = await database.query(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        );

        // Check if any rows were affected, otherwise return a 404 error
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ deleted: true }); // Return a success response indicating the task was deleted

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    }
});

module.exports = routerTasks; // Export the router for use in other parts of the application
