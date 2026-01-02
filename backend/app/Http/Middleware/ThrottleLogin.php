<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ThrottleLogin
{
    /**
     * Máximo de tentativas permitidas
     */
    private $maxAttempts = 10;
    
    /**
     * Tempo de bloqueio em minutos
     */
    private $decayMinutes = 15;

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $this->throttleKey($request);
        $attempts = Cache::get($key, 0);
        
        // Verifica se está bloqueado
        if ($attempts >= $this->maxAttempts) {
            $remainingTime = Cache::get($key . '_blocked_until');
            
            if ($remainingTime && now()->lt($remainingTime)) {
                $minutes = now()->diffInMinutes($remainingTime);
                
                Log::channel('security')->warning('Login blocked - Too many attempts', [
                    'ip' => $request->ip(),
                    'username' => $request->input('username'),
                    'attempts' => $attempts,
                    'remaining_minutes' => $minutes,
                ]);
                
                return response()->json([
                    'error' => "Muitas tentativas de login. Tente novamente em {$minutes} minutos.",
                    'retry_after' => $minutes * 60,
                ], 429);
            }
            
            // Tempo expirou, reseta contador
            Cache::forget($key);
            Cache::forget($key . '_blocked_until');
        }
        
        return $next($request);
    }
    
    /**
     * Incrementa contador de tentativas
     * 
     * @return int Número de tentativas realizadas
     */
    public function incrementAttempts(Request $request): int
    {
        $key = $this->throttleKey($request);
        $attempts = Cache::get($key, 0) + 1;
        
        Cache::put($key, $attempts, now()->addMinutes($this->decayMinutes));
        
        if ($attempts >= $this->maxAttempts) {
            $blockedUntil = now()->addMinutes($this->decayMinutes);
            Cache::put($key . '_blocked_until', $blockedUntil, $blockedUntil);
            
            Log::channel('security')->alert('IP BLOCKED - Too many failed login attempts', [
                'ip' => $request->ip(),
                'email' => $request->input('email'),
                'attempts' => $attempts,
                'blocked_until' => $blockedUntil->toDateTimeString(),
            ]);
        }
        
        return $attempts;
    }
    
    /**
     * Retorna quantas tentativas restam
     * 
     * @return int Tentativas restantes
     */
    public function getRemainingAttempts(Request $request): int
    {
        $key = $this->throttleKey($request);
        $attempts = Cache::get($key, 0);
        $remaining = max(0, $this->maxAttempts - $attempts);
        
        return $remaining;
    }
    
    /**
     * Reseta contador de tentativas
     */
    public function clearAttempts(Request $request)
    {
        $key = $this->throttleKey($request);
        Cache::forget($key);
        Cache::forget($key . '_blocked_until');
    }
    
    /**
     * Gera chave única para o throttle
     */
    private function throttleKey(Request $request): string
    {
        return 'login_attempts_' . $request->ip();
    }
}
