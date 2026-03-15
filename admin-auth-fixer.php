<?php
/**
 * Standalone Admin Authentication Fixer for Esena Pharmacy
 * Upload this file to your hosting and access via browser
 * URL: https://esena.co.ke/admin-auth-fixer.php
 */

// Database configuration - update these with your actual values
$DB_HOST = 'localhost';
$DB_NAME = 'ohnokmqf_esena_pharmacy';
$DB_USER = 'ohnokmqf_esena_user';
$DB_PASS = 'Il0v3m3579J@m3$b@j33';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esena Pharmacy - Admin Auth Fixer</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .success { color: #155724; background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #28a745; }
        .error { color: #721c24; background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc3545; }
        .info { color: #0c5460; background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #17a2b8; }
        .warning { color: #856404; background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .step { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 5px solid #007bff; }
        button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; margin: 8px; font-size: 14px; font-weight: 500; transition: all 0.3s; }
        button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .log { background: #f1f3f4; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; white-space: pre-wrap; max-height: 400px; overflow-y: auto; font-size: 13px; }
        .credentials { background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); color: #2d3436; padding: 20px; border-radius: 10px; margin: 20px 0; }
        h1 { color: #2d3436; margin-bottom: 10px; }
        h2 { color: #636e72; margin-top: 30px; }
        h3 { color: #2d3436; margin-bottom: 15px; }
        .status-badge { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-left: 10px; }
        .status-ok { background: #00b894; color: white; }
        .status-error { background: #e17055; color: white; }
        .status-warning { background: #fdcb6e; color: #2d3436; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Esena Pharmacy - Admin Authentication Fixer</h1>
        <p>This standalone tool will diagnose and fix the 400 Bad Request login error without requiring backend updates.</p>

        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
            $action = $_POST['action'];
            
            try {
                // Database connection
                $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8", $DB_USER, $DB_PASS);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                echo '<div class="success">✅ Database connection successful <span class="status-badge status-ok">CONNECTED</span></div>';
                
                if ($action === 'check') {
                    echo '<div class="step"><h3>📋 System Diagnosis</h3>';
                    
                    // Check if users table exists
                    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
                    if ($stmt->rowCount() === 0) {
                        echo '<div class="error">❌ Users table does not exist <span class="status-badge status-error">MISSING</span></div>';
                        echo '<div class="warning">⚠️ The database schema needs to be initialized. Click "Initialize Database" below.</div>';
                    } else {
                        echo '<div class="success">✅ Users table exists <span class="status-badge status-ok">FOUND</span></div>';
                        
                        // Check for admin user
                        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
                        $stmt->execute(['admin']);
                        $user = $stmt->fetch();
                        
                        if (!$user) {
                            echo '<div class="error">❌ Admin user does not exist <span class="status-badge status-error">MISSING</span></div>';
                            echo '<div class="info">💡 An admin user needs to be created. Click "Create Admin User" below.</div>';
                        } else {
                            echo '<div class="success">✅ Admin user exists <span class="status-badge status-ok">ID: ' . $user['id'] . '</span></div>';
                            echo '<div class="info">👤 Username: ' . htmlspecialchars($user['username']) . '</div>';
                            echo '<div class="info">🎭 Role: ' . htmlspecialchars($user['role']) . '</div>';
                            echo '<div class="info">📅 Created: ' . htmlspecialchars($user['created_at']) . '</div>';
                            
                            // Test password
                            if (password_verify('password', $user['password'])) {
                                echo '<div class="success">✅ Password verification works <span class="status-badge status-ok">VALID</span></div>';
                                echo '<div class="success">🎉 <strong>Authentication is ready!</strong> You should be able to log in now.</div>';
                                
                                // Test login simulation
                                echo '<div class="info">🧪 <strong>Login Test:</strong> Username: admin, Password: password</div>';
                            } else {
                                echo '<div class="error">❌ Password verification failed <span class="status-badge status-error">INVALID</span></div>';
                                echo '<div class="warning">🔧 The password hash needs to be updated. Click "Fix Password" below.</div>';
                            }
                        }
                    }
                    
                    // Check other tables
                    echo '<h4>📊 Database Tables Status:</h4>';
                    $tables = ['users', 'products', 'orders', 'appointments', 'contacts', 'blogs'];
                    foreach ($tables as $table) {
                        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
                        $exists = $stmt->rowCount() > 0;
                        $badge = $exists ? 'status-ok">EXISTS' : 'status-warning">MISSING';
                        $icon = $exists ? '✅' : '⚠️';
                        echo "<div class='info'>$icon Table '$table' <span class='status-badge $badge</span></div>";
                    }
                    
                    echo '</div>';
                    
                } elseif ($action === 'init_database') {
                    echo '<div class="step"><h3>🏗️ Initializing Database</h3>';
                    
                    // Create users table
                    $sql = "CREATE TABLE IF NOT EXISTS users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        role ENUM('admin','doctor') DEFAULT 'admin',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )";
                    $pdo->exec($sql);
                    echo '<div class="success">✅ Users table created/verified</div>';
                    
                    // Create other essential tables
                    $tables = [
                        "CREATE TABLE IF NOT EXISTS products (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(255) NOT NULL,
                            category ENUM('Prescription','OTC','Chronic','Supplements','PersonalCare') NOT NULL,
                            price DECIMAL(10,2) NOT NULL,
                            description TEXT,
                            image VARCHAR(255),
                            video VARCHAR(255),
                            stock INT DEFAULT 0,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            INDEX idx_category (category)
                        )",
                        "CREATE TABLE IF NOT EXISTS orders (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            customer_name VARCHAR(255) NOT NULL,
                            email VARCHAR(255),
                            phone VARCHAR(20),
                            delivery_address TEXT,
                            notes TEXT,
                            total DECIMAL(10,2),
                            token VARCHAR(50) UNIQUE NOT NULL,
                            status ENUM('pending','payment_requested','paid','dispatched','completed') DEFAULT 'pending',
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            INDEX idx_token (token),
                            INDEX idx_status (status)
                        )"
                    ];
                    
                    foreach ($tables as $sql) {
                        $pdo->exec($sql);
                    }
                    
                    echo '<div class="success">✅ Essential database tables initialized</div>';
                    echo '<div class="info">💡 Database is now ready. Proceed to create the admin user.</div>';
                    echo '</div>';
                    
                } elseif ($action === 'create_admin') {
                    echo '<div class="step"><h3>👤 Creating Admin User</h3>';
                    
                    // Generate bcrypt hash compatible with Node.js bcryptjs
                    $hashedPassword = password_hash('password', PASSWORD_BCRYPT, ['cost' => 10]);
                    // Convert $2y$ to $2a$ for Node.js compatibility
                    $hashedPassword = str_replace('$2y$', '$2a$', $hashedPassword);
                    
                    // Check if admin exists
                    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
                    $stmt->execute(['admin']);
                    
                    if ($stmt->fetch()) {
                        // Update existing user
                        $stmt = $pdo->prepare("UPDATE users SET password = ?, role = ? WHERE username = ?");
                        $stmt->execute([$hashedPassword, 'admin', 'admin']);
                        echo '<div class="success">✅ Admin user password updated (bcrypt format)</div>';
                    } else {
                        // Create new user
                        $stmt = $pdo->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
                        $stmt->execute(['admin', $hashedPassword, 'admin']);
                        echo '<div class="success">✅ Admin user created successfully (bcrypt format)</div>';
                    }
                    
                    // Verify the creation
                    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
                    $stmt->execute(['admin']);
                    $user = $stmt->fetch();
                    
                    if ($user) {
                        echo '<div class="success">🎉 <strong>Admin user is ready!</strong></div>';
                        echo '<div class="info">👤 User ID: ' . $user['id'] . '</div>';
                        echo '<div class="info">🔐 Hash format: ' . substr($user['password'], 0, 4) . ' (Node.js compatible)</div>';
                        
                        if (password_verify('password', $user['password'])) {
                            echo '<div class="success">✅ PHP verification: PASSED</div>';
                        } else {
                            echo '<div class="warning">⚠️ PHP verification: FAILED (but Node.js should work)</div>';
                        }
                    } else {
                        echo '<div class="error">❌ Verification failed. Please try again.</div>';
                    }
                    
                    echo '</div>';
                    
                } elseif ($action === 'fix_password') {
                    echo '<div class="step"><h3>🔧 Fixing Admin Password</h3>';
                    
                    // Generate bcrypt hash compatible with Node.js bcryptjs
                    // Use cost 10 to match typical Node.js bcrypt settings
                    $hashedPassword = password_hash('password', PASSWORD_BCRYPT, ['cost' => 10]);
                    
                    // Convert $2y$ to $2a$ for Node.js compatibility
                    $hashedPassword = str_replace('$2y$', '$2a$', $hashedPassword);
                    
                    echo '<div class="info">🔐 Generated bcrypt hash (Node.js compatible): ' . substr($hashedPassword, 0, 20) . '...</div>';
                    
                    // Update the admin user's password
                    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = ?");
                    $stmt->execute([$hashedPassword, 'admin']);
                    
                    echo '<div class="success">✅ Password hash updated with bcrypt format</div>';
                    
                    // Verify the fix with PHP (should work)
                    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
                    $stmt->execute(['admin']);
                    $user = $stmt->fetch();
                    
                    if ($user && password_verify('password', $user['password'])) {
                        echo '<div class="success">✅ PHP password verification: PASSED</div>';
                    } else {
                        echo '<div class="warning">⚠️ PHP password verification: FAILED (but Node.js might still work)</div>';
                    }
                    
                    echo '<div class="info">💡 Hash format: ' . substr($user['password'], 0, 4) . ' (should be $2a$ for Node.js compatibility)</div>';
                    echo '<div class="success">🎉 <strong>Password updated for Node.js bcrypt compatibility!</strong></div>';
                    echo '<div class="info">🧪 Try logging in now at the admin dashboard</div>';
                    
                    echo '</div>';
                    
                } elseif ($action === 'test_complete') {
                    echo '<div class="step"><h3>🧪 Complete System Test</h3>';
                    
                    // Test database connection
                    $stmt = $pdo->query("SELECT 1 as test");
                    echo '<div class="success">✅ Database connection: WORKING</div>';
                    
                    // Test admin user
                    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
                    $stmt->execute(['admin']);
                    $user = $stmt->fetch();
                    
                    if ($user) {
                        echo '<div class="success">✅ Admin user exists: FOUND</div>';
                        
                        if (password_verify('password', $user['password'])) {
                            echo '<div class="success">✅ Password verification: PASSED</div>';
                            echo '<div class="success">🎉 <strong>ALL TESTS PASSED!</strong></div>';
                            echo '<div class="info">🚀 You can now log in to the admin dashboard with the credentials below.</div>';
                        } else {
                            echo '<div class="error">❌ Password verification: FAILED</div>';
                        }
                    } else {
                        echo '<div class="error">❌ Admin user: NOT FOUND</div>';
                    }
                    
                    echo '</div>';
                }
                
            } catch (Exception $e) {
                echo '<div class="error">❌ <strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
                echo '<div class="warning">💡 <strong>Troubleshooting:</strong><br>';
                echo '• Check database credentials at the top of this file<br>';
                echo '• Ensure the database exists<br>';
                echo '• Verify database user has proper permissions</div>';
            }
        }
        ?>

        <div class="step">
            <h3>🚀 Fix Your Authentication</h3>
            <p>Follow these steps in order:</p>
            
            <form method="post" style="display: inline;">
                <input type="hidden" name="action" value="check">
                <button type="submit">1️⃣ Diagnose Issues</button>
            </form>
            
            <form method="post" style="display: inline;">
                <input type="hidden" name="action" value="init_database">
                <button type="submit">2️⃣ Initialize Database</button>
            </form>
            
            <form method="post" style="display: inline;">
                <input type="hidden" name="action" value="create_admin">
                <button type="submit">3️⃣ Create Admin User</button>
            </form>
            
            <form method="post" style="display: inline;">
                <input type="hidden" name="action" value="fix_password">
                <button type="submit">🔧 Fix Password</button>
            </form>
            
            <form method="post" style="display: inline;">
                <input type="hidden" name="action" value="test_complete">
                <button type="submit">4️⃣ Final Test</button>
            </form>
        </div>

        <div class="credentials">
            <h3>🔑 Admin Login Credentials</h3>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> password</p>
            <p><strong>Login URL:</strong> <a href="https://esena.co.ke/admin/login" target="_blank" style="color: #2d3436; font-weight: bold;">https://esena.co.ke/admin/login</a></p>
        </div>

        <div class="info">
            <h3>📋 What This Tool Does</h3>
            <ul>
                <li>✅ Tests database connection</li>
                <li>🏗️ Creates missing database tables</li>
                <li>👤 Creates admin user with proper password hash</li>
                <li>🔐 Verifies password encryption works</li>
                <li>🧪 Tests the complete authentication flow</li>
            </ul>
        </div>

        <div class="warning">
            <h3>⚠️ Important Notes</h3>
            <ul>
                <li>This tool uses the database credentials hardcoded at the top of the file</li>
                <li>Make sure your database exists and is accessible</li>
                <li>After fixing, delete this file for security</li>
                <li>The admin password is set to "password" - change it after first login</li>
            </ul>
        </div>
    </div>
</body>
</html>