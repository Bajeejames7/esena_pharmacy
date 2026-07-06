<?php
/**
 * Clear Customer Users from Database
 * Run this via browser: http://localhost/esena_pharmacy/clear-customers.php
 * Or via CLI: php clear-customers.php
 */

// Database configuration
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'esena_pharmacy';

// Connect to database
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

echo "<h2>Clearing Customer Users</h2>\n";
echo "<pre>\n";

// First, show existing customers
echo "=== EXISTING CUSTOMERS ===\n";
$result = $conn->query("SELECT id, email, name, firebase_uid, profile_completed, created_at FROM customers");
if ($result->num_rows > 0) {
    echo "Found " . $result->num_rows . " customer(s):\n\n";
    while($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . "\n";
        echo "  Email: " . $row['email'] . "\n";
        echo "  Name: " . $row['name'] . "\n";
        echo "  Firebase UID: " . $row['firebase_uid'] . "\n";
        echo "  Profile Completed: " . ($row['profile_completed'] ? 'Yes' : 'No') . "\n";
        echo "  Created: " . $row['created_at'] . "\n";
        echo "---\n";
    }
} else {
    echo "No customers found.\n";
}

echo "\n=== CLEARING CUSTOMERS ===\n";

// Delete all customers
$deleteResult = $conn->query("DELETE FROM customers");

if ($deleteResult) {
    $affected = $conn->affected_rows;
    echo "✓ Successfully deleted $affected customer record(s)\n";
} else {
    echo "✗ Error deleting customers: " . $conn->error . "\n";
}

// Verify deletion
echo "\n=== VERIFICATION ===\n";
$verifyResult = $conn->query("SELECT COUNT(*) as count FROM customers");
$count = $verifyResult->fetch_assoc()['count'];
echo "Remaining customers: $count\n";

if ($count == 0) {
    echo "✓ All customers cleared successfully!\n";
} else {
    echo "⚠ Warning: $count customer(s) still remain\n";
}

echo "\n</pre>\n";
echo "<p><strong>Done!</strong> You can now test the profile completion flow from scratch.</p>\n";

$conn->close();
?>
