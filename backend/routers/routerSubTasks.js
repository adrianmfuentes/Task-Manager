const express = require('express'); // Import Express to handle HTTP requests and routing
const routerSubtasks = express.Router(); // Create a new router object for subtask-related routes
const database = require("../database"); // Import the database module to interact with the MySQL database

// Confirms the project belongs to the authenticated user before letting them
// touch its subtasks.
async function assertOwnsProject(projectId, userId) {
    const projects = await database.query('SELECT id FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
    return projects.length > 0;
}

// Route to create a new subtask within a project
routerSubtasks.post('/:projectId/subtasks', async (req, res) => {
    const { task } = req.body; // Extract subtask text from the request body
    const projectId = req.params.projectId; // Extract the project ID from the request parameters
    const userId = req.infoInApiKey.id;

    // Validate that the subtask text is provided
    if (!task) {
        return res.status(400).json({ error: 'Task is required' }); // Return a 400 error if the text is missing
    }

    try {
        if (!(await assertOwnsProject(projectId, userId))) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Insert the new subtask into the database
        const result = await database.query(
            'INSERT INTO subtasks (project_id, task) VALUES (?, ?)',
            [projectId, task]
        );

        // Send success response with the new subtask ID
        res.status(201).json({ insertedId: result.insertId });

    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    }
});

// Route to retrieve all subtasks for a specific project
routerSubtasks.get('/:projectId/subtasks', async (req, res) => {
    const projectId = req.params.projectId; // Extract the project ID from the request parameters
    const userId = req.infoInApiKey.id;

    try {
        if (!(await assertOwnsProject(projectId, userId))) {
            return res.status(404).json({ error: 'Project not found' });
        }

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
    }
});

// Route to update a specific subtask by its ID
routerSubtasks.put('/:projectId/subtasks/:id', async (req, res) => {
    const subtaskId = req.params.id; // Extract the subtask ID from the request parameters
    const { task, completed } = req.body; // Extract the updated subtask details from the request body
    const projectId = req.params.projectId; // Extract the project ID from the request parameters
    const userId = req.infoInApiKey.id;

    try {
        if (!(await assertOwnsProject(projectId, userId))) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Update the subtask details in the database
        const result = await database.query(
            'UPDATE subtasks SET task = COALESCE(?, task), completed = COALESCE(?, completed) WHERE id = ? AND project_id = ?',
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
    }
});

// Route to delete a specific subtask by its ID
routerSubtasks.delete('/:projectId/subtasks/:id', async (req, res) => {
    const subtaskId = req.params.id; // Extract the subtask ID from the request parameters
    const projectId = req.params.projectId; // Extract the project ID from the request parameters
    const userId = req.infoInApiKey.id;

    try {
        if (!(await assertOwnsProject(projectId, userId))) {
            return res.status(404).json({ error: 'Project not found' });
        }

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
    }
});

module.exports = routerSubtasks; // Export the router for use in other parts of the application
