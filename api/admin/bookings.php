<?php
/**
 * Admin bookings CRUD.
 * GET (no id): list all. GET ?id=1: one booking.
 * PUT ?id=1: update. DELETE ?id=1: delete.
 */

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';
requireAuth();

try {
    $pdo = get_pdo($config);
} catch (PDOException $e) {
    error_log('Admin bookings DB: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

// GET one
if ($method === 'GET' && $id > 0) {
    $stmt = $pdo->prepare('SELECT id, studio_id, booking_date, timing_slot, addons, extra_requests, customer_name, customer_email, customer_phone, status, created_at, updated_at FROM bookings WHERE id = ?');
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Booking not found']);
        exit;
    }
    if (is_string($row['addons'])) {
        $row['addons'] = json_decode($row['addons'], true) ?? [];
    }
    echo json_encode(['success' => true, 'booking' => $row]);
    exit;
}

// GET list
if ($method === 'GET') {
    $stmt = $pdo->query('SELECT id, studio_id, booking_date, timing_slot, addons, extra_requests, customer_name, customer_email, customer_phone, status, created_at FROM bookings ORDER BY created_at DESC');
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        if (is_string($r['addons'])) {
            $r['addons'] = json_decode($r['addons'], true) ?? [];
        }
    }
    echo json_encode(['success' => true, 'bookings' => $rows]);
    exit;
}

// PUT update
if ($method === 'PUT' && $id > 0) {
    $raw = file_get_contents('php://input');
    $input = is_string($raw) ? json_decode($raw, true) : null;
    $input = is_array($input) ? $input : [];

    $validStatus = ['pending', 'confirmed', 'cancelled'];
    $status = isset($input['status']) && in_array($input['status'], $validStatus, true) ? $input['status'] : null;
    $customerName = isset($input['customer_name']) ? trim((string) $input['customer_name']) : null;
    $customerEmail = isset($input['customer_email']) ? trim((string) $input['customer_email']) : null;
    $customerPhone = isset($input['customer_phone']) ? trim((string) $input['customer_phone']) : null;
    $bookingDate = isset($input['booking_date']) ? (string) $input['booking_date'] : null;
    $timingSlot = isset($input['timing_slot']) ? (string) $input['timing_slot'] : null;
    $studioId = isset($input['studio_id']) ? (string) $input['studio_id'] : null;
    $extraRequests = array_key_exists('extra_requests', $input) ? trim((string) $input['extra_requests']) : null;
    $addons = isset($input['addons']) && is_array($input['addons']) ? $input['addons'] : null;

    $updates = [];
    $params = [':id' => $id];
    if ($status !== null) {
        $updates[] = 'status = :status';
        $params[':status'] = $status;
    }
    if ($customerName !== null) {
        $updates[] = 'customer_name = :customer_name';
        $params[':customer_name'] = mb_substr($customerName, 0, 255);
    }
    if ($customerEmail !== null) {
        $updates[] = 'customer_email = :customer_email';
        $params[':customer_email'] = mb_substr($customerEmail, 0, 255);
    }
    if ($customerPhone !== null) {
        $updates[] = 'customer_phone = :customer_phone';
        $params[':customer_phone'] = mb_substr($customerPhone, 0, 50);
    }
    if ($bookingDate !== null && preg_match('/^\d{4}-\d{2}-\d{2}$/', $bookingDate)) {
        $updates[] = 'booking_date = :booking_date';
        $params[':booking_date'] = $bookingDate;
    }
    if ($timingSlot !== null && in_array($timingSlot, ['2h', '4h', '12h', '24h'], true)) {
        $updates[] = 'timing_slot = :timing_slot';
        $params[':timing_slot'] = $timingSlot;
    }
    if ($studioId !== null && in_array($studioId, ['1', '2', '3', '4'], true)) {
        $updates[] = 'studio_id = :studio_id';
        $params[':studio_id'] = $studioId;
    }
    if ($extraRequests !== null) {
        $updates[] = 'extra_requests = :extra_requests';
        $params[':extra_requests'] = mb_substr($extraRequests, 0, 2000);
    }
    if ($addons !== null) {
        $updates[] = 'addons = :addons';
        $params[':addons'] = json_encode(array_values($addons));
    }

    if (count($updates) === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No valid fields to update']);
        exit;
    }

    $sql = 'UPDATE bookings SET ' . implode(', ', $updates) . ' WHERE id = :id';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['success' => true, 'message' => 'Booking updated']);
    exit;
}

// DELETE
if ($method === 'DELETE' && $id > 0) {
    $stmt = $pdo->prepare('DELETE FROM bookings WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Booking not found']);
        exit;
    }
    echo json_encode(['success' => true, 'message' => 'Booking deleted']);
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);
