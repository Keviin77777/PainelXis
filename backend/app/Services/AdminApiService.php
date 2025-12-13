<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Exception;

class AdminApiService
{
    private $baseUrl;
    private $adminCode;
    private $timeout;

    public function __construct()
    {
        $this->baseUrl = config('admin-api.url');
        $this->adminCode = config('admin-api.code');
        $this->timeout = config('admin-api.timeout');
    }

    private function request(string $action, array $params = [])
    {
        try {
            // Normaliza a URL
            $url = rtrim($this->baseUrl, '/') . '/';
            
            $params['api_key'] = $this->adminCode;
            $params['action'] = $action;
            
            $response = Http::timeout($this->timeout)
                ->get($url, $params);

            if ($response->successful()) {
                return $response->json();
            }

            throw new Exception('API request failed: ' . $response->status());
        } catch (Exception $e) {
            \Log::error('Admin API Error: ' . $e->getMessage());
            throw $e;
        }
    }

    // User Info
    public function getUserInfo()
    {
        return Cache::remember('user_info', 300, fn() => $this->request('user_info'));
    }

    // Lines
    public function getLines()
    {
        return $this->request('get_lines');
    }

    public function createLine(array $data)
    {
        return $this->request('create_line', $data);
    }

    public function editLine(int $lineId, array $data)
    {
        return $this->request('edit_line', array_merge(['line_id' => $lineId], $data));
    }

    public function deleteLine(int $lineId)
    {
        return $this->request('delete_line', ['line_id' => $lineId]);
    }

    // Users
    public function getUsers()
    {
        return $this->request('get_users');
    }

    public function createUser(array $data)
    {
        return $this->request('create_user', $data);
    }

    // MAG Devices
    public function getMags()
    {
        return $this->request('get_mags');
    }

    public function createMag(array $data)
    {
        return $this->request('create_mag', $data);
    }

    // Logs
    public function getActivityLogs()
    {
        return $this->request('activity_logs');
    }

    public function getLiveConnections()
    {
        return $this->request('live_connections');
    }

    // Groups (Reseller Groups)
    public function getGroups()
    {
        return $this->request('get_groups');
    }

    // Bouquets
    public function getBouquets()
    {
        return $this->request('get_bouquets');
    }

    // Test connection with custom credentials
    public function testConnection(string $url, string $apiKey)
    {
        try {
            // Normaliza a URL - garante que termina com /
            $url = rtrim($url, '/') . '/';
            
            \Log::info('Testando conexão', [
                'url' => $url,
                'api_key' => substr($apiKey, 0, 10) . '...'
            ]);
            
            $response = Http::timeout($this->timeout)
                ->get($url, [
                    'api_key' => $apiKey,
                    'action' => 'user_info'
                ]);

            \Log::info('Resposta da API', [
                'status' => $response->status(),
                'body' => substr($response->body(), 0, 500)
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                // Verifica se a resposta é válida
                if (isset($data['error'])) {
                    return [
                        'success' => false,
                        'message' => 'Erro da API: ' . ($data['error'] ?? 'Desconhecido')
                    ];
                }
                
                return [
                    'success' => true,
                    'data' => $data
                ];
            }

            return [
                'success' => false,
                'message' => 'Falha na conexão: HTTP ' . $response->status() . '. Verifique se a URL e a API Key estão corretos.'
            ];
        } catch (Exception $e) {
            \Log::error('Erro ao testar conexão', [
                'message' => $e->getMessage()
            ]);
            
            return [
                'success' => false,
                'message' => 'Erro ao conectar: ' . $e->getMessage()
            ];
        }
    }
}
