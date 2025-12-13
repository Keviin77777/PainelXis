<?php

namespace App\Http\Controllers;

use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SessionController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $currentToken = $request->bearerToken();
        
        $sessions = Session::where('user_id', $user->id)
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) use ($currentToken) {
                return [
                    'id' => $session->id,
                    'device' => $session->device,
                    'browser' => $session->browser,
                    'browserVersion' => $session->browser_version,
                    'os' => $session->os,
                    'osVersion' => $session->os_version,
                    'ip' => $session->ip_address,
                    'location' => $session->location,
                    'lastActivity' => $session->last_activity->toIso8601String(),
                    'loginAt' => $session->created_at->toIso8601String(),
                    'isCurrent' => $session->token === $currentToken,
                    'userAgent' => $session->user_agent,
                ];
            });

        return response()->json($sessions);
    }

    public function count(Request $request)
    {
        $user = Auth::user();
        $count = Session::where('user_id', $user->id)->count();
        
        return response()->json(['count' => $count]);
    }

    public function destroy(Request $request, $id)
    {
        $user = Auth::user();
        $currentToken = $request->bearerToken();
        
        $session = Session::where('user_id', $user->id)
            ->where('id', $id)
            ->first();

        if (!$session) {
            return response()->json(['error' => 'Sessão não encontrada'], 404);
        }

        if ($session->token === $currentToken) {
            return response()->json(['error' => 'Não é possível encerrar a sessão atual'], 400);
        }

        $session->delete();

        return response()->json(['message' => 'Sessão encerrada com sucesso']);
    }

    public function revokeAll(Request $request)
    {
        $user = Auth::user();
        $currentToken = $request->bearerToken();
        
        Session::where('user_id', $user->id)
            ->where('token', '!=', $currentToken)
            ->delete();

        return response()->json(['message' => 'Todas as outras sessões foram encerradas']);
    }
}
