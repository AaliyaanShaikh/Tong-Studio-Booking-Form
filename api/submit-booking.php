<?php
/**
 * Secure booking submission API for Tong Studio Booking Form.
 * POST only; validates input and uses prepared statements.
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Load config (fail closed if missing)
$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server configuration error.']);
    exit;
}
$config = require $configPath;

// CORS: allow configured origins, and always allow localhost for dev
$origin = trim($_SERVER['HTTP_ORIGIN'] ?? '');
$allowed = $config['api']['allowed_origins'] ?? [];
$allowOrigin = $origin !== ''
    && (in_array($origin, $allowed, true)
        || preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin));
if ($allowOrigin) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
    exit;
}

// Parse JSON body or form data
$raw = file_get_contents('php://input');
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$input = [];
if (strpos($contentType, 'application/json') !== false && $raw !== false) {
    $decoded = json_decode($raw, true);
    $input = is_array($decoded) ? $decoded : [];
} else {
    $input = $_POST;
}

// Whitelist: valid values from BookingPage.tsx
$validStudios = ['1', '2', '3', '4'];
$validTimingSlots = ['2h', '4h', '12h', '24h'];
$validAddons = ['lighting', 'crew', 'teleprompter', 'backdrop', 'greenroom'];

function sendError(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

function sanitizeString(string $s, int $maxLen): string {
    return mb_substr(trim($s), 0, $maxLen);
}

// Validate required fields
$setup = isset($input['setup']) ? (string) $input['setup'] : '';
$date = isset($input['date']) ? (string) $input['date'] : '';
$timing = isset($input['timing']) ? (string) $input['timing'] : '';
$name = isset($input['name']) ? (string) $input['name'] : '';
$email = isset($input['email']) ? (string) $input['email'] : '';
$phone = isset($input['phone']) ? (string) $input['phone'] : '';

if (!in_array($setup, $validStudios, true)) {
    sendError('Invalid or missing studio/setup.');
}
if (!in_array($timing, $validTimingSlots, true)) {
    sendError('Invalid or missing timing slot.');
}

$bookingDate = $date;
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $bookingDate)) {
    sendError('Invalid date format.');
}
$dateObj = DateTime::createFromFormat('Y-m-d', $bookingDate);
if (!$dateObj || $dateObj->format('Y-m-d') !== $bookingDate) {
    sendError('Invalid date.');
}
$today = (new DateTime())->setTime(0, 0, 0);
if ($dateObj < $today) {
    sendError('Booking date cannot be in the past.');
}

$name = sanitizeString($name, 255);
if ($name === '') {
    sendError('Name is required.');
}

$email = trim($email);
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Valid email is required.');
}
$email = mb_substr($email, 0, 255);

$phone = sanitizeString(preg_replace('/\s+/', ' ', $phone), 50);
if ($phone === '') {
    sendError('Phone is required.');
}

// Addons: must be array of valid ids
$addons = [];
if (isset($input['addons']) && is_array($input['addons'])) {
    foreach ($input['addons'] as $id) {
        $id = (string) $id;
        if (in_array($id, $validAddons, true)) {
            $addons[] = $id;
        }
    }
}
$addonsJson = count($addons) > 0 ? json_encode(array_values(array_unique($addons))) : null;

$extraRequests = isset($input['extraRequests']) ? sanitizeString((string) $input['extraRequests'], 2000) : '';

// Database insert with PDO (prepared statements)
try {
    $dsn = sprintf(
        'mysql:host=%s;dbname=%s;charset=%s',
        $config['db']['host'],
        $config['db']['name'],
        $config['db']['charset'] ?? 'utf8mb4'
    );
    $pdo = new PDO($dsn, $config['db']['user'], $config['db']['password'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    error_log('Booking API DB connection: ' . $e->getMessage());
    sendError('Unable to process booking.', 500);
}

$sql = 'INSERT INTO bookings (studio_id, booking_date, timing_slot, addons, extra_requests, customer_name, customer_email, customer_phone)
        VALUES (:studio_id, :booking_date, :timing_slot, :addons, :extra_requests, :customer_name, :customer_email, :customer_phone)';

try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':studio_id'      => $setup,
        ':booking_date'   => $bookingDate,
        ':timing_slot'    => $timing,
        ':addons'         => $addonsJson,
        ':extra_requests' => $extraRequests === '' ? null : $extraRequests,
        ':customer_name'  => $name,
        ':customer_email' => $email,
        ':customer_phone' => $phone,
    ]);
    $bookingId = (int) $pdo->lastInsertId();
} catch (PDOException $e) {
    error_log('Booking API insert: ' . $e->getMessage());
    sendError('Unable to save booking.', 500);
}

http_response_code(201);
echo json_encode([
    'success' => true,
    'booking_id' => $bookingId,
    'message' => 'Booking received. We\'ll send a confirmation to your email shortly.',
]);
