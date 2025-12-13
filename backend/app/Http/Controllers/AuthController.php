<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;
use Jenssegers\Agent\Agent;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        if (!$token = auth()->attempt($credentials)) {
            return response()->json(['error' => 'Credenciais inválidas'], 401);
        }

        // Criar sessão
        $this->createSession($request, $token);

        return $this->respondWithToken($token);
    }

    protected function createSession(Request $request, string $token)
    {
        $agent = new Agent();
        $agent->setUserAgent($request->userAgent());
        
        Session::create([
            'user_id' => auth()->id(),
            'token' => $token,
            'device' => $this->getDevice($agent),
            'browser' => $agent->browser(),
            'browser_version' => $agent->version($agent->browser()),
            'os' => $agent->platform(),
            'os_version' => $agent->version($agent->platform()),
            'ip_address' => $request->ip(),
            'location' => $this->getLocation($request->ip()),
            'user_agent' => $request->userAgent(),
            'last_activity' => now(),
        ]);
    }

    protected function getDevice(Agent $agent): string
    {
        if ($agent->isPhone()) {
            return $agent->device() ?: 'Smartphone';
        }
        
        if ($agent->isTablet()) {
            return $agent->device() ?: 'Tablet';
        }
        
        return $agent->device() ?: 'Desktop';
    }

    protected function getLocation(string $ip): string
    {
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return 'Local, BR';
        }
        return 'Brasil';
    }

    public function me()
    {
        return response()->json(auth()->user());
    }

    public function logout(Request $request)
    {
        $token = $request->bearerToken();
        
        // Remover sessão
        if ($token) {
            Session::where('token', $token)->delete();
        }
        
        auth()->logout();
        return response()->json(['message' => 'Logout realizado com sucesso']);
    }

    public function refresh()
    {
        return $this->respondWithToken(auth()->refresh());
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60
        ]);
    }
}
