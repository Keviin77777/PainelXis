<?php

namespace App\Http\Controllers;

use App\Models\Server;
use App\Services\AdminApiService;
use Illuminate\Http\Request;

class ServerController extends Controller
{
    protected $adminApiService;

    public function __construct(AdminApiService $adminApiService)
    {
        $this->adminApiService = $adminApiService;
    }

    /**
     * Lista todos os servidores
     */
    public function index()
    {
        $servers = Server::orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($servers);
    }

    /**
     * Cria um novo servidor
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'url' => 'required|string',
            'api_key' => 'required|string',
            'api_version' => 'nullable|string',
            'use_proxy' => 'nullable|boolean',
            'status' => 'required|in:active,inactive',
            'save_action' => 'nullable|string',
            'primary_dns' => 'nullable|string',
            'random_dns' => 'nullable|string',
            'reseller_group_id' => 'nullable|string',
            'order' => 'nullable|integer',
            'timezone' => 'nullable|string',
            'default_password' => 'nullable|string',
            'allowed_bouquets' => 'nullable|array',
            'max_connections' => 'nullable|integer',
            'max_clients' => 'nullable|integer',
            'template' => 'nullable|string'
        ]);

        $server = Server::create($validated);
        
        return response()->json([
            'message' => 'Servidor adicionado com sucesso',
            'data' => $server
        ], 201);
    }

    /**
     * Mostra um servidor específico
     */
    public function show($id)
    {
        $server = Server::findOrFail($id);
        return response()->json($server);
    }

    /**
     * Atualiza um servidor
     */
    public function update(Request $request, $id)
    {
        $server = Server::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string',
            'url' => 'required|string',
            'api_key' => 'required|string',
            'api_version' => 'nullable|string',
            'use_proxy' => 'nullable|boolean',
            'status' => 'required|in:active,inactive',
            'save_action' => 'nullable|string',
            'primary_dns' => 'nullable|string',
            'random_dns' => 'nullable|string',
            'reseller_group_id' => 'nullable|string',
            'order' => 'nullable|integer',
            'timezone' => 'nullable|string',
            'default_password' => 'nullable|string',
            'allowed_bouquets' => 'nullable|array',
            'max_connections' => 'nullable|integer',
            'max_clients' => 'nullable|integer',
            'template' => 'nullable|string'
        ]);

        $server->update($validated);
        
        return response()->json([
            'message' => 'Servidor atualizado com sucesso',
            'data' => $server
        ]);
    }

    /**
     * Remove um servidor
     */
    public function destroy($id)
    {
        $server = Server::findOrFail($id);
        $server->delete();
        
        return response()->json([
            'message' => 'Servidor removido com sucesso'
        ]);
    }

    /**
     * Testa a conexão com o servidor
     */
    public function test(Request $request)
    {
        try {
            $validated = $request->validate([
                'url' => 'required|string',
                'api_key' => 'required|string',
            ]);

            $result = $this->adminApiService->testConnection(
                $validated['url'],
                $validated['api_key']
            );
            
            if ($result['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Conexão testada com sucesso!',
                    'data' => $result['data'] ?? null
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Falha ao testar conexão'
            ], 400);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erro ao testar conexão: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erro ao testar conexão: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Testa e busca grupos sem salvar servidor
     */
    public function testGroups(Request $request)
    {
        try {
            $validated = $request->validate([
                'url' => 'required|string',
                'api_key' => 'required|string',
            ]);

            $url = rtrim($validated['url'], '/') . '/';
            
            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->get($url, [
                    'api_key' => $validated['api_key'],
                    'action' => 'get_groups'
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar grupos: HTTP ' . $response->status()
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Erro ao testar grupos', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar grupos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Testa e busca bouquets sem salvar servidor
     */
    public function testBouquets(Request $request)
    {
        try {
            $validated = $request->validate([
                'url' => 'required|string',
                'api_key' => 'required|string',
            ]);

            $url = rtrim($validated['url'], '/') . '/';
            
            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->get($url, [
                    'api_key' => $validated['api_key'],
                    'action' => 'get_bouquets'
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar bouquets: HTTP ' . $response->status()
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Erro ao testar bouquets', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar bouquets: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Busca grupos de revendedores da Admin API
     */
    public function getGroups($id)
    {
        try {
            $server = Server::findOrFail($id);
            
            // Normaliza a URL
            $url = rtrim($server->url, '/') . '/';
            
            // Faz a chamada usando as credenciais do servidor específico
            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->get($url, [
                    'api_key' => $server->api_key,
                    'action' => 'get_groups'
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar grupos: HTTP ' . $response->status()
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Erro ao buscar grupos', [
                'server_id' => $id,
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar grupos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Busca bouquets da Admin API
     */
    public function getBouquets($id)
    {
        try {
            $server = Server::findOrFail($id);
            
            // Normaliza a URL
            $url = rtrim($server->url, '/') . '/';
            
            // Faz a chamada usando as credenciais do servidor específico
            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->get($url, [
                    'api_key' => $server->api_key,
                    'action' => 'get_bouquets'
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar bouquets: HTTP ' . $response->status()
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Erro ao buscar bouquets', [
                'server_id' => $id,
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar bouquets: ' . $e->getMessage()
            ], 500);
        }
    }
}
