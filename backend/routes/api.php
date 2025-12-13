<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
// use App\Http\Controllers\LineController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ServerController;
use App\Http\Controllers\LiveConnectionController;
use App\Http\Controllers\PlanController;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:api')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/refresh', [AuthController::class, 'refresh']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    
    // Lines
    // Route::apiResource('lines', LineController::class);
    
    // Users
    // Route::apiResource('users', UserController::class);
    
    // MAG Devices
    // Route::apiResource('mags', MagController::class);
    
    // Settings
    Route::get('/settings/admin-api', [SettingsController::class, 'getAdminApiConfig']);
    Route::post('/settings/admin-api', [SettingsController::class, 'updateAdminApiConfig']);
    Route::post('/settings/admin-api/test', [SettingsController::class, 'testAdminApiConnection']);
    
    // Sessions
    Route::get('/sessions', [SessionController::class, 'index']);
    Route::get('/sessions/count', [SessionController::class, 'count']);
    Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);
    Route::post('/sessions/revoke-all', [SessionController::class, 'revokeAll']);
    
    // Clients
    Route::apiResource('clients', ClientController::class);
    
    // Servers
    Route::apiResource('servers', ServerController::class);
    Route::post('/servers/test', [ServerController::class, 'test']);
    Route::post('/servers/test-groups', [ServerController::class, 'testGroups']);
    Route::post('/servers/test-bouquets', [ServerController::class, 'testBouquets']);
    Route::get('/servers/{id}/groups', [ServerController::class, 'getGroups']);
    Route::get('/servers/{id}/bouquets', [ServerController::class, 'getBouquets']);
    
    // Live Connections
    Route::get('/live-connections', [LiveConnectionController::class, 'index']);
    
    // Plans
    Route::apiResource('plans', PlanController::class);
});
