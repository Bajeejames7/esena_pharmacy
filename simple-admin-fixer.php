<?php
/**
 * Simple Admin Fixer for Esena Pharmacy
 * Uses the existing backend API instead of direct database connection
 * Upload this file to your public_html directory
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Esena Pharmacy - Simple Admin Fixer</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; }
        .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .success { color: #155724; background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #28a745; }
        .error { color: #721c24; background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc3545; }
        .info { color: #0c5460; background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #17a2b8; }
        .warning { color: #856404; background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
        .step { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 10px; border-left: 5px solid #007bff; }
        button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; margin: 8px; font-size: 14px; font-weight: 500; transition: all 0.3s; }
        button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .credentials { background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%); color: #2d3436; padding: 20px; border-radius: 10px; margin: 20px 0; }
        h1 { color: #2d3436; margin-bottom: 10px; }
        h2 { color: #636e72; margin-top: 30px; }
        h3 { color: #2d3436; margin-bottom: 15px; }
        .test-result { padding: 15px; margin: 10px 0; border-radius: 8px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Esena Pharmacy - Simple Admin Fixer</h1>
        <p>This tool tests your backend API and provides solutions for the 400 Bad Request login error.</p>

        <div class="step">
            <h3>🧪 API Connection Test</h3>
            <button onclick="testAPI()">Test Backend API</button>
            <div id="api-result"></div>
        </div>

        <div class="step">
            <h3>🔐 Login Test</h3>
            <button onclick="testLogin()">Test Admin Login</button>
            <div id="login-result"></div>
        </div>

        <div class="credentials">
            <h3>🔑 Admin Login Credentials</h3>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> password</p>
            <p><strong>Login URL:</strong> <a href="https://esena.co.ke/admin/login" target="_blank" style="color: #2d3436; font-weight: bold;">https://esena.co.ke/admin/login</a></p>
        </div>

        <div class="info">
            <h3>📋 Troubleshooting Steps</h3>
            <ol>
                <li><strong>Test API Connection:</strong> Click "Test Backend API" to verify your backend is running</li>
                <li><strong>Test Login:</strong> Click "Test Admin Login" to see the exact error</li>
                <li><strong>Check Results:</strong> Based on the results, follow the recommended actions</li>
            </ol>
        </div>

        <div class="warning">
            <h3>⚠️ Common Solutions</h3>
            <ul>
                <li><strong>If API is not responding:</strong> Your backend server might be down</li>
                <li><strong>If login returns 400:</strong> Database/admin user setup issue</li>
                <li><strong>If login returns 401:</strong> Wrong credentials or password hash issue</li>
                <li><strong>If login returns 500:</strong> Server error, check backend logs</li>
            </ul>
        </div>
    </div>

    <script>
        async function testAPI() {
            const resultDiv = document.getElementById('api-result');
            resultDiv.innerHTML = '<div class="info">🔄 Testing API connection...</div>';
            
            try {
                const response = await fetch('https://esena.co.ke/api/health', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    resultDiv.innerHTML = '<div class="success">✅ Backend API is responding! Status: ' + response.status + '</div>';
                } else {
                    resultDiv.innerHTML = '<div class="warning">⚠️ API responded with status: ' + response.status + '</div>';
                }
            } catch (error) {
                // Try alternative endpoint
                try {
                    const response2 = await fetch('https://esena.co.ke/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({})
                    });
                    
                    resultDiv.innerHTML = '<div class="success">✅ Backend API is accessible! Auth endpoint responding with status: ' + response2.status + '</div>';
                } catch (error2) {
                    resultDiv.innerHTML = '<div class="error">❌ Backend API is not accessible. Error: ' + error2.message + '</div>';
                }
            }
        }
        
        async function testLogin() {
            const resultDiv = document.getElementById('login-result');
            resultDiv.innerHTML = '<div class="info">🔄 Testing admin login...</div>';
            
            try {
                const response = await fetch('https://esena.co.ke/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: 'admin',
                        password: 'password'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    resultDiv.innerHTML = '<div class="success">🎉 Login successful! Token received: ' + (data.token ? 'Yes' : 'No') + '</div>';
                } else {
                    let message = '<div class="error">❌ Login failed with status: ' + response.status + '</div>';
                    message += '<div class="test-result">Response: ' + JSON.stringify(data, null, 2) + '</div>';
                    
                    if (response.status === 400) {
                        message += '<div class="warning">💡 <strong>Solution for 400 Error:</strong><br>';
                        message += '• The admin user might not exist in the database<br>';
                        message += '• The password might not be properly hashed<br>';
                        message += '• Contact your hosting provider to run database setup scripts</div>';
                    } else if (response.status === 401) {
                        message += '<div class="warning">💡 <strong>Solution for 401 Error:</strong><br>';
                        message += '• Wrong username or password<br>';
                        message += '• Try different credentials or reset the admin user</div>';
                    } else if (response.status === 500) {
                        message += '<div class="warning">💡 <strong>Solution for 500 Error:</strong><br>';
                        message += '• Server error - check backend logs<br>';
                        message += '• Database connection might be failing</div>';
                    }
                    
                    resultDiv.innerHTML = message;
                }
            } catch (error) {
                resultDiv.innerHTML = '<div class="error">❌ Network error: ' + error.message + '</div>';
            }
        }
    </script>
</body>
</html>