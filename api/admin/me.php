<?php
/**
 * GET: return current admin user or 401.
 */

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

echo json_encode([
    'success' => true,
    'user' => [
        'username' => $_SESSION['admin_username'] ?? '',
    ],
]);
