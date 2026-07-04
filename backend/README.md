**📋 Task Manager Backend**

Welcome to the Task Manager Backend! This repository contains a robust and scalable API designed to manage tasks for users. Built with Node.js and Express, it utilizes MySQL for persistent data storage, supporting user authentication and comprehensive task management.


1. **🚀 Features**
    User Authentication: Secure login system using JWT tokens.

    Task Management: Perform CRUD operations for tasks, with support for priorities, due dates, and statuses.

    API Key Authentication: Ensures that only authenticated users can access task-related endpoints.

    Database Integration: Utilizes MySQL for complex queries and transactions.

    CORS Support: Configured to handle cross-origin requests securely.

    Error Handling: Robust error handling for all API endpoints.


2. **📦 Installation**
Prerequisites
    Node.js (v14+)
    MySQL Server

Commands
    git clone https://github.com/your-username/task-manager-backend.git
    cd task-manager-backend
    npm install

Setup Database
    Create a MySQL database named task_manager.
    Import the provided SQL schema (see Database Schema for details).

Configure Environment Variables.

Copy `.env.example` to `.env` and fill in real values (see that file for the full list: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN). `JWT_SECRET` is required in production and should be a long random string.


3. **Start the Server**
Run the following command to start the backend:
    npm start

The backend will be accessible at: http://localhost:4000


4. **⚙️ Configuration**
Database Configuration

The database connection settings are defined in database.js. Ensure your MySQL credentials and database name are set correctly. You can also configure the multipleStatements option if needed.
API Key Configuration

Active API keys are stored in activeApiKeys.js. The JWT secret is defined in the environment variables and used for signing and verifying tokens.


5. **📖 API Documentation**
Base URL http://localhost:4000

Endpoints

    POST /users/login
    Authenticates a user and returns a JWT token.
    Request Body: { email, password }

    POST /users
    Registers a new user.
    Request Body: { email, password }

    GET /users/disconnect
    Logs out a user by invalidating the API key.

    POST /tasks
    Creates a new task for the authenticated user.
    Request Body: { title, description, status, priority, due_date }

    GET /tasks
    Retrieves all tasks for the authenticated user.

    GET /tasks/:id
    Retrieves a specific task by its ID.

    PUT /tasks/:id
    Updates a specific task by its ID.
    Request Body: { title, description, status, priority, due_date }

    DELETE /tasks/:id
    Deletes a specific task by its ID.


6. **📬 Response Format**
All API responses are in JSON format, typically structured as:
    {
    "status": "success",
    "data": { ... }
    }

In case of an error:
    {
    "status": "error",
    "message": "Error details"
    }


7. **🗄️ Database Schema**

See `myDatabase.sql` for the canonical, up-to-date schema (also used to auto-initialize the database in Docker). Summary:

- `users(id, email UNIQUE, password)` - password is a bcrypt hash, never plaintext.
- `tasks(id, user_id, title, description, status ENUM('pending','in-progress','completed'), priority ENUM('low','medium','high'), dateFinish)`
- `projects(id, user_id, title, description, dateFinish, completed)`
- `subtasks(id, project_id, task, completed)`

All foreign keys cascade on delete.


8. **🔑 Authentication**

    JWT-Based Authentication: Users obtain a JWT token upon successful login, which is used to authenticate API requests.
    API Key: Each user session has a unique API key validated in middleware before accessing task-related routes.


9. **🛡️ Middleware**

    Authentication Middleware: Validates the presence of a valid API key and decodes the JWT token.
    CORS Middleware: Handles cross-origin resource sharing for secure interactions.


10. **⚠️ Error Handling**

Consistent error handling ensures that the API returns meaningful error messages for database errors, validation errors, and authorization errors, all with appropriate HTTP status codes.


11. **🧪 Testing**

To ensure robustness, implement unit tests using a framework like Mocha or Jest:

    Install testing dependencies: npm install --save-dev mocha chai

    Run tests: npm test


12. **📄 License**

This project is licensed under the MIT License. See the LICENSE file for details.

The Task Manager Backend is designed to provide a solid foundation for managing tasks through a RESTful API. It's structured for scalability and maintainability, allowing easy extension and customization to meet your project needs. Feel free to adjust any details to better fit your project!