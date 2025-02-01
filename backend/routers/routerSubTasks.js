const express = require('express'); // Import Express to handle HTTP requests and routing
const routerSubtasks = express.Router(); // Create a new router object for subtask-related routes
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
        await database.connect(); // Establish a connection to the database

        // Insert the new subtask into the database
        const result = await database.query(
            'INSERT INTO subtasks (project_id, title) VALUES (?, ?)',
            [projectId, title]
        );

        // Send success response with the new subtask ID
        res.status(201).json({ insertedId: result.insertId });

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    } finally {
        await database.disConnect(); // Ensure the database connection is closed
    }
});

// Route to retrieve all subtasks for a specific project
routerSubtasks.get('/:projectId/subtasks', async (req, res) => {
    const projectId = req.params.projectId; // Extract the project ID from the request parameters

    try {
        await database.connect(); // Establish a connection to the database

        // Fetch all subtasks for the specified project from the database
        const subtasks = await database.query(
            'SELECT * FROM subtasks WHERE project_id = ?',
            [projectId]
        );

        // Send the list of subtasks as a JSON response
        res.json(subtasks);

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    } finally {
        await database.disConnect(); // Ensure the database connection is closed
    }
});

// Route to update a specific subtask by its ID
routerSubtasks.put('/:projectId/subtasks/:id', async (req, res) => {
    const subtaskId = req.params.id; // Extract the subtask ID from the request parameters
    const { task, completed } = req.body; // Extract the updated subtask details from the request body
    const projectId = req.params.projectId; // Extract the project ID from the request parameters

    try {
        await database.connect(); // Establish a connection to the database

        // Update the subtask details in the database
        const result = await database.query(
            'UPDATE subtasks SET title = ?, completed = ? WHERE id = ? AND project_id = ?',
            [task, completed, subtaskId, projectId]
        );

        // If no rows were affected, return a 404 error
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Subtask not found or no changes made' });
        }

        // Send success response indicating the subtask was updated
        res.json({ updated: true });

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    } finally {
        await database.disConnect(); // Ensure the database connection is closed
    }
});

// Route to delete a specific subtask by its ID
routerSubtasks.delete('/:projectId/subtasks/:id', async (req, res) => {
    const subtaskId = req.params.id; // Extract the subtask ID from the request parameters
    const projectId = req.params.projectId; // Extract the project ID from the request parameters

    try {
        await database.connect(); // Establish a connection to the database

        // Delete the subtask from the database
        const result = await database.query(
            'DELETE FROM subtasks WHERE id = ? AND project_id = ?',
            [subtaskId, projectId]
        );

        // If no rows were affected, return a 404 error
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Subtask not found' });
        }

        // Send success response indicating the subtask was deleted
        res.json({ deleted: true });

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    } finally {
        await database.disConnect(); // Ensure the database connection is closed
    }
});

module.exports = routerSubtasks; // Export the router for use in other parts of the application
