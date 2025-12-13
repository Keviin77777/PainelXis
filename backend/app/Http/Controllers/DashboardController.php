<?php

namespace App\Http\Controllers;

use App\Services\AdminApiService;
use App\Models\Plan;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private $adminApi;

    public function __construct(AdminApiService $adminApi)
    {
        $this->adminApi = $adminApi;
    }

    public function index()
    {
        try {
            // Buscar planos de teste (sempre disponível)
            $testPlans = Plan::with('server:id,name')
                ->where('test_mode', true)
                ->where('show_in_dashboard', true)
                ->where('status', 'active')
                ->orderBy('order', 'asc')
                ->get(['id', 'name', 'server_id'])
                ->map(function ($plan) {
                    return [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'server_name' => $plan->server->name ?? 'Servidor não encontrado'
                    ];
                })
                ->toArray();

            // Verificar se Admin API está configurada
            $apiUrl = config('admin-api.url');
            $apiCode = config('admin-api.code');
            
            $isApiConfigured = $apiUrl && $apiCode && 
                              $apiUrl !== 'http://your-server-ip' && 
                              $apiCode !== 'your-admin-code';

            // Se Admin API não está configurada, retornar dados básicos
            if (!$isApiConfigured) {
                return response()->json([
                    'is_configured' => false,
                    'message' => 'Admin API não configurada',
                    'credits' => '0,00',
                    'clients' => [
                        'subvendas' => ['active' => 0, 'inactive' => 0, 'total' => 0, 'cancelled' => 0],
                        'own' => ['active' => 0, 'inactive' => 0, 'total' => 0, 'cancelled' => 0],
                        'total' => ['active' => 0, 'inactive' => 0, 'total' => 0, 'cancelled' => 0]
                    ],
                    'resellers' => [
                        'subvendas' => ['active' => 0, 'inactive' => 0, 'total' => 0],
                        'own' => ['active' => 0, 'inactive' => 0, 'total' => 0],
                        'total' => ['active' => 0, 'inactive' => 0, 'total' => 0]
                    ],
                    'connections' => ['current' => 0],
                    'tests' => $testPlans,
                    'revenue_forecast' => '0,00',
                    'lost_revenue' => '0,00',
                    'expiring_clients' => [],
                    'monthly_expiring' => 0,
                    'monthly_total' => 0,
                    'credits_consumed' => '0,00',
                    'low_credit_resellers' => []
                ]);
            }

            // Buscar dados da API
            $userInfo = $this->adminApi->getUserInfo();
            $lines = $this->adminApi->getLines();
            $users = $this->adminApi->getUsers();
            $liveConnections = $this->adminApi->getLiveConnections();

            // Processar estatísticas
            $activeLines = collect($lines)->where('is_active', true)->count();
            $inactiveLines = collect($lines)->where('is_active', false)->count();
            
            return response()->json([
                'is_configured' => true,
                'credits' => $userInfo['credits'] ?? '0,00',
                'clients' => [
                    'subvendas' => [
                        'active' => $activeLines,
                        'inactive' => $inactiveLines,
                        'total' => count($lines),
                        'cancelled' => 0
                    ],
                    'own' => [
                        'active' => 0,
                        'inactive' => 0,
                        'total' => 0,
                        'cancelled' => 0
                    ],
                    'total' => [
                        'active' => $activeLines,
                        'inactive' => $inactiveLines,
                        'total' => count($lines),
                        'cancelled' => 0
                    ]
                ],
                'resellers' => [
                    'subvendas' => [
                        'active' => 0,
                        'inactive' => 0,
                        'total' => 0
                    ],
                    'own' => [
                        'active' => 0,
                        'inactive' => 0,
                        'total' => 0
                    ],
                    'total' => [
                        'active' => 0,
                        'inactive' => 0,
                        'total' => 0
                    ]
                ],
                'connections' => [
                    'current' => count($liveConnections ?? [])
                ],
                'tests' => $testPlans,
                'revenue_forecast' => '0,00',
                'lost_revenue' => '0,00',
                'expiring_clients' => [],
                'monthly_expiring' => 0,
                'monthly_total' => 0,
                'credits_consumed' => '0,00',
                'low_credit_resellers' => [],
                'user_info' => $userInfo
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard Error: ' . $e->getMessage());
            
            // Mesmo em caso de erro, retornar os planos de teste
            $testPlans = Plan::with('server:id,name')
                ->where('test_mode', true)
                ->where('show_in_dashboard', true)
                ->where('status', 'active')
                ->orderBy('order', 'asc')
                ->get(['id', 'name', 'server_id'])
                ->map(function ($plan) {
                    return [
                        'id' => $plan->id,
                        'name' => $plan->name,
                        'server_name' => $plan->server->name ?? 'Servidor não encontrado'
                    ];
                })
                ->toArray();
            
            return response()->json([
                'is_configured' => false,
                'error' => $e->getMessage(),
                'credits' => '0,00',
                'clients' => [
                    'subvendas' => ['active' => 0, 'inactive' => 0, 'total' => 0, 'cancelled' => 0],
                    'own' => ['active' => 0, 'inactive' => 0, 'total' => 0, 'cancelled' => 0],
                    'total' => ['active' => 0, 'inactive' => 0, 'total' => 0, 'cancelled' => 0]
                ],
                'resellers' => [
                    'subvendas' => ['active' => 0, 'inactive' => 0, 'total' => 0],
                    'own' => ['active' => 0, 'inactive' => 0, 'total' => 0],
                    'total' => ['active' => 0, 'inactive' => 0, 'total' => 0]
                ],
                'connections' => ['current' => 0],
                'tests' => $testPlans,
                'revenue_forecast' => '0,00',
                'lost_revenue' => '0,00',
                'expiring_clients' => [],
                'monthly_expiring' => 0,
                'monthly_total' => 0,
                'credits_consumed' => '0,00',
                'low_credit_resellers' => []
            ]);
        }
    }
}
