<?php
$target = '/home/ohnokmqf/esenaapp/uploads';
$link   = '/home/ohnokmqf/public_html/uploads';

if (!file_exists($target)) {
    die("ERROR: Target does not exist: $target");
}

if (file_exists($link) || is_link($link)) {
    echo "Already exists at: $link<br>";
    echo is_link($link) ? "It IS a symlink -> " . readlink($link) : "It is a real directory";
    exit;
}

if (function_exists('symlink') && @symlink($target, $link)) {
    echo "Symlink created: $link -> $target<br><strong>DELETE this file now.</strong>";
} else {
    $out = shell_exec("ln -s " . escapeshellarg($target) . " " . escapeshellarg($link) . " 2>&1");
    if (file_exists($link) || is_link($link)) {
        echo "Symlink created via shell: $link -> $target<br><strong>DELETE this file now.</strong>";
    } else {
        echo "FAILED. symlink() and shell_exec both blocked.<br>";
        echo "Use cPanel File Manager to create a symlink manually, or contact TrueHost support.<br>";
        echo "shell output: " . htmlspecialchars($out ?? 'none');
    }
}
?>
