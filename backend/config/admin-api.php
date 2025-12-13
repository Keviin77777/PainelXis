<?php

return [
    'url' => env('ADMIN_API_URL'),
    'code' => env('ADMIN_API_CODE'),
    'timeout' => env('ADMIN_API_TIMEOUT', 30),
    
    'endpoints' => [
        // Info
        'user_info' => '/api.php?action=user_info',
        'get_lines' => '/api.php?action=get_lines',
        'get_users' => '/api.php?action=get_users',
        'get_mags' => '/api.php?action=get_mags',
        
        // Lines
        'create_line' => '/api.php?action=create_line',
        'edit_line' => '/api.php?action=edit_line',
        'delete_line' => '/api.php?action=delete_line',
        
        // Users
        'create_user' => '/api.php?action=create_user',
        'edit_user' => '/api.php?action=edit_user',
        'delete_user' => '/api.php?action=delete_user',
        
        // Logs
        'activity_logs' => '/api.php?action=activity_logs',
        'live_connections' => '/api.php?action=live_connections',
    ],
];
