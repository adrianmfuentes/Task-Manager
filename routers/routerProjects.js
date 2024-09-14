const express = require('express'); // Import Express to handle HTTP requests and routing
const routerProjects = express.Router(); // Create a new router object to handle project-related routes
const database = require("../database"); // Import the database module to interact with the MySQL database

// Route to create a new project
routerProjects.post('/', async (req, res) => {
    const { name, description, start_date, end_date } = req.body; // Extract project details from the request body
    const userId = req.infoInApiKey.id; // Retrieve the authenticated user's ID from the API key

    // Validate that the project name is provided
    if (!name) {
        return res.status(400).json({ error: 'Name is required' }); // Return a 400 error if the name is missing
    }

    try {
        database.connect(); // Establish a connection to the database

        // Insert the new project into the database
        const result = await database.query(
            'INSERT INTO projects (user_id, name, description, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
            [userId, name, description, start_date, end_date]
        );

        database.disConnect(); // Disconnect from the database after the operation
        res.status(201).json({ insertedId: result.insertId }); // Return the ID of the newly created project

    } catch (error) {
        database.disConnect(); // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }); // Return a 500 error if the database operation fails
    }
});

// Route to retrieve all projects for the authenticated user
routerProjects.get('/', async (req, res) => {
    const userId = req.infoInApiKey.id; // Retrieve the authenticated user's ID from the API key

    try {
        database.connect(); // Establish a connection to the database

        // Fetch all projects for the authenticated user from the database
        const projects = await database.query(
            'SELECT * FROM projects WHERE user_id = ?',
            [userId]
        );

        database.disConnect(); // Disconnect from the database after the operation
        res.json(projects); // Return the list of projects as a JSON response

    } catch (error) {
        database.disConnect(); // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }); // Return a 500 error if the database operation fails
    }
});

// Route to retrieve a specific project by its ID
routerProjects.get('/:id', async (req, res) => {
    const projectId = req.params.id; // Extract the project ID from the request parameters
    const userId = req.infoInApiKey.id; // Retrieve the authenticated user's ID from the API key

    try {
        database.connect(); // Establish a connection to the database

        // Fetch the specific project by ID and user ID
        const projects = await database.query(
            'SELECT * FROM projects WHERE id = ? AND user_id = ?',
            [projectId, userId]
        );

        database.disConnect(); // Disconnect from the database after the operation

        // Check if the project exists, otherwise return a 404 error
        if (projects.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(projects[0]); // Return the project details as a JSON response

    } catch (error) {
        database.disConnect(); // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }); // Return a 500 error if the database operation fails
    }
});

// Route to update a specific project by its ID
routerProjects.put('/:id', async (req, res) => {
    const projectId = req.params.id; // Extract the project ID from the request parameters
    const { name, description, start_date, end_date } = req.body; // Extract project details from the request body
    const userId = req.infoInApiKey.id; // Retrieve the authenticated user's ID from the API key

    try {
        database.connect(); // Establish a connection to the database

        // Update the project details in the database
        const result = await database.query(
            'UPDATE projects SET name = ?, description = ?, start_date = ?, end_date = ? WHERE id = ? AND user_id = ?',
            [name, description, start_date, end_date, projectId, userId]
        );

        database.disConnect(); // Disconnect from the database after the operation

        // Check if any rows were affected, otherwise return a 404 error
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found or no changes made' });
        }

        res.json({ updated: true }); // Return a success response indicating the project was updated

    } catch (error) {
        database.disConnect(); // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }); // Return a 500 error if the database operation fails
    }
});

// Route to delete a specific project by its ID
routerProjects.delete('/:id', async (req, res) => {
    const projectId = req.params.id; // Extract the project ID from the request parameters
    const userId = req.infoInApiKey.id; // Retrieve the authenticated user's ID from the API key

    try {
        database.connect(); // Establish a connection to the database

        // Delete the project from the database
        const result = await database.query(
            'DELETE FROM projects WHERE id = ? AND user_id = ?',
            [projectId, userId]
        );

        database.disConnect(); // Disconnect from the database after the operation

        // Check if any rows were affected, otherwise return a 404 error
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ deleted: true }); // Return a success response indicating the project was deleted

    } catch (error) {
        database.disConnect(); // Ensure the database is disconnected in case of an error
        res.status(500).json({ error: 'Database error', details: error }); // Return a 500 error if the database operation fails
    }
});

module.exports = routerProjects; // Export the router for use in other parts of the application
