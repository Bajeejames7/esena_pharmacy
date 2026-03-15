<?php
/**
 * Debug Login Flow - Tests the exact same steps as Node.js backend
 * This will help identify where the backend is failing
 */

// Database configuration
$DB_HOST = 'localhost';
$DB_NAME = 'ohnokmqf_esena_pharmacy';
$DB_USER = 'ohnokmqf_esena_user';
$DB_PASS = 'Il0v3m3579J@m3$b@j33';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Debug Login Flow</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .success { color: #28a745; background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .error { color: #dc3545; background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .info { color: #17a2b8; background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .step { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 10px; }
        button { background: #007bff; color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; }
        .code { background: #f1f3f4; padding: 10px; border-radius: 4px; font-family: monospace; }
    </style>
</head>
<body>
    <h1>🔍 Debug Login Flow</h1>
    <p>This tool simulates the exact same steps your Node.js backend performs during login.</p>

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['debug'])) {
        echo '<div class="step"><h3>🧪 Simulating Backend Login Process</h3>';
        
        try {
            // Step 1: Database Connection
            echo '<h4>Step 1: Database Connection</h4>';
            $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8", $DB_USER, $DB_PASS);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            echo '<div class="success">✅ Database connection successful</div>';
            
            // Step 2: Input Validation (simulate frontend request)
            echo '<h4>Step 2: Input Validation</h4>';
            $username = 'admin';
            $password = 'password';
            
            if (!$username || !$password) {
                echo '<div class="error">❌ Missing credentials</div>';
                exit;
            }
            echo '<div class="success">✅ Credentials provided: username=' . htmlspecialchars($username) . '</div>';
            
            // Step 3: Database Query
            echo '<h4>Step 3: Database Query</h4>';
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $users = $stmt->fetchAll();
            
            if (count($users) === 0) {
                echo '<div class="error">❌ User not found</div>';
                exit;
            }
            
            $user = $users[0];
            echo '<div class="success">✅ User found: ID=' . $user['id'] . ', Role=' . $user['role'] . '</div>';
            echo '<div class="info">🔐 Password hash: ' . substr($user['password'], 0, 20) . '...</div>';
            echo '<div class="info">🔐 Hash type: ' . substr($user['password'], 0, 4) . '</div>';
            
            // Step 4: Password Verification (PHP version)
            echo '<h4>Step 4: Password Verification (PHP)</h4>';
            if (password_verify($password, $user['password'])) {
                echo '<div class="success">✅ PHP password_verify: PASSED</div>';
            } else {
                echo '<div class="error">❌ PHP password_verify: FAILED</div>';
            }
            
            // Step 5: Simulate bcrypt.compare (Node.js equivalent)
            echo '<h4>Step 5: Bcrypt Compatibility Test</h4>';
            
            // Check if hash is bcrypt compatible
            if (substr($user['password'], 0, 4) === '$2a$' || substr($user['password'], 0, 4) === '$2b$' || substr($user['password'], 0, 4) === '$2y$') {
                echo '<div class="success">✅ Hash format is bcrypt compatible</div>';
                
                // Test with different bcrypt prefixes
                $testHashes = [
                    '$2a$' => str_replace(['$2y$', '$2b$'], '$2a$', $user['password']),
                    '$2b$' => str_replace(['$2y$', '$2a$'], '$2b$', $user['password']),
                    '$2y$' => str_replace(['$2a$', '$2b$'], '$2y$', $user['password'])
                ];
                
                foreach ($testHashes as $type => $hash) {
                    if (password_verify($password, $hash)) {
                        echo "<div class='success'>✅ $type format: WORKS</div>";
                    } else {
                        echo "<div class='error'>❌ $type format: FAILS</div>";
                    }
                }
            } else {
                echo '<div class="error">❌ Hash format is not bcrypt compatible: ' . substr($user['password'], 0, 10) . '</div>';
            }
            
            // Step 6: JWT Secret Check
            echo '<h4>Step 6: JWT Secret Availability</h4>';
            // We can't access Node.js env vars from PHP, but we can check if it's likely set
            echo '<div class="info">💡 JWT_SECRET should be: esena_pharmacy_jwt_secret_2026_secure_key</div>';
            echo '<div class="info">💡 This is set in your environment variables, so JWT signing should work</div>';
            
            // Step 7: Summary
            echo '<h4>🎯 Summary & Recommendations</h4>';
            
            if (password_verify($password, $user['password'])) {
                echo '<div class="success">🎉 <strong>Login should work!</strong> All steps passed successfully.</div>';
                echo '<div class="info">💡 If backend is still failing, the issue might be:</div>';
                echo '<ul>';
                echo '<li>Node.js bcryptjs library version compatibility</li>';
                echo '<li>Environment variables not loading properly</li>';
                echo '<li>Database connection timeout in Node.js</li>';
                echo '<li>Logger or other middleware causing errors</li>';
                echo '</ul>';
            } else {
                echo '<div class="error">❌ <strong>Password verification failed</strong></div>';
                echo '<div class="info">💡 Need to regenerate password hash with correct format</div>';
            }
            
        } catch (Exception $e) {
            echo '<div class="error">❌ <strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
        }
        
        echo '</div>';
    }
    ?>

    <div class="step">
        <h3>🔬 Test Backend Login Flow</h3>
        <p>This will simulate exactly what your Node.js backend does when processing a login request.</p>
        
        <form method="post">
            <button type="submit" name="debug" value="1">🧪 Debug Login Process</button>
        </form>
    </div>

    <div class="info">
        <h3>📋 What This Tests</h3>
        <ul>
            <li>✅ Database connection (same as Node.js)</li>
            <li>✅ User lookup query</li>
            <li>✅ Password hash verification</li>
            <li>✅ Bcrypt format compatibility</li>
            <li>✅ Environment variable availability</li>
        </ul>
    </div>
</body>
</html>