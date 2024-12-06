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
    const query = 'SELECT * FROM Jobs'; // Fetch all fields
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching jobs:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results); // Send all jobs as JSON
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
// Specific Query Endpoints for Reports

// 1. Find all job titles for jobs located in New York
app.get('/reports/jobs-in-newyork', (req, res) => {
    const query = 'SELECT job_title FROM Jobs WHERE location = "New York, NY"';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching jobs in New York:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 2. List the usernames of users who applied for a specific job
app.get('/reports/users-applied/:jobId', (req, res) => {
    const { jobId } = req.params;
    const query = `
        SELECT Users.username FROM Users
        JOIN Applications ON Users.user_id = Applications.user_id
        WHERE Applications.job_id = ?`;
    db.query(query, [jobId], (err, results) => {
        if (err) {
            console.error('Error fetching usernames:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 3. Find the count of applications for a specific job
app.get('/reports/application-count/:jobId', (req, res) => {
    const { jobId } = req.params;
    const query = 'SELECT COUNT(*) AS application_count FROM Applications WHERE job_id = ?';
    db.query(query, [jobId], (err, results) => {
        if (err) {
            console.error('Error counting applications:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 4. Display job titles with salaries greater than $80,000
app.get('/reports/high-salary-jobs', (req, res) => {
    const query = 'SELECT job_title, salary FROM Jobs WHERE salary > 80000';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching high-salary jobs:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 5. List the email addresses of users who have applied for jobs in a specific role
app.get('/reports/emails-for-job/:jobTitle', (req, res) => {
    const { jobTitle } = req.params;
    const query = `
        SELECT Users.email FROM Users
        JOIN Applications ON Users.user_id = Applications.user_id
        JOIN Jobs ON Applications.job_id = Jobs.job_id
        WHERE Jobs.job_title = ?`;
    db.query(query, [jobTitle], (err, results) => {
        if (err) {
            console.error('Error fetching emails:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 6. Retrieve all applications that are still under review
app.get('/reports/applications-under-review', (req, res) => {
    const query = 'SELECT * FROM Applications WHERE status = "under review"';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 7. Find the top 5 highest-paying jobs
app.get('/reports/top-highest-paying-jobs', (req, res) => {
    const query = 'SELECT job_title, salary FROM Jobs ORDER BY salary DESC LIMIT 5';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 8. List all jobs posted by a specific employer
app.get('/reports/jobs-by-employer/:employerId', (req, res) => {
    const { employerId } = req.params;
    const query = 'SELECT job_title FROM Jobs WHERE employer_id = ?';
    db.query(query, [employerId], (err, results) => {
        if (err) {
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 9. Find the names of employers in a specific industry
app.get('/reports/employers-by-industry/:industry', (req, res) => {
    const { industry } = req.params;
    const query = 'SELECT company_name FROM Employers WHERE industry = ?';
    db.query(query, [industry], (err, results) => {
        if (err) {
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 10. List all job applications submitted in the past week
app.get('/reports/applications-past-week', (req, res) => {
    const query = `
        SELECT * FROM Applications
        WHERE application_date > NOW() - INTERVAL 7 DAY`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching applications from the past week:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 11. Retrieve all job postings that have received at least one application
app.get('/reports/jobs-with-applications', (req, res) => {
    const query = `
        SELECT DISTINCT Jobs.job_id, Jobs.job_title
        FROM Jobs
        JOIN Applications ON Jobs.job_id = Applications.job_id`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching jobs with applications:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 12. Find job postings that have not received any applications
app.get('/reports/jobs-without-applications', (req, res) => {
    const query = `
        SELECT Jobs.job_id, Jobs.job_title
        FROM Jobs
        LEFT JOIN Applications ON Jobs.job_id = Applications.job_id
        WHERE Applications.job_id IS NULL`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching jobs without applications:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 13. List the average salary of all job postings by industry
app.get('/reports/average-salary-by-industry', (req, res) => {
    const query = `
        SELECT Employers.industry, AVG(Jobs.salary) AS average_salary
        FROM Jobs
        JOIN Employers ON Jobs.employer_id = Employers.employer_id
        GROUP BY Employers.industry`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching average salaries by industry:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 14. Retrieve the total number of users (job seekers) on the platform
app.get('/reports/total-job-seekers', (req, res) => {
    const query = `
        SELECT COUNT(*) AS total_job_seekers
        FROM Users
        WHERE user_type = 'seeker'`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching total job seekers:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 15. Find the top 3 most applied-to jobs
app.get('/reports/top-applied-jobs', (req, res) => {
    const query = `
        SELECT Jobs.job_title, COUNT(Applications.application_id) AS application_count
        FROM Jobs
        JOIN Applications ON Jobs.job_id = Applications.job_id
        GROUP BY Jobs.job_id
        ORDER BY application_count DESC
        LIMIT 3`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching top applied-to jobs:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
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
// 16. Find all applications submitted by a specific user (user_id = 5)
app.get('/reports/user-applications/:userId', (req, res) => {
    const { userId } = req.params;
    const query = `
        SELECT Applications.application_id, Jobs.job_title, Applications.application_date, Applications.status
        FROM Applications
        JOIN Jobs ON Applications.job_id = Jobs.job_id
        WHERE Applications.user_id = ?`;
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error(`Error fetching applications for user ${userId}:`, err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 17. List the highest-paying job in each location
app.get('/reports/highest-paying-jobs-by-location', (req, res) => {
    const query = `
        SELECT location, job_title, MAX(salary) AS highest_salary
        FROM Jobs
        GROUP BY location`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching highest-paying jobs by location:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 18. Find the status of applications for a specific job (job_id = 202)
app.get('/reports/job-application-status/:jobId', (req, res) => {
    const { jobId } = req.params;
    const query = `
        SELECT Applications.application_id, Applications.status, Users.username
        FROM Applications
        JOIN Users ON Applications.user_id = Users.user_id
        WHERE Applications.job_id = ?`;
    db.query(query, [jobId], (err, results) => {
        if (err) {
            console.error(`Error fetching application status for job ${jobId}:`, err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 19. Retrieve all job seekers who have not applied for any jobs yet
app.get('/reports/job-seekers-no-applications', (req, res) => {
    const query = `
        SELECT Users.user_id, Users.username, Users.email
        FROM Users
        LEFT JOIN Applications ON Users.user_id = Applications.user_id
        WHERE Users.user_type = 'seeker' AND Applications.application_id IS NULL`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching job seekers with no applications:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
    });
});

// 20. Find the job titles of the most recent jobs posted by each employer
app.get('/reports/most-recent-jobs-by-employer', (req, res) => {
    const query = `
        SELECT Employers.company_name, Jobs.job_title, MAX(Jobs.job_id) AS most_recent_job
        FROM Jobs
        JOIN Employers ON Jobs.employer_id = Employers.employer_id
        GROUP BY Employers.employer_id`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching most recent jobs by employer:', err);
            return res.status(500).send('Server error.');
        }
        res.json(results);
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
