document.addEventListener('DOMContentLoaded', () => {
    const jobListings = document.getElementById('job-listings');

    fetch('http://localhost:3001/jobs') // Ensure this matches the running back-end
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(jobs => {
            console.log('Jobs fetched:', jobs);

            // Clear any existing job listings
            jobListings.innerHTML = '';

            // Loop through the jobs and add them to the page
            jobs.forEach(job => {
                const jobDiv = document.createElement('div');
                jobDiv.id = `job-${job.job_id}`;
                jobDiv.className = 'job-card';
                jobDiv.innerHTML = `
                    <h3>${job.job_title}</h3>
                    <p><strong>Description:</strong> ${job.job_description}</p>
                    <p><strong>Salary:</strong> $${parseFloat(job.salary).toLocaleString()}</p>
                    <p><strong>Location:</strong> ${job.location}</p>
                    <button onclick="editJob(${job.job_id})">Edit</button>
                    <button onclick="deleteJob(${job.job_id})">Delete</button>
                `;
                jobListings.appendChild(jobDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching jobs:', error);
            jobListings.innerHTML = '<p>Failed to load job listings. Please try again later.</p>';
        });
});

// Edit Job Function
function editJob(jobId) {
    window.location.href = `edit_job.html?job_id=${jobId}`;
}

// Delete Job Function
function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job?')) {
        fetch(`http://localhost:3001/jobs/${jobId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    alert('Job deleted successfully!');
                    document.getElementById(`job-${jobId}`).remove();
                } else {
                    alert('Failed to delete the job.');
                }
            })
            .catch(error => {
                console.error('Error deleting job:', error);
                alert('An error occurred while deleting the job.');
            });
    }
}
