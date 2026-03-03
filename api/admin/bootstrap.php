<?php
/**
 * Admin API bootstrap: config, CORS with credentials, session, optional auth check.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$configPath = dirname(__DIR__) . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server configuration error.']);
    exit;
}
$config = require $configPath;

$origin = trim($_SERVER['HTTP_ORIGIN'] ?? '');
$allowed = $config['api']['allowed_origins'] ?? [];
$allowOrigin = $origin !== ''
    && (in_array($origin, $allowed, true)
        || preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin));

if ($allowOrigin) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();

function requireAuth(): void {
    if (empty($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        exit;
    }
}
