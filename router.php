<?php
/**
 * Router for PHP built-in server.
 * - Serves the built app from dist/ with correct MIME types (fixes "Strict MIME" error).
 * - Handles CORS preflight (OPTIONS) for the API.
 * - Routes /api/*.php to api/ folder.
 *
 * Run from project root: php -S localhost:8000 router.php
 * Then open http://localhost:8000 (built app) and API at http://localhost:8000/api/submit-booking.php
 *
 * For development: use "npm run dev" (port 5173) for the app and run this for API only.
 */

$uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH) ?? '';
$dist = __DIR__ . '/dist';

// MIME types for static files (PHP built-in server often sends wrong/empty for .js)
$mimeTypes = [
    'js'   => 'application/javascript',
    'mjs'  => 'application/javascript',
    'css'  => 'text/css',
    'json' => 'application/json',
    'png'  => 'image/png',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'gif'  => 'image/gif',
    'webp' => 'image/webp',
    'svg'  => 'image/svg+xml',
    'ico'  => 'image/x-icon',
    'woff' => 'font/woff',
    'woff2'=> 'font/woff2',
    'ttf'  => 'font/ttf',
    'html' => 'text/html',
];

// 1) OPTIONS → CORS preflight for API
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    $origin = trim($_SERVER['HTTP_ORIGIN'] ?? '');
    $allowOrigin = false;
    if ($origin !== '') {
        $configPath = __DIR__ . '/api/config.php';
        if (is_file($configPath)) {
            $config = require $configPath;
            $allowed = $config['api']['allowed_origins'] ?? [];
            $allowOrigin = in_array($origin, $allowed, true)
                || preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin);
        } else {
            $allowOrigin = (bool) preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin);
        }
    }
    if ($allowOrigin) {
        header('Access-Control-Allow-Origin: ' . $origin);
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
    http_response_code(204);
    exit;
}

// 2) /api/admin/*.php → api/admin folder
if (preg_match('#^/api/admin/([a-z0-9\-]+\.php)$#', $uri, $m)) {
    $path = __DIR__ . '/api/admin/' . $m[1];
    if (is_file($path)) {
        return $path;
    }
}

// 3) /api/*.php → api folder
if (preg_match('#^/api/([a-z0-9\-]+\.php)$#', $uri, $m)) {
    $path = __DIR__ . '/api/' . $m[1];
    if (is_file($path)) {
        return $path;
    }
}

// 4) Serve built app from dist/ with correct MIME types
$file = $uri === '/' ? '/index.html' : $uri;
$path = $dist . $file;

if (is_file($path) && is_readable($path)) {
    $ext = pathinfo($path, PATHINFO_EXTENSION);
    if (isset($mimeTypes[$ext])) {
        header('Content-Type: ' . $mimeTypes[$ext]);
    }
    return $path;
}

// 5) SPA fallback: if dist exists and has index.html, serve it for any path (client-side routing)
if (is_file($dist . '/index.html')) {
    header('Content-Type: text/html');
    return $dist . '/index.html';
}

return false;