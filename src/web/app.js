document.addEventListener('DOMContentLoaded', () => {
    const jobListings = document.getElementById('job-listings');

    // Fetch job listings from the back-end
    fetch('http://localhost:3001/jobs') // Correct endpoint
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Parse the JSON response
        })
        .then(jobs => {
            console.log('Jobs fetched:', jobs);

            // Clear any existing job listings
            jobListings.innerHTML = '';

            // Loop through the jobs and add them to the page
            jobs.forEach(job => {
                const jobDiv = document.createElement('div');
                jobDiv.className = 'job-card';
                jobDiv.innerHTML = `
                    <h3>${job.job_title}</h3>
                    <p><strong>Description:</strong> ${job.job_description}</p>
                    <p><strong>Salary:</strong> $${parseFloat(job.salary).toLocaleString()}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <p><strong>Employer ID:</strong> ${job.employer_id}</p>
                `;
                jobListings.appendChild(jobDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching jobs:', error);
            jobListings.innerHTML = '<p>Failed to load job listings. Please try again later.</p>';
        });
});
