<?php
/**
 * Run npm install on the server
 * Upload to public_html, visit once, then DELETE immediately
 */

// Safety check - only run once
$lockFile = '/home/ohnokmqf/esenaapp/.npm-install-ran';

echo '<pre style="font-family:monospace;background:#111;color:#0f0;padding:20px;">';
echo "=== NPM Install Runner ===\n\n";

// First, check what's missing
echo "--- Checking node_modules ---\n";
$checkCmd = 'ls /home/ohnokmqf/esenaapp/node_modules/ 2>&1 | head -20';
exec($checkCmd, $checkOut);
echo implode("\n", $checkOut) . "\n\n";

// Check if speakeasy exists (added with employees feature)
echo "--- Checking for speakeasy (new dependency) ---\n";
$speakeasyCheck = 'ls /home/ohnokmqf/esenaapp/node_modules/speakeasy 2>&1';
exec($speakeasyCheck, $spOut);
echo implode("\n", $spOut) . "\n\n";

// Check if qrcode exists
echo "--- Checking for qrcode ---\n";
$qrCheck = 'ls /home/ohnokmqf/esenaapp/node_modules/qrcode 2>&1';
exec($qrCheck, $qrOut);
echo implode("\n", $qrOut) . "\n\n";

// Run npm install
echo "--- Running npm install ---\n";
echo "(This may take 30-60 seconds...)\n\n";
$installCmd = 'cd /home/ohnokmqf/esenaapp && /home/ohnokmqf/nodevenv/esenaapp/22/bin/npm install 2>&1';
exec($installCmd, $installOut, $returnCode);
echo implode("\n", $installOut) . "\n\n";
echo "Return code: $returnCode\n\n";

// Verify speakeasy now exists
echo "--- Verifying speakeasy after install ---\n";
exec($speakeasyCheck, $spOut2);
echo implode("\n", $spOut2) . "\n\n";

// Try to require authController
echo "--- Testing authController require ---\n";
$testCmd = '/home/ohnokmqf/nodevenv/esenaapp/22/bin/node -e "try { const c = require(\'/home/ohnokmqf/esenaapp/controllers/authController\'); console.log(\'OK - exports:\', JSON.stringify(Object.keys(c))); } catch(e) { console.error(\'FAIL:\', e.message); }" 2>&1';
exec($testCmd, $testOut);
echo implode("\n", $testOut) . "\n\n";

echo "=== Done. DELETE THIS FILE NOW ===\n";
echo '</pre>';
?>
