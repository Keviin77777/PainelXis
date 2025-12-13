<?php

namespace App\Http\Controllers;

use App\Models\Server;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Lista todos os clientes
     */
    public function index(Request $request)
    {
        // Verifica se há pelo menos um servidor cadastrado
        $hasServers = Server::count() > 0;
        
        return response()->json([
            'data' => [],
            'current_page' => 1,
            'last_page' => 1,
            'per_page' => 10,
            'total' => 0,
            'is_configured' => true, // Sempre true, validação será feita ao criar cliente
            'has_servers' => $hasServers
        ]);
    }

    /**
     * Exibe um cliente específico
     */
    public function show($id)
    {
        $hasServers = Server::count() > 0;
        
        if (!$hasServers) {
            return response()->json([
                'error' => 'Nenhum servidor configurado',
                'is_configured' => false
            ], 400);
        }
        
        return response()->json([
            'error' => 'Cliente não encontrado',
        ], 404);
    }

    /**
     * Cria um novo cliente
     */
    public function store(Request $request)
    {
        $hasServers = Server::count() > 0;
        
        if (!$hasServers) {
            return response()->json([
                'error' => 'Nenhum servidor configurado',
                'is_configured' => false
            ], 400);
        }
        
        return response()->json([
            'error' => 'Funcionalidade em desenvolvimento',
        ], 501);
    }

    /**
     * Atualiza um cliente
     */
    public function update(Request $request, $id)
    {
        $hasServers = Server::count() > 0;
        
        if (!$hasServers) {
            return response()->json([
                'error' => 'Nenhum servidor configurado',
                'is_configured' => false
            ], 400);
        }
        
        return response()->json([
            'error' => 'Funcionalidade em desenvolvimento',
        ], 501);
    }

    /**
     * Remove um cliente
     */
    public function destroy($id)
    {
        $hasServers = Server::count() > 0;
        
        if (!$hasServers) {
            return response()->json([
                'error' => 'Nenhum servidor configurado',
                'is_configured' => false
            ], 400);
        }
        
        return response()->json([
            'error' => 'Funcionalidade em desenvolvimento',
        ], 501);
    }
}
