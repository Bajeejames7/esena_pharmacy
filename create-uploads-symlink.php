<?php
// One-time setup: creates a symlink so Apache can serve uploads directly
// Run once via browser, then DELETE this file from the server

$target = '/home/ohnokmqf/esenaapp/uploads';
$link   = '/home/ohnokmqf/public_html/uploads';

if (file_exists($link) || is_link($link)) {
    echo "Already exists: $link<br>";
    echo is_link($link) ? "It is a symlink pointing to: " . readlink($link) : "It is a real directory (not a symlink)";
    exit;
}

if (symlink($target, $link)) {
    echo "Symlink created successfully!<br>";
    echo "$link -> $target<br>";
    echo "<br><strong>DELETE this file from the server now.</strong>";
} else {
    echo "Failed to create symlink.<br>";
    echo "You may need to create it manually via SSH:<br>";
    echo "<code>ln -s $target $link</code>";
}
?>
