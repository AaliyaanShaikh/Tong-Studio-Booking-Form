<?php
/**
 * POST or GET: destroy session and logout.
 */

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $p = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], (bool) $p['secure'], true);
}
session_destroy();

echo json_encode(['success' => true]);
