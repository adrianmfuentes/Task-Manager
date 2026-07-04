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
    }
});

// Route to retrieve all projects for the authenticated user with their subtasks
routerProjects.get('/', async (req, res) => {
    const userId = req.infoInApiKey.id;

    try {
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
    }
});

// Route to retrieve a specific project by its ID
routerProjects.get('/:id', async (req, res) => {
    const projectId = req.params.id;
    const userId = req.infoInApiKey.id;

    try {
        const project = await database.query('SELECT * FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);

        if (project.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const subtasks = await database.query('SELECT * FROM subtasks WHERE project_id = ?', [projectId]);

        res.json({ ...project[0], subtasks }); // Return the project details along with its subtasks
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    }
});

// Route to update a specific project by its ID, including subtasks. Only
// fields present in the body are changed, and subtasks are only replaced
// when a subtasks array is explicitly sent (so a status-only update doesn't
// wipe the checklist).
routerProjects.put('/:id', async (req, res) => {
    const projectId = req.params.id;
    const { title, description, dateFinish, subtasks, completed } = req.body;
    const userId = req.infoInApiKey.id;

    try {
        const result = await database.query(
            `UPDATE projects SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                dateFinish = COALESCE(?, dateFinish),
                completed = COALESCE(?, completed)
             WHERE id = ? AND user_id = ?`,
            [title, description, dateFinish, completed, projectId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Replace subtasks only when a new list was explicitly provided
        if (Array.isArray(subtasks)) {
            await database.query('DELETE FROM subtasks WHERE project_id = ?', [projectId]);

            if (subtasks.length > 0) {
                const subtaskValues = subtasks.map(subtask => [projectId, subtask.task, Boolean(subtask.completed)]);
                await database.query('INSERT INTO subtasks (project_id, task, completed) VALUES ?', [subtaskValues]);
            }
        }

        res.json({ updated: true }); // Return a success response
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    }
});

// Route to delete a specific project by its ID along with its subtasks
routerProjects.delete('/:id', async (req, res) => {
    const projectId = req.params.id;
    const userId = req.infoInApiKey.id;

    try {
        // Only touch subtasks/delete the project if it actually belongs to this user
        const project = await database.query('SELECT id FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
        if (project.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        await database.query('DELETE FROM subtasks WHERE project_id = ?', [projectId]);
        await database.query('DELETE FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);

        res.json({ deleted: true }); // Return a success response indicating the project was deleted
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Database error', details: error.message }); // Return a 500 error if the database operation fails
    }
});

module.exports = routerProjects; // Export the router for use in other parts of the application
