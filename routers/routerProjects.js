const express = require('express'); // Import Express for handling HTTP requests and routing
const routerProjects = express.Router(); // Create a new router object for handling project-related routes
const database = require("../database"); // Import the database module to interact with the MySQL database

// Route to create a new project with optional subtasks
routerProjects.post('/', async (req, res) => {
    const { title, description, dateFinish, subtasks } = req.body;
    const userId = req.infoInApiKey.id;

    // Validate that the title is provided
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }

    try {
        await database.connect(); // Establish a connection to the database
        const result = await database.query(
            'INSERT INTO projects (user_id, title, description, dateFinish) VALUES (?, ?, ?, ?)',
            [userId, title, description, dateFinish]
        );

        const projectId = result.insertId;

        // If subtasks are provided, insert them into the database
        if (Array.isArray(subtasks) && subtasks.length > 0) {
            const subtaskValues = subtasks.map(subtask => [projectId, subtask.task, false]);
            await database.query(
                'INSERT INTO subtasks (project_id, task, completed) VALUES ?',
                [subtaskValues]
            );
        }

        res.status(201).json({ insertedId: projectId }); // Return the ID of the newly created project
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    } finally {
        database.disConnect(); // Ensure the database is disconnected
    }
});

// Route to retrieve all projects for the authenticated user with their subtasks
routerProjects.get('/', async (req, res) => {
    const userId = req.infoInApiKey.id;

    try {
        await database.connect(); // Establish a connection to the database
        const projects = await database.query('SELECT * FROM projects WHERE user_id = ?', [userId]);

        if (projects.length === 0) {
            return res.json([]); // Return an empty array if no projects are found
        }

        const projectIds = projects.map(p => p.id);
        const subtasks = await database.query('SELECT * FROM subtasks WHERE project_id IN (?)', [projectIds]);

        // Combine projects with their respective subtasks
        const projectsWithSubtasks = projects.map(project => ({
            ...project,
            subtasks: subtasks.filter(subtask => subtask.project_id === project.id)
        }));

        res.json(projectsWithSubtasks); // Return the combined data
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    } finally {
        database.disConnect(); // Ensure the database is disconnected
    }
});

// Route to retrieve a specific project by its ID
routerProjects.get('/:id', async (req, res) => {
    const projectId = req.params.id;
    const userId = req.infoInApiKey.id;

    try {
        await database.connect(); // Establish a connection to the database
        const project = await database.query('SELECT * FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);

        if (project.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const subtasks = await database.query('SELECT * FROM subtasks WHERE project_id = ?', [projectId]);

        res.json({ ...project[0], subtasks }); // Return the project details along with its subtasks
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    } finally {
        database.disConnect(); // Ensure the database is disconnected
    }
});

// Route to update a specific project by its ID, including subtasks
routerProjects.put('/:id', async (req, res) => {
    const projectId = req.params.id;
    const { title, description, dateFinish, subtasks } = req.body;
    const userId = req.infoInApiKey.id;

    try {
        await database.connect(); // Establish a connection to the database
        const result = await database.query(
            'UPDATE projects SET title = ?, description = ?, dateFinish = ? WHERE id = ? AND user_id = ?',
            [title, description, dateFinish, projectId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found or no changes made' });
        }

        // Delete existing subtasks before updating
        await database.query('DELETE FROM subtasks WHERE project_id = ?', [projectId]);

        // If new subtasks are provided, insert them into the database
        if (Array.isArray(subtasks) && subtasks.length > 0) {
            const subtaskValues = subtasks.map(subtask => [projectId, subtask.task, Boolean(subtask.completed)]);
            await database.query('INSERT INTO subtasks (project_id, task, completed) VALUES ?', [subtaskValues]);
        }

        res.json({ updated: true }); // Return a success response
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    } finally {
        database.disConnect(); // Ensure the database is disconnected
    }
});

// Route to delete a specific project by its ID along with its subtasks
routerProjects.delete('/:id', async (req, res) => {
    const projectId = req.params.id;
    const userId = req.infoInApiKey.id;

    try {
        await database.connect(); // Establish a connection to the database

        // First, delete all subtasks associated with the project
        await database.query('DELETE FROM subtasks WHERE project_id = ?', [projectId]);

        // Then, delete the project itself
        const result = await database.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ deleted: true }); // Return a success response indicating the project was deleted
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    } finally {
        database.disConnect(); // Ensure the database is disconnected
    }
});

module.exports = routerProjects; // Export the router for use in other parts of the application
