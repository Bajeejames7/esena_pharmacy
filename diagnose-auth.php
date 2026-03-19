<?php
/**
 * Diagnose the Node.js auth error
 * Upload to public_html, visit in browser, then DELETE immediately after
 */

// Basic security - remove this file after use
$output = [];

// Run node diagnostic
$cmd = 'cd /home/ohnokmqf/esenaapp && node -e "try { const c = require(\'./controllers/authController\'); console.log(\'EXPORTS:\', JSON.stringify(Object.keys(c))); } catch(e) { console.error(\'ERROR:\', e.message); }" 2>&1';
exec($cmd, $output, $returnCode);

echo '<pre>';
echo "=== authController exports ===\n";
echo implode("\n", $output);
echo "\n\nReturn code: $returnCode\n";

// Also check if the file exists
$output2 = [];
exec('ls -la /home/ohnokmqf/esenaapp/controllers/authController.js 2>&1', $output2);
echo "\n=== File check ===\n";
echo implode("\n", $output2);

// Check what's actually in the file (first 20 lines)
$output3 = [];
exec('head -30 /home/ohnokmqf/esenaapp/controllers/authController.js 2>&1', $output3);
echo "\n\n=== First 30 lines of authController.js ===\n";
echo implode("\n", $output3);

// Check routes/auth.js line 16 area
$output4 = [];
exec('sed -n \'1,20p\' /home/ohnokmqf/esenaapp/routes/auth.js 2>&1', $output4);
echo "\n\n=== routes/auth.js lines 1-20 ===\n";
echo implode("\n", $output4);

echo '</pre>';
?>
