<?php
// One-time setup: creates a symlink so Apache can serve uploads directly
// Run once via browser, then DELETE this file from the server

$target = '/home/ohnokmqf/esenaapp/uploads';
$link   = '/home/ohnokmqf/public_html/uploads';

// Check if symlink function is available
if (!function_exists('symlink')) {
    echo "symlink() is disabled on this server.<br>";
    echo "Trying alternative: shell_exec...<br>";
    $output = shell_exec("ln -s $target $link 2>&1");
    echo $output ? "shell_exec result: $output" : "shell_exec also disabled or no output.<br>";
    exit;
}

// Check if target exists
if (!file_exists($target)) {
    echo "ERROR: Target directory does not exist: $target<br>";
    echo "Check that the Node app path is correct.";
    exit;
}

// Check if link already exists
if (file_exists($link) || is_link($link)) {
    echo "Already exists at: $link<br>";
    echo is_link($link) ? "✓ It IS a symlink pointing to: " . readlink($link) : "It is a real directory (not a symlink)";
    exit;
}

// Try to create symlink
if (@symlink($target, $link)) {
    echo "✓ Symlink created successfully!<br>";
    echo "$link -> $target<br>";
    echo "<br><strong>DELETE this file from the server now.</strong>";
} else {
    $err = error_get_last();
    echo "✗ symlink() failed: " . ($err['message'] ?? 'unknown error') . "<br><br>";
    echo "Trying shell_exec fallback...<br>";
    $output = shell_exec("ln -s " . escapeshellarg($target) . " " . escapeshellarg($link) . " 2>&1");
    if ($output === null) {
        echo "shell_exec is also disabled.<br><br>";
        echo "You need to create the symlink via cPanel File Manager or SSH:<br>";
        echo "<code>ln -s $target $link</code>";
    } else {
        echo "shell_exec result: " . ($output ?: "no output (may have succeeded)") . "<br>";
        echo file_exists($link) ? "✓ Symlink now exists!" : "✗ Still not created.";
    }
}
?>
