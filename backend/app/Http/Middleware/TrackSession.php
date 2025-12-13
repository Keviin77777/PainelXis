<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Jenssegers\Agent\Agent;

class TrackSession
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $token = $request->bearerToken();
            
            if ($token) {
                $agent = new Agent();
                $agent->setUserAgent($request->userAgent());
                
                Session::updateOrCreate(
                    [
                        'user_id' => Auth::id(),
                        'token' => $token,
                    ],
                    [
                        'device' => $this->getDevice($agent),
                        'browser' => $agent->browser(),
                        'browser_version' => $agent->version($agent->browser()),
                        'os' => $agent->platform(),
                        'os_version' => $agent->version($agent->platform()),
                        'ip_address' => $request->ip(),
                        'location' => $this->getLocation($request->ip()),
                        'user_agent' => $request->userAgent(),
                        'last_activity' => now(),
                    ]
                );
            }
        }

        return $next($request);
    }

    private function getDevice(Agent $agent): string
    {
        if ($agent->isPhone()) {
            return $agent->device() ?: 'Smartphone';
        }
        
        if ($agent->isTablet()) {
            return $agent->device() ?: 'Tablet';
        }
        
        return $agent->device() ?: 'Desktop';
    }

    private function getLocation(string $ip): string
    {
        // Para desenvolvimento local
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return 'Local, BR';
        }

        // Aqui você pode integrar com um serviço de geolocalização
        // Por exemplo: ipapi.co, ip-api.com, etc.
        // Por enquanto, retorna uma localização padrão
        return 'Brasil';
    }
}
