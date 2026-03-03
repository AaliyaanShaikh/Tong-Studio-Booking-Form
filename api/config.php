<?php
/**
 * Copy this file to config.php and set your values.
 * Add config.php to .gitignore so credentials are not committed.
 */

return [
    'db' => [
        'host'     => 'localhost',
        'name'     => 'tongdigitalsstudio',
        'user'     => 'root',
        'password' => '',
        'charset'  => 'utf8mb4',
    ],
    'api' => [
        'allowed_origins' => ['https://studio.tongdigitals.com', 'http://localhost:5173'],
        'max_requests_per_minute' => 25,
    ],
];
