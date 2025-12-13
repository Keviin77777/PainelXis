<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LiveConnectionController extends Controller
{
    /**
     * Lista todas as conexões ao vivo
     */
    public function index()
    {
        // Por enquanto retorna vazio
        // Quando integrar com Admin API, buscar as conexões reais
        return response()->json([
            'data' => [],
            'is_configured' => false
        ]);
    }
}
