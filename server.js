const express = require('express'); // Import Express framework
const mysql = require('mysql2'); // Import MySQL library
const bodyParser = require('body-parser'); // Middleware for parsing JSON
const cors = require('cors'); // Middleware to allow Cross-Origin Resource Sharing

const app = express(); // Create an Express application
app.use(bodyParser.json()); // Use body-parser to parse JSON request bodies
app.use(cors()); // Enable CORS to allow communication with the frontend

// MySQL Database Connection Configuration
const db = mysql.createConnection({
    host: 'localhost',       // Hostname (use 'localhost' or Docker's internal hostname)
    user: 'user',            // Replace with your MySQL username
    password: 'userpassword', // Replace with your MySQL password
    database: 'job_board',    // Replace with your database name
});

// Connect to the MySQL Database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database!');
});

// Basic Route for Testing
app.get('/', (req, res) => {
    res.send('Welcome to the Job Board Backend!');
});

// API Endpoint: Get All Jobs
app.get('/jobs', (req, res) => {
    const query = 'SELECT * FROM Jobs'; // SQL query to fetch all jobs
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching jobs:', err);
            res.status(500).send(err); // Send error response if query fails
        } else {
            res.json(results); // Send query results as JSON response
        }
    });
});

// API Endpoint: Add a New Job
app.post('/jobs', (req, res) => {
    const { title, description, salary, location, employer_id } = req.body;
    const query = 'INSERT INTO Jobs (title, description, salary, location, employer_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, description, salary, location, employer_id], (err, results) => {
        if (err) {
            console.error('Error adding job:', err);
            res.status(500).send(err); // Send error response if query fails
        } else {
            res.status(201).send('Job created successfully!');
        }
    });
});

// API Endpoint: Update a Job
app.put('/jobs/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, salary, location } = req.body;
    const query = 'UPDATE Jobs SET title = ?, description = ?, salary = ?, location = ? WHERE job_id = ?';
    db.query(query, [title, description, salary, location, id], (err, results) => {
        if (err) {
            console.error('Error updating job:', err);
            res.status(500).send(err); // Send error response if query fails
        } else if (results.affectedRows === 0) {
            res.status(404).send('Job not found!');
        } else {
            res.send('Job updated successfully!');
        }
    });
});

// API Endpoint: Delete a Job
app.delete('/jobs/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Jobs WHERE job_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting job:', err);
            res.status(500).send(err); // Send error response if query fails
        } else if (results.affectedRows === 0) {
            res.status(404).send('Job not found!');
        } else {
            res.send('Job deleted successfully!');
        }
    });
});

// Start the Server on Port 3001
app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
