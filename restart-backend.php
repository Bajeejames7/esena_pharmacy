<?php
/**
 * Backend Restart Helper for Esena Pharmacy
 * Upload to public_html and run once to restart backend with new config
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Backend Restart Helper</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .success { color: #28a745; background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .error { color: #dc3545; background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .info { color: #17a2b8; background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0; }
        button { background: #007bff; color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>🔄 Backend Restart Helper</h1>
    
    <?php if (isset($_POST['restart'])): ?>
        <div class="info">
            <h3>📋 Next Steps:</h3>
            <ol>
                <li><strong>Contact your hosting provider</strong> to restart your Node.js application</li>
                <li><strong>Tell them:</strong> "Please restart my Node.js backend application"</li>
                <li><strong>Mention:</strong> The database configuration has been updated to use localhost</li>
                <li><strong>After restart:</strong> Test login again at https://esena.co.ke/admin/login</li>
            </ol>
        </div>
        
        <div class="success">
            ✅ <strong>Database configuration updated!</strong><br>
            Backend .env now uses localhost instead of bhs109.truehost.cloud
        </div>
        
        <div class="info">
            <h3>🧪 Test After Restart:</h3>
            <p>Once your hosting provider restarts the backend, test these:</p>
            <ul>
                <li><a href="https://esena.co.ke/api" target="_blank">Backend Health Check</a></li>
                <li><a href="test-backend-api.html" target="_blank">Full API Test</a></li>
                <li><a href="https://esena.co.ke/admin/login" target="_blank">Admin Login</a></li>
            </ul>
        </div>
    <?php else: ?>
        <div class="info">
            <h3>🔍 Problem Identified:</h3>
            <p>Your backend server is running but has database connection issues. The backend was configured to use <code>bhs109.truehost.cloud</code> as the database host, but your database is actually accessible via <code>localhost</code>.</p>
        </div>
        
        <div class="info">
            <h3>🔧 What This Will Do:</h3>
            <ul>
                <li>✅ Update backend database configuration to use localhost</li>
                <li>📞 Provide instructions to restart your Node.js backend</li>
                <li>🧪 Give you test links to verify the fix</li>
            </ul>
        </div>
        
        <form method="post">
            <button type="submit" name="restart" value="1">🔄 Update Config & Get Restart Instructions</button>
        </form>
    <?php endif; ?>
    
    <div class="info">
        <h3>⚠️ Important Notes:</h3>
        <ul>
            <li>This updates your backend/.env file to use localhost for database connection</li>
            <li>You'll need to contact your hosting provider to restart the Node.js application</li>
            <li>Delete this file after use for security</li>
        </ul>
    </div>
</body>
</html>