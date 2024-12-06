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

    // Validate input fields
    if (!title || !description || !salary || !location || !employer_id) {
        return res.status(400).send('All fields are required!');
    }

    const query = 'INSERT INTO Jobs (title, description, salary, location, employer_id) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [title, description, salary, location, employer_id], (err, results) => {
        if (err) {
            console.error('Error adding job:', err);
            return res.status(500).send('Server error while adding job.');
        }
        res.status(201).send('Job created successfully!');
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

// New Endpoint: Filter Jobs by Location
app.get('/jobs/location/:location', (req, res) => {
    const { location } = req.params; // Extract location from URL
    const query = 'SELECT * FROM Jobs WHERE location = ?'; // SQL query to filter by location
    db.query(query, [location], (err, results) => {
        if (err) {
            console.error('Error fetching jobs by location:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results); // Send filtered jobs as JSON
    });
});

// New Endpoint: Filter Jobs by Salary Range
app.get('/jobs/salary', (req, res) => {
    const { min, max } = req.query; // Extract min and max salary from query parameters
    const query = 'SELECT * FROM Jobs WHERE salary BETWEEN ? AND ?'; // SQL query to filter by salary range
    db.query(query, [min, max], (err, results) => {
        if (err) {
            console.error('Error fetching jobs by salary range:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results); // Send filtered jobs as JSON
    });
});

// Start the Server on Port 3001
app.listen(3001, () => {
    console.log('Server running on http://localhost:3001');
});
