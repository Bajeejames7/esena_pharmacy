<?php
/**
 * Web-based Admin Setup for Esena Pharmacy
 * This creates the admin user directly via web interface
 * Upload to public_html and run once, then delete for security
 */

// Database configuration from your .env file
$DB_HOST = 'bhs109.truehost.cloud';
$DB_PORT = 3306;
$DB_NAME = 'ohnokmqf_esena_pharmacy';
$DB_USER = 'ohnokmqf_esena_user';
$DB_PASS = 'Il0v3m3579J@m3$b@j33';

header('Content-Type: text/html; charset=utf-8');

// Security: Only allow this to run once
$lockFile = 'admin-setup.lock';
if (file_exists($lockFile) && !isset($_GET['force'])) {
    die('<h1>Setup Already Completed</h1><p>Admin setup has already been run. Delete the file "admin-setup.lock" or add ?force=1 to the URL to run again.</p>');
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esena Pharmacy - Admin Setup</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .success { color: #155724; background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #28a745; }
        .error { color: #721c24; background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc3545; }
        .info { color: #0c5460; background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #17a2b8; }
        .warning { color: #856404; background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
        button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; margin: 8px; font-size: 14px; font-weight: 500; }
        .credentials { background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); color: #2d3436; padding: 20px; border-radius: 10px; margin: 20px 0; }
        h1 { color: #2d3436; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Esena Pharmacy - Admin Setup</h1>
        
        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['setup'])) {
            try {
                // Create PDO connection with port
                $dsn = "mysql:host=$DB_HOST;port=$DB_PORT;dbname=$DB_NAME;charset=utf8mb4";
                $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]);
                
                echo '<div class="success">✅ Database connection successful!</div>';
                
                // Create users table if it doesn't exist
                $createTable = "CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role ENUM('admin','doctor') DEFAULT 'admin',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )";
                
                $pdo->exec($createTable);
                echo '<div class="success">✅ Users table created/verified</div>';
                
                // Hash the password using PHP's password_hash (same as bcrypt)
                $hashedPassword = password_hash('password', PASSWORD_DEFAULT);
                
                // Check if admin user exists
                $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
                $stmt->execute(['admin']);
                $existingUser = $stmt->fetch();
                
                if ($existingUser) {
                    // Update existing user
                    $stmt = $pdo->prepare("UPDATE users SET password = ?, role = 'admin' WHERE username = ?");
                    $stmt->execute([$hashedPassword, 'admin']);
                    echo '<div class="success">✅ Admin user password updated</div>';
                } else {
                    // Create new admin user
                    $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')");
                    $stmt->execute(['admin', $hashedPassword]);
                    echo '<div class="success">✅ Admin user created successfully</div>';
                }
                
                // Verify the setup
                $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
                $stmt->execute(['admin']);
                $user = $stmt->fetch();
                
                if ($user && password_verify('password', $user['password'])) {
                    echo '<div class="success">🎉 <strong>Setup completed successfully!</strong></div>';
                    echo '<div class="info">👤 User ID: ' . $user['id'] . '</div>';
                    echo '<div class="info">🔐 Password verification: PASSED</div>';
                    echo '<div class="info">📅 Created: ' . $user['created_at'] . '</div>';
                    
                    // Create lock file
                    file_put_contents($lockFile, date('Y-m-d H:i:s'));
                    echo '<div class="warning">🔒 Setup locked to prevent re-running</div>';
                } else {
                    echo '<div class="error">❌ Setup verification failed</div>';
                }
                
            } catch (Exception $e) {
                echo '<div class="error">❌ <strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
                
                if (strpos($e->getMessage(), 'Connection refused') !== false) {
                    echo '<div class="warning">💡 <strong>Connection Issue:</strong><br>';
                    echo '• The database server might be temporarily unavailable<br>';
                    echo '• Check if your hosting allows external database connections<br>';
                    echo '• Contact your hosting provider for database access</div>';
                }
            }
        }
        ?>
        
        <div class="info">
            <h3>📋 What This Will Do</h3>
            <ul>
                <li>✅ Connect to your TrueHost database</li>
                <li>🏗️ Create the users table if it doesn't exist</li>
                <li>👤 Create/update admin user with proper password hash</li>
                <li>🔐 Verify password encryption works correctly</li>
                <li>🔒 Lock the setup to prevent re-running</li>
            </ul>
        </div>
        
        <?php if (!isset($_POST['setup'])): ?>
        <form method="post">
            <button type="submit" name="setup" value="1">🚀 Setup Admin User</button>
        </form>
        <?php endif; ?>
        
        <div class="credentials">
            <h3>🔑 Admin Login Credentials</h3>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> password</p>
            <p><strong>Login URL:</strong> <a href="https://esena.co.ke/admin/login" target="_blank" style="color: #2d3436; font-weight: bold;">https://esena.co.ke/admin/login</a></p>
        </div>
        
        <div class="warning">
            <h3>⚠️ Security Notes</h3>
            <ul>
                <li>Delete this file after successful setup</li>
                <li>Change the admin password after first login</li>
                <li>This setup can only be run once (creates a lock file)</li>
            </ul>
        </div>
    </div>
</body>
</html>