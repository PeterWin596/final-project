document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('job_id');
    const form = document.getElementById('edit-job-form');

    // Fetch job details and populate the form
    fetch(`http://localhost:3001/jobs/${jobId}`)
        .then(response => response.json())
        .then(job => {
            document.getElementById('job_title').value = job.job_title;
            document.getElementById('job_description').value = job.job_description;
            document.getElementById('salary').value = job.salary;
            document.getElementById('location').value = job.location;
        })
        .catch(error => console.error('Error fetching job details:', error));

    // Handle form submission
    form.addEventListener('submit', event => {
        event.preventDefault();
        
        const updatedJob = {
            job_title: document.getElementById('job_title').value,
            job_description: document.getElementById('job_description').value,
            salary: document.getElementById('salary').value,
            location: document.getElementById('location').value
        };

        fetch(`http://localhost:3001/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedJob)
        })
            .then(response => {
                if (response.ok) {
                    alert('Job updated successfully!');
                    window.location.href = 'job_listings.html';
                } else {
                    alert('Failed to update the job.');
                }
            })
            .catch(error => console.error('Error updating job:', error));
    });
});
