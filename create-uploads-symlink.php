<?php
/**
 * Create uploads symlink for Esena Pharmacy
 * This makes /uploads/ accessible directly via Apache without going through Node.js
 * Upload to public_html and run once, then delete for security.
 */

header('Content-Type: text/html; charset=utf-8');

$target = '/home/ohnokmqf/esenaapp/uploads';
$link   = '/home/ohnokmqf/public_html/uploads';

$result  = '';
$success = false;
$error   = '';

if (isset($_POST['create'])) {
    if (is_link($link)) {
        $result  = 'Symlink already exists at ' . $link . ' → ' . readlink($link);
        $success = true;
    } elseif (file_exists($link)) {
        $error = 'A real directory already exists at ' . $link . '. Cannot create symlink over it.';
    } elseif (!is_dir($target)) {
        $error = 'Target directory does not exist: ' . $target;
    } else {
        if (symlink($target, $link)) {
            $result  = 'Symlink created successfully: ' . $link . ' → ' . $target;
            $success = true;
        } else {
            $error = 'symlink() call failed. Check that PHP has permission to create symlinks in public_html.';
        }
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Create Uploads Symlink</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
        .success { color: #28a745; background: #d4edda; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .error   { color: #dc3545; background: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .info    { color: #17a2b8; background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0; }
        button   { background: #007bff; color: white; padding: 12px 25px; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }
        code     { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🔗 Create Uploads Symlink</h1>

    <div class="info">
        <strong>What this does:</strong><br>
        Creates a symlink so Apache can serve product/prescription images directly:<br>
        <code><?php echo $link; ?></code> → <code><?php echo $target; ?></code>
    </div>

    <?php if ($success): ?>
        <div class="success">✅ <?php echo htmlspecialchars($result); ?></div>
        <div class="info">
            <strong>Next steps:</strong>
            <ol>
                <li>Test an image: <a href="/uploads/products/" target="_blank">/uploads/products/</a></li>
                <li>Delete this file from public_html for security.</li>
            </ol>
        </div>
    <?php elseif ($error): ?>
        <div class="error">❌ <?php echo htmlspecialchars($error); ?></div>
    <?php endif; ?>

    <?php if (!$success): ?>
    <div class="info">
        <strong>Current status:</strong><br>
        Symlink exists: <?php echo is_link($link) ? '✅ Yes → ' . readlink($link) : '❌ No'; ?><br>
        Target dir exists: <?php echo is_dir($target) ? '✅ Yes' : '❌ No'; ?><br>
        PHP symlink support: <?php echo function_exists('symlink') ? '✅ Yes' : '❌ No'; ?>
    </div>

    <form method="post">
        <button type="submit" name="create" value="1">🔗 Create Symlink Now</button>
    </form>
    <?php endif; ?>
</body>
</html>
