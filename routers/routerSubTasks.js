const express = require('express'); // Import Express to handle HTTP requests and routing
const routerSubtasks = express.Router(); // Create a new router object to handle subtask-related routes
const database = require("../database"); // Import the database module to interact with the MySQL database

// Route to create a new subtask within a project
routerSubtasks.post('/:projectId/subtasks', async (req, res) => {
    const { title } = req.body; // Extract subtask title from the request body
    const projectId = req.params.projectId; // Extract the project ID from the request parameters

    // Validate that the subtask title is provided
    if (!title) {
        return res.status(400).json({ error: 'Title is required' }); // Return a 400 error if the title is missing
    }

    try {
        database.connect(); // Establish a connection to the database

        // Insert the new subtask into the database
        const result = await database.query(
            'INSERT INTO subtasks (project_id, title) VALUES (?, ?)',
            [projectId, title]
        );

        database.disConnect(); // Disconnect from the database after the operation
        res.status(201).json({ insertedId: result.insertId }); // Return the ID of the newly created subtask

    } catch (error) {
        database.disConnect(); // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }); // Return a 500 error if the database operation fails
    }
});

// Route to retrieve all subtasks for a specific project
routerSubtasks.get('/:projectId/subtasks', async (req, res) => {
    const projectId = req.params.projectId; // Extract the project ID from the request parameters

    try {
        database.connect(); // Establish a connection to the database

        // Fetch all subtasks for the specified project from the database
        const subtasks = await database.query(
            'SELECT * FROM subtasks WHERE project_id = ?',
            [projectId]
        );

        database.disConnect(); // Disconnect from the database after the operation
        res.json(subtasks); // Return the list of subtasks as a JSON response

    } catch (error) {
        database.disConnect(); // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }); // Return a 500 error if the database operation fails
    }
});

// Route to update a specific subtask by its ID
routerSubtasks.put('/:projectId/subtasks/:id', async (req, res) => {
    const subtaskId = req.params.id; // Extract the subtask ID from the request parameters
    const { title, status } = req.body; // Extract the updated subtask details from the request body
    const projectId = req.params.projectId; // Extract the project ID from the request parameters

    try {
        database.connect(); // Establish a connection to the database

        // Update the subtask details in the database
        const result = await database.query(
            'UPDATE subtasks SET title = ?, status = ? WHERE id = ? AND project_id = ?',
            [title, status, subtaskId, projectId]
        );

        database.disConnect(); // Disconnect from the database after the operation

        // Check if any rows were affected, otherwise return a 404 error
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Subtask not found or no changes made' });
        }

        res.json({ updated: true }); // Return a success response indicating the subtask was updated

    } catch (error) {
        database.disConnect(); // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }); // Return a 500 error if the database operation fails
    }
});

// Route to delete a specific subtask by its ID
routerSubtasks.delete('/:projectId/subtasks/:id', async (req, res) => {
    const subtaskId = req.params.id; // Extract the subtask ID from the request parameters
    const projectId = req.params.projectId; // Extract the project ID from the request parameters

    try {
        database.connect(); // Establish a connection to the database

        // Delete the subtask from the database
        const result = await database.query(
            'DELETE FROM subtasks WHERE id = ? AND project_id = ?',
            [subtaskId, projectId]
        );

        database.disConnect(); // Disconnect from the database after the operation

        // Check if any rows were affected, otherwise return a 404 error
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Subtask not found' });
        }

        res.json({ deleted: true }); // Return a success response indicating the subtask was deleted

    } catch (error) {
        database.disConnect(); // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }); // Return a 500 error if the database operation fails
    }
});

module.exports = routerSubtasks; // Export the router for use in other parts of the application
