# ------------- TASK MANAGER BACKEND -------------
This repository contains the backend for the Task Manager website, a robust and scalable API designed to manage tasks for users. The backend is built using Node.js and Express, with MySQL as the relational database for persistent storage. This API supports user authentication, task creation, updating, deletion, and retrieval, all while ensuring secure and efficient data handling.



# ------------- Features -------------
User Authentication: Secure login system using JWT tokens.

Task Management: CRUD operations for tasks with support for priorities, due dates, and statuses.

API Key Authentication: Ensures that only authenticated users can access task-related endpoints.

Database Integration: Utilizes MySQL for data storage, with support for complex queries and transactions.

CORS Support: Configured to handle cross-origin requests securely.

Error Handling: Robust error handling for all API endpoints.



# ------------- Installation -------------

# ---> Prerequisites
Node.js (v14+)
MySQL Server

# ---> Commands
git clone https://github.com/your-username/task-manager-backend.git
cd task-manager-backend
npm install

# ---> Setup Database
Create a MySQL database named task_manager.
Import the provided SQL schema (see Database Schema for details).

# ---> Configure environment variables
# Create a .env file in the root directory with the following details:
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=yourpassword
    DB_NAME=task_manager
    DB_PORT=3306
    JWT_SECRET=your_jwt_secret

# ---> Start the server
npm start --> The backend will run on http://localhost:4000



# ------------- Configuration -------------

# ---> Database Configuration
The database connection settings are defined in the database.js file. Ensure your MySQL credentials and database name are correctly set. You can also configure the multipleStatements option if your queries require it.

# ---> API Key Configuration
Active API keys are stored in the activeApiKeys.js file. The JWT secret is defined in the environment variables and used for signing and verifying tokens.



# ------------- API Documentation -------------

# ---> Base URL: 
http://localhost:4000

# ---> Endpoints

POST /users/login
    Authenticates a user and returns a JWT token.
    Request body: { email, password }

POST /users
    Registers a new user.
    Request body: { email, password }

GET /users/disconnect
    Logs out a user by invalidating the API key.

POST /tasks
    Creates a new task for the authenticated user.
    Request body: { title, description, status, priority, due_date }

GET /tasks
    Retrieves all tasks for the authenticated user.

GET /tasks/
    Retrieves a specific task by its ID.

PUT /tasks/
    Updates a specific task by its ID.
    Request body: { title, description, status, priority, due_date }

DELETE /tasks/
    Deletes a specific task by its ID.



# ------------- Response Format -------------
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



# ------------- Database Schema -------------

# --> Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

# --> Tasks Table
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    due_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


# ------------- Authentication: JWT-Based Authentication -------------
Login: Users obtain a JWT token upon successful login. This token is then used to authenticate API requests.

API Key: Each user session is associated with a unique API key stored in memory. This key is validated in middleware before accessing task-related routes.


# ------------- Middleware: Authentication Middleware -------------
Validates the presence of a valid API key in the request query parameters.
Decodes the JWT token and attaches the user information to the request object.


# ------------- CORS Middleware -------------
Handles cross-origin resource sharing, allowing secure interactions between the frontend and backend.


# ------------- Error Handling -------------
Consistent error handling across all routes ensures that the API returns meaningful error messages.

Database errors, validation errors, and authorization errors are all handled gracefully with appropriate HTTP status codes.


# ------------- Testing -------------
To ensure the robustness of the backend, you can implement unit tests for the different routes using a testing framework like Mocha or Jest. Here’s how you might set up the testing environment:

    Install testing dependencies:
        npm install --save-dev mocha chai

    Run tests:
        npm test


# ------------- LICENSE -------------
This project is licensed under the MIT License. See the LICENSE file for details.


Task Manager Backend is designed to provide a solid foundation for managing tasks through a RESTful API. It’s structured for scalability and maintainability, allowing easy extension and customization as per project needs.