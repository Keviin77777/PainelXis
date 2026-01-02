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
     * Cria um novo servidor e automaticamente cria um usuário revendedor no XUI-ONE
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

        try {
            \Log::info('Iniciando criação de servidor', [
                'name' => $validated['name'],
                'has_reseller_group_id' => !empty($validated['reseller_group_id']),
                'reseller_group_id' => $validated['reseller_group_id'] ?? 'vazio'
            ]);
            
            // SEMPRE cria um novo revendedor automaticamente (ignora reseller_group_id fornecido)
            \Log::info('Criando revendedor automaticamente para o painel...');
            
            $resellerResult = $this->createPanelReseller($validated['url'], $validated['api_key']);
            
            if ($resellerResult['success']) {
                $validated['reseller_group_id'] = $resellerResult['reseller_id'];
                $validated['reseller_username'] = $resellerResult['username'];
                $validated['reseller_password'] = encrypt($resellerResult['password']); // Criptografa a senha
                
                \Log::info('✅ Revendedor criado automaticamente com sucesso!', [
                    'reseller_id' => $resellerResult['reseller_id'],
                    'username' => $resellerResult['username']
                ]);
            } else {
                \Log::error('❌ Falha ao criar revendedor automaticamente', [
                    'error' => $resellerResult['message']
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Erro ao criar revendedor: ' . $resellerResult['message']
                ], 500);
            }

            $server = Server::create($validated);
            
            return response()->json([
                'message' => 'Servidor adicionado com sucesso',
                'data' => $server,
                'reseller_created' => !empty($validated['reseller_group_id'])
            ], 201);
            
        } catch (\Exception $e) {
            \Log::error('Erro ao criar servidor', [
                'message' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Erro ao criar servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cria um USUÁRIO REVENDEDOR no XUI-ONE para este painel
     * Este usuário terá créditos ilimitados e todas as permissões
     * Baseado na documentação: https://www.worldofiptv.com/threads/xui-one-admin-api-placeholder.13919/
     */
    private function createPanelReseller($url, $apiKey)
    {
        try {
            $url = rtrim($url, '/') . '/';
            
            // Primeiro, busca os grupos de revendedores disponíveis
            $groupsResponse = \Illuminate\Support\Facades\Http::timeout(30)
                ->get($url, [
                    'api_key' => $apiKey,
                    'action' => 'get_groups'
                ]);

            if (!$groupsResponse->successful()) {
                return [
                    'success' => false,
                    'message' => 'Erro ao buscar grupos: HTTP ' . $groupsResponse->status()
                ];
            }

            $groupsData = $groupsResponse->json();
            \Log::info('Grupos disponíveis', ['groups' => $groupsData]);
            
            // Filtra grupos de revendedores (is_admin != "1")
            // Procura por grupos MASTER ou FRANQUIA primeiro
            $resellerGroups = [];
            $preferredGroup = null;
            
            if (is_array($groupsData)) {
                foreach ($groupsData as $group) {
                    if (isset($group['is_admin']) && $group['is_admin'] != "1") {
                        $resellerGroups[] = $group;
                        
                        // Prioriza grupos MASTER ou FRANQUIA
                        $groupName = strtoupper($group['name'] ?? $group['group_name'] ?? '');
                        if (strpos($groupName, 'MASTER') !== false || strpos($groupName, 'FRANQUIA') !== false) {
                            $preferredGroup = $group;
                        }
                    }
                }
            }
            
            if (empty($resellerGroups)) {
                return [
                    'success' => false,
                    'message' => 'Nenhum grupo de revendedor encontrado. Crie um grupo MASTER ou FRANQUIA no painel XUI-ONE primeiro.'
                ];
            }
            
            // Usa o grupo preferido (MASTER/FRANQUIA) ou o primeiro disponível
            $selectedGroup = $preferredGroup ?? $resellerGroups[0];
            $groupId = $selectedGroup['id'] ?? $selectedGroup['group_id'] ?? null;
            
            if (!$groupId) {
                return [
                    'success' => false,
                    'message' => 'ID do grupo não encontrado'
                ];
            }
            
            \Log::info('Usando grupo de revendedor', [
                'group_id' => $groupId,
                'group_name' => $selectedGroup['name'] ?? $selectedGroup['group_name'] ?? 'N/A'
            ]);
            
            // Gera credenciais únicas para o revendedor do painel
            $username = 'painel_' . substr(md5(uniqid()), 0, 8);
            $password = bin2hex(random_bytes(8)); // Senha aleatória de 16 caracteres
            
            // Parâmetros conforme documentação XUI-ONE
            // create_user: username, password, email (optional), member_group_id, credits, notes (optional)
            // O grupo já define se é revendedor, não precisa enviar is_reseller
            // Créditos: 100000 simula "ilimitado" (padrão de painéis em produção)
            $params = [
                'api_key' => $apiKey,
                'action' => 'create_user',
                'username' => $username,
                'password' => $password,
                'email' => '', // Opcional
                'member_group_id' => (int) $groupId, // ID do grupo como INTEIRO
                'credits' => 100000, // 100 mil créditos (praticamente ilimitado)
                'notes' => 'Revendedor criado automaticamente pelo painel de gerenciamento'
            ];
            
            \Log::info('Criando revendedor no XUI-ONE', [
                'username' => $username,
                'group_id' => $groupId,
                'url' => $url
            ]);
            
            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->get($url, $params);

            \Log::info('Resposta HTTP create_user', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                \Log::info('Resposta JSON create_user', ['data' => $data]);
                
                // Verifica se houve erro na resposta
                if (isset($data['status']) && strpos($data['status'], 'ERROR') !== false) {
                    return [
                        'success' => false,
                        'message' => 'Erro da API: ' . $data['status']
                    ];
                }
                
                if (isset($data['error']) && $data['error']) {
                    return [
                        'success' => false,
                        'message' => is_string($data['error']) ? $data['error'] : 'Erro ao criar revendedor'
                    ];
                }
                
                // A API XUI-ONE retorna o ID do usuário criado
                $resellerId = null;
                
                if (isset($data['user_id'])) {
                    $resellerId = $data['user_id'];
                } elseif (isset($data['id'])) {
                    $resellerId = $data['id'];
                } elseif (isset($data['data']['user_id'])) {
                    $resellerId = $data['data']['user_id'];
                } elseif (isset($data['data']['id'])) {
                    $resellerId = $data['data']['id'];
                }
                
                if ($resellerId) {
                    \Log::info('Revendedor criado com sucesso', [
                        'reseller_id' => $resellerId,
                        'username' => $username,
                        'group_id' => $groupId
                    ]);
                    
                    return [
                        'success' => true,
                        'reseller_id' => (string) $resellerId,
                        'username' => $username,
                        'password' => $password
                    ];
                }
                
                // Se status é SUCCESS mas não tem ID, considera sucesso
                if (isset($data['status']) && strpos($data['status'], 'SUCCESS') !== false) {
                    \Log::info('Revendedor criado (sem ID retornado)', [
                        'username' => $username,
                        'group_id' => $groupId
                    ]);
                    
                    // Usa o group_id como reseller_id temporariamente
                    return [
                        'success' => true,
                        'reseller_id' => (string) $groupId,
                        'username' => $username,
                        'password' => $password
                    ];
                }
                
                return [
                    'success' => false,
                    'message' => 'Resposta inesperada da API: ' . json_encode($data)
                ];
            }

            return [
                'success' => false,
                'message' => 'Erro HTTP: ' . $response->status() . ' - ' . $response->body()
            ];
            
        } catch (\Exception $e) {
            \Log::error('Erro ao criar revendedor', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
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
     * Busca bouquets permitidos do servidor (configurados em allowed_bouquets)
     */
    public function getBouquets($id)
    {
        try {
            $server = Server::findOrFail($id);
            
            // Se não houver bouquets configurados, retorna array vazio
            if (!$server->allowed_bouquets || !is_array($server->allowed_bouquets) || count($server->allowed_bouquets) === 0) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'Nenhum bouquet configurado para este servidor'
                ]);
            }
            
            // Normaliza a URL
            $url = rtrim($server->url, '/') . '/';
            
            // Faz a chamada usando as credenciais do servidor específico
            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->get($url, [
                    'api_key' => $server->api_key,
                    'action' => 'get_bouquets'
                ]);

            if ($response->successful()) {
                $allBouquets = $response->json();
                
                // Converte para array se necessário
                if (is_object($allBouquets)) {
                    $allBouquets = (array) $allBouquets;
                }
                
                // Se não for array, tenta pegar de dentro de um objeto
                if (!is_array($allBouquets)) {
                    $allBouquets = [];
                }
                
                // Filtra apenas os bouquets permitidos
                $allowedBouquetIds = array_map('strval', $server->allowed_bouquets);
                $filteredBouquets = [];
                
                foreach ($allBouquets as $bouquet) {
                    // Converte para array se for objeto
                    if (is_object($bouquet)) {
                        $bouquet = (array) $bouquet;
                    }
                    
                    // Pega o ID do bouquet (pode ser 'id' ou 'bouquet_id')
                    $bouquetId = strval($bouquet['id'] ?? $bouquet['bouquet_id'] ?? '');
                    
                    // Se o ID está na lista de permitidos, adiciona
                    if (in_array($bouquetId, $allowedBouquetIds)) {
                        $filteredBouquets[] = $bouquet;
                    }
                }
                
                return response()->json([
                    'success' => true,
                    'data' => $filteredBouquets
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
