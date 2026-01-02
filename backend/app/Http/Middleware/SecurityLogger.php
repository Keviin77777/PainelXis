<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SecurityLogger
{
    /**
     * Rotas críticas que devem ser logadas
     */
    private $criticalRoutes = [
        'login',
        'logout',
        'servers',
        'clients',
        'plans',
        'users',
    ];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $path = $request->path();
        $method = $request->method();
        
        // Verifica se é uma rota crítica
        $isCritical = false;
        foreach ($this->criticalRoutes as $route) {
            if (str_contains($path, $route)) {
                $isCritical = true;
                break;
            }
        }
        
        // Log de ações críticas
        if ($isCritical || in_array($method, ['POST', 'PUT', 'DELETE'])) {
            Log::channel('security')->info('Security Event', [
                'user_id' => auth()->id() ?? 'guest',
                'username' => auth()->user()->username ?? 'guest',
                'ip' => $request->ip(),
                'method' => $method,
                'path' => $path,
                'user_agent' => $request->userAgent(),
                'timestamp' => now()->toDateTimeString(),
            ]);
        }
        
        // Detecta tentativas suspeitas
        $this->detectSuspiciousActivity($request);
        
        return $next($request);
    }
    
    /**
     * Detecta atividades suspeitas
     */
    private function detectSuspiciousActivity(Request $request)
    {
        $suspicious = false;
        $reason = '';
        
        // SQL Injection patterns
        $sqlPatterns = ['union', 'select', 'drop', 'insert', 'update', 'delete', '--', ';--'];
        foreach ($request->all() as $key => $value) {
            if (is_string($value)) {
                foreach ($sqlPatterns as $pattern) {
                    if (stripos($value, $pattern) !== false) {
                        $suspicious = true;
                        $reason = 'Possible SQL Injection attempt';
                        break 2;
                    }
                }
            }
        }
        
        // XSS patterns
        $xssPatterns = ['<script', 'javascript:', 'onerror=', 'onload='];
        foreach ($request->all() as $key => $value) {
            if (is_string($value)) {
                foreach ($xssPatterns as $pattern) {
                    if (stripos($value, $pattern) !== false) {
                        $suspicious = true;
                        $reason = 'Possible XSS attempt';
                        break 2;
                    }
                }
            }
        }
        
        if ($suspicious) {
            Log::channel('security')->warning('SUSPICIOUS ACTIVITY DETECTED', [
                'reason' => $reason,
                'ip' => $request->ip(),
                'path' => $request->path(),
                'data' => $request->all(),
                'user_agent' => $request->userAgent(),
            ]);
        }
    }
}
