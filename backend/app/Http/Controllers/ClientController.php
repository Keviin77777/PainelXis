<?php

namespace App\Http\Controllers;

use App\Models\Server;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * Lista todos os clientes de todos os servidores ativos
     */
    public function index(Request $request)
    {
        try {
            // Verifica se há pelo menos um servidor cadastrado
            $hasServers = Server::count() > 0;
            
            if (!$hasServers) {
                return response()->json([
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => 10,
                    'total' => 0,
                    'is_configured' => true,
                    'has_servers' => false
                ]);
            }

            // Busca todos os servidores ativos
            $servers = Server::where('status', 'active')->get();
            
            $allClients = [];
            
            // Para cada servidor, busca os clientes
            foreach ($servers as $server) {
                try {
                    $url = rtrim($server->url, '/') . '/';
                    
                    // Parâmetros base
                    $params = [
                        'api_key' => $server->api_key,
                        'action' => 'get_lines'
                    ];
                    
                    // Se o servidor tem um grupo de revendedor configurado, filtra apenas os clientes desse grupo
                    if (!empty($server->reseller_group_id)) {
                        $params['reseller_id'] = $server->reseller_group_id;
                    }
                    
                    $response = \Illuminate\Support\Facades\Http::timeout(30)
                        ->get($url, $params);

                    if ($response->successful()) {
                        $data = $response->json();
                        
                        // A API pode retornar um array direto ou dentro de 'data'
                        $lines = $data['data'] ?? $data ?? [];
                        
                        if (is_array($lines)) {
                            foreach ($lines as $line) {
                                // Filtra apenas clientes do grupo de revendedor configurado
                                // Se reseller_group_id está configurado, só mostra clientes desse grupo
                                if (!empty($server->reseller_group_id)) {
                                    $lineResellerId = $line['reseller_id'] ?? $line['owner_id'] ?? null;
                                    
                                    // Se o cliente não pertence ao grupo configurado, pula
                                    if ($lineResellerId != $server->reseller_group_id) {
                                        continue;
                                    }
                                }
                                
                                // Adiciona informações do servidor a cada cliente
                                $line['server_id'] = $server->id;
                                $line['server_name'] = $server->name;
                                $allClients[] = $line;
                            }
                        }
                    }
                } catch (\Exception $e) {
                    \Log::warning('Erro ao buscar clientes do servidor ' . $server->name, [
                        'error' => $e->getMessage()
                    ]);
                    // Continua para o próximo servidor
                    continue;
                }
            }

            // Filtros
            $search = $request->input('search');
            $status = $request->input('status');
            
            if ($search) {
                $allClients = array_filter($allClients, function($client) use ($search) {
                    $searchLower = strtolower($search);
                    return stripos($client['username'] ?? '', $search) !== false ||
                           stripos($client['name'] ?? '', $search) !== false ||
                           stripos($client['email'] ?? '', $search) !== false;
                });
            }

            if ($status && $status !== 'all') {
                $allClients = array_filter($allClients, function($client) use ($status) {
                    $clientStatus = $this->determineStatus($client);
                    return $clientStatus === $status;
                });
            }

            // Paginação
            $perPage = (int) $request->input('per_page', 10);
            $page = (int) $request->input('page', 1);
            $total = count($allClients);
            $lastPage = ceil($total / $perPage);
            
            // Slice para paginação
            $offset = ($page - 1) * $perPage;
            $paginatedClients = array_slice($allClients, $offset, $perPage);
            
            // Reindexar array
            $paginatedClients = array_values($paginatedClients);

            return response()->json([
                'data' => $paginatedClients,
                'current_page' => $page,
                'last_page' => $lastPage,
                'per_page' => $perPage,
                'total' => $total,
                'is_configured' => true,
                'has_servers' => true
            ]);

        } catch (\Exception $e) {
            \Log::error('Erro ao listar clientes', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 10,
                'total' => 0,
                'is_configured' => true,
                'has_servers' => $hasServers ?? false,
                'error' => 'Erro ao buscar clientes'
            ]);
        }
    }

    /**
     * Determina o status do cliente baseado na data de expiração
     */
    private function determineStatus($client)
    {
        // Se o cliente está explicitamente desabilitado
        if (isset($client['enabled']) && $client['enabled'] == 0) {
            return 'inactive';
        }

        // Verifica a data de expiração
        if (isset($client['exp_date']) || isset($client['expiry_date'])) {
            $expiryDate = $client['exp_date'] ?? $client['expiry_date'];
            
            // Se for timestamp
            if (is_numeric($expiryDate)) {
                $expiryTimestamp = (int) $expiryDate;
            } else {
                $expiryTimestamp = strtotime($expiryDate);
            }
            
            $now = time();
            
            if ($expiryTimestamp < $now) {
                return 'expired';
            }
        }

        return 'active';
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
     * Cria um novo cliente usando a API create_line
     */
    public function store(Request $request)
    {
        try {
            // Validação dos dados
            $validated = $request->validate([
                'server_id' => 'required|exists:servers,id',
                'plan' => 'required|exists:plans,id',
                'connections' => 'required|integer|min:1',
                'username' => 'required|string|min:6|max:20',
                'password' => 'required|string|min:8',
                'expiry_date' => 'nullable|date',
                'plan_price' => 'nullable|numeric',
                'bouquets' => 'nullable|array',
                'name' => 'nullable|string',
                'email' => 'nullable|email',
                'telegram' => 'nullable|string',
                'whatsapp' => 'nullable|string',
                'notes' => 'nullable|string',
            ]);

            // Busca o servidor
            $server = Server::findOrFail($validated['server_id']);
            
            // Busca o plano
            $plan = \App\Models\Plan::findOrFail($validated['plan']);
            
            // Verifica se o servidor está ativo
            if ($server->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'O servidor selecionado está inativo'
                ], 400);
            }

            // Prepara os dados para a API
            $apiParams = [
                'username' => $validated['username'],
                'password' => $validated['password'],
                'max_connections' => $validated['connections'],
            ];

            // Expiry date
            if (!empty($validated['expiry_date'])) {
                $apiParams['expiry_date'] = date('Y-m-d H:i:s', strtotime($validated['expiry_date']));
            } else {
                // Calcula a data de expiração baseada no plano
                $duration = $plan->duration_value;
                $unit = $plan->duration_unit;
                
                $expiryDate = now();
                switch ($unit) {
                    case 'days':
                        $expiryDate->addDays($duration);
                        break;
                    case 'months':
                        $expiryDate->addMonths($duration);
                        break;
                    case 'years':
                        $expiryDate->addYears($duration);
                        break;
                }
                $apiParams['expiry_date'] = $expiryDate->format('Y-m-d H:i:s');
            }

            // Bouquets - usa os do plano se não especificado
            if (!empty($validated['bouquets'])) {
                $apiParams['bouquets'] = $validated['bouquets'];
            } elseif (!empty($plan->bouquets)) {
                $apiParams['bouquets'] = $plan->bouquets;
            }

            // Notas (notes)
            if (!empty($validated['notes'])) {
                $apiParams['notes'] = $validated['notes'];
            }

            // Reseller group (se configurado no servidor)
            if (!empty($server->reseller_group_id)) {
                $apiParams['reseller_id'] = $server->reseller_group_id;
            }

            // Faz a chamada para a API do servidor
            $url = rtrim($server->url, '/') . '/';
            
            \Log::info('Criando cliente na API', [
                'server' => $server->name,
                'username' => $validated['username'],
                'params' => $apiParams
            ]);

            $response = \Illuminate\Support\Facades\Http::timeout(30)
                ->get($url, array_merge([
                    'api_key' => $server->api_key,
                    'action' => 'create_line'
                ], $apiParams));

            if ($response->successful()) {
                $data = $response->json();
                
                \Log::info('Resposta da API create_line', ['data' => $data]);
                
                // Verifica se houve erro na resposta
                if (isset($data['error'])) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Erro ao criar cliente: ' . $data['error']
                    ], 400);
                }

                // Sucesso
                return response()->json([
                    'success' => true,
                    'message' => 'Cliente criado com sucesso',
                    'data' => [
                        'line_id' => $data['line_id'] ?? null,
                        'username' => $validated['username'],
                        'password' => $validated['password'],
                        'expiry_date' => $apiParams['expiry_date'],
                        'max_connections' => $validated['connections'],
                        'server' => $server->name,
                    ]
                ], 201);
            }

            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar cliente: HTTP ' . $response->status()
            ], 500);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar cliente', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erro ao criar cliente: ' . $e->getMessage()
            ], 500);
        }
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
