<?php
$servername = "db";
$username = "user";
$password = "userpassword";
$dbname = "job_board";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
