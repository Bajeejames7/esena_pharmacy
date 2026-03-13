<?php
/**
 * Web-based admin authentication fixer
 * Access this file via browser to fix the 400 login error
 * URL: https://esena.co.ke/api/fix-auth-web.php
 */

header('Content-Type: text/html; charset=utf-8');

// Load environment variables from .env file
function loadEnv($path) {
    $env = [];
    if (file_exists($path)) {
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
                list($key, $value) = explode('=', $line, 2);
                $env[trim($key)] = trim($value);
            }
        }
    }
    return $env;
}

$env = loadEnv(__DIR__ . '/.env');

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esena Pharmacy - Admin Auth Fixer</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #28a745; background: #d4edda; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .error { color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .info { color: #0c5460; background: #d1ecf1; padding: 10px; border-radius: 5px; margin: 10px 0; }
        .step { background: #f8f9fa; padding: 15px; margin: 15px 0; border-left: 4px solid #007bff; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .log { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; max-height: 300px; overflow-y: auto; }
        .credentials { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Esena Pharmacy - Admin Authentication Fixer</h1>
        <p>This tool will diagnose and fix the 400 Bad Request login error.</p>

        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
            $action = $_POST['action'];
            
            try {
                // Database connection
                $host = $env['DB_HOST'] ?? 'localhost';
                $dbname = $env['DB_NAME'] ?? '';
                $username = $env['DB_USER'] ?? '';
                $password = $env['DB_PASSWORD'] ?? '';
                
                if (empty($dbname) || empty($username)) {
                    throw new Exception("Database credentials not found in .env file");
                }
                
                $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                echo '<div class="success">✅ Database connection successful</div>';
                
                if ($action === 'check') {
                    // Check current status
                    echo '<div class="step"><h3>📋 Current Status Check</h3>';
                    
                    // Check if users table exists
                    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
                    if ($stmt->rowCount() === 0) {
                        echo '<div class="error">❌ Users table does not exist</div>';
                        echo '<p>The users table needs to be created. Click "Fix Database" below.</p>';
                    } else {
                        echo '<div class="success">✅ Users table exists</div>';
                        
                        // Check for admin user
                        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
                        $stmt->execute(['admin']);
                        $user = $stmt->fetch();
                        
                        if (!$user) {
                            echo '<div class="error">❌ Admin user does not exist</div>';
                        } else {
                            echo '<div class="success">✅ Admin user exists (ID: ' . $user['id'] . ')</div>';
                            
                            // Test password
                            if (password_verify('password', $user['password'])) {
                                echo '<div class="success">✅ Password verification works</div>';
                                echo '<div class="info">🎉 Authentication should be working! Try logging in again.</div>';
                            } else {
                                echo '<div class="error">❌ Password verification failed</div>';
                                echo '<p>The password hash needs to be updated. Click "Fix Admin User" below.</p>';
                            }
                        }
                    }
                    echo '</div>';
                    
                } elseif ($action === 'fix_database') {
                    // Create users table
                    echo '<div class="step"><h3>🔨 Creating Users Table</h3>';
                    
                    $sql = "CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        role ENUM('admin','doctor') DEFAULT 'admin',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )";
                    
                    $pdo->exec($sql);
                    echo '<div class="success">✅ Users table created successfully</div>';
                    echo '</div>';
                    
                } elseif ($action === 'fix_admin') {
                    // Create/update admin user
                    echo '<div class="step"><h3>👤 Setting Up Admin User</h3>';
                    
                    $hashedPassword = password_hash('password', PASSWORD_DEFAULT);
                    
                    // Check if admin exists
                    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
                    $stmt->execute(['admin']);
                    
                    if ($stmt->fetch()) {
                        // Update existing user
                        $stmt = $pdo->prepare("UPDATE users SET password = ?, role = ? WHERE username = ?");
                        $stmt->execute([$hashedPassword, 'admin', 'admin']);
                        echo '<div class="success">✅ Admin user password updated</div>';
                    } else {
                        // Create new user
                        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
                        $stmt->execute(['admin', $hashedPassword, 'admin']);
                        echo '<div class="success">✅ Admin user created</div>';
                    }
                    echo '</div>';
                    
                } elseif ($action === 'test_login') {
                    // Test login API
                    echo '<div class="step"><h3>🧪 Testing Login API</h3>';
                    
                    $loginData = json_encode(['username' => 'admin', 'password' => 'password']);
                    $url = 'https://esena.co.ke/api/auth/login';
                    
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $loginData);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
                    
                    $response = curl_exec($ch);
                    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    curl_close($ch);
                    
                    echo "<div class='info'>HTTP Status: $httpCode</div>";
                    echo "<div class='log'>Response: $response</div>";
                    
                    if ($httpCode === 200) {
                        echo '<div class="success">🎉 Login API is working! Authentication fixed!</div>';
                    } else {
                        echo '<div class="error">❌ Login API still returning error</div>';
                    }
                    echo '</div>';
                }
                
            } catch (Exception $e) {
                echo '<div class="error">❌ Error: ' . htmlspecialchars($e->getMessage()) . '</div>';
            }
        }
        ?>

        <div class="step">
            <h3>🚀 Quick Actions</h3>
            <form method="post" style="display: inline;">
                <input type="hidden" name="action" value="check">
                <button type="submit">1. Check Current Status</button>
            </form>
            
            <form method="post" style="display: inline;">
                <input type="hidden" name="action" value="fix_database">
                <button type="submit">2. Fix Database</button>
            </form>
            
            <form method="post" style="display: inline;">
                <input type="hidden" name="action" value="fix_admin">
                <button type="submit">3. Fix Admin User</button>
            </form>
            
            <form method="post" style="display: inline;">
                <input type="hidden" name="action" value="test_login">
                <button type="submit">4. Test Login API</button>
            </form>
        </div>

        <div class="credentials">
            <h3>🔑 Admin Credentials</h3>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> password</p>
            <p><em>Use these credentials to log in at: <a href="https://esena.co.ke/admin/login" target="_blank">https://esena.co.ke/admin/login</a></em></p>
        </div>

        <div class="info">
            <h3>📋 Instructions</h3>
            <ol>
                <li>Click "Check Current Status" to see what's wrong</li>
                <li>If users table is missing, click "Fix Database"</li>
                <li>If admin user is missing or password is wrong, click "Fix Admin User"</li>
                <li>Click "Test Login API" to verify the fix</li>
                <li>Try logging in to the admin dashboard</li>
            </ol>
        </div>

        <div class="step">
            <h3>🔍 Environment Status</h3>
            <p><strong>Database Host:</strong> <?php echo htmlspecialchars($env['DB_HOST'] ?? 'Not set'); ?></p>
            <p><strong>Database Name:</strong> <?php echo htmlspecialchars($env['DB_NAME'] ?? 'Not set'); ?></p>
            <p><strong>Database User:</strong> <?php echo htmlspecialchars($env['DB_USER'] ?? 'Not set'); ?></p>
            <p><strong>JWT Secret:</strong> <?php echo !empty($env['JWT_SECRET']) ? 'Set ✅' : 'Not set ❌'; ?></p>
        </div>
    </div>
</body>
</html>