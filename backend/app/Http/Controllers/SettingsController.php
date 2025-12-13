<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use App\Services\AdminApiService;

class SettingsController extends Controller
{
    public function getAdminApiConfig()
    {
        return response()->json([
            'api_url' => config('admin-api.url'),
            'api_code' => config('admin-api.code') ? '********' : '',
            'timeout' => config('admin-api.timeout')
        ]);
    }

    public function updateAdminApiConfig(Request $request)
    {
        $validated = $request->validate([
            'api_url' => 'required|url',
            'api_code' => 'required|string',
            'timeout' => 'required|integer|min:5|max:120'
        ]);

        // Salvar no arquivo .env
        $this->updateEnvFile([
            'ADMIN_API_URL' => $validated['api_url'],
            'ADMIN_API_CODE' => $validated['api_code'],
            'ADMIN_API_TIMEOUT' => $validated['timeout']
        ]);

        Cache::flush();

        return response()->json(['message' => 'Configurações atualizadas com sucesso']);
    }

    public function testAdminApiConnection(Request $request)
    {
        $validated = $request->validate([
            'api_url' => 'required|url',
            'api_code' => 'required|string',
        ]);

        try {
            // Testar conexão temporária
            $response = \Http::timeout(10)->get($validated['api_url'] . '/api.php', [
                'action' => 'user_info',
                'admin_code' => $validated['api_code']
            ]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Conexão estabelecida com sucesso',
                    'data' => $response->json()
                ]);
            }

            return response()->json([
                'error' => 'Falha na conexão: ' . $response->status()
            ], 400);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erro ao conectar: ' . $e->getMessage()
            ], 500);
        }
    }

    private function updateEnvFile(array $data)
    {
        $envFile = base_path('.env');
        $envContent = file_get_contents($envFile);

        foreach ($data as $key => $value) {
            $pattern = "/^{$key}=.*/m";
            $replacement = "{$key}={$value}";
            
            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, $replacement, $envContent);
            } else {
                $envContent .= "\n{$replacement}";
            }
        }

        file_put_contents($envFile, $envContent);
    }
}
