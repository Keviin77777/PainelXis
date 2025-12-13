<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::with('server:id,name')
            ->orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'server_id' => $plan->server_id,
                    'server_name' => $plan->server->name ?? null,
                    'duration_value' => $plan->duration_value,
                    'duration_unit' => $plan->duration_unit,
                    'multi_server' => $plan->multi_server,
                    'status' => $plan->status,
                    'test_mode' => $plan->test_mode,
                    'show_in_dashboard' => $plan->show_in_dashboard,
                    'price' => $plan->price,
                    'credits' => $plan->credits,
                    'order' => $plan->order,
                    'bouquets' => $plan->bouquets,
                    'created_at' => $plan->created_at,
                ];
            });

        return response()->json($plans);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'server_id' => 'required|exists:servers,id',
            'duration_value' => 'required|integer|min:1',
            'duration_unit' => 'required|in:hours,days,months,years',
            'multi_server' => 'boolean',
            'template_header' => 'nullable|string',
            'template_footer' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'test_mode' => 'boolean',
            'show_in_dashboard' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'credits' => 'required|integer|min:0',
            'order' => 'integer',
            'bouquets' => 'nullable|array',
        ]);

        $plan = Plan::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Plano criado com sucesso',
            'data' => $plan
        ], 201);
    }

    public function show(Plan $plan)
    {
        $plan->load('server:id,name');
        
        return response()->json([
            'success' => true,
            'data' => $plan
        ]);
    }

    public function update(Request $request, Plan $plan)
    {
        $validated = $request->validate([
            'name' => 'string|max:255',
            'duration_value' => 'integer|min:1',
            'duration_unit' => 'in:hours,days,months,years',
            'multi_server' => 'boolean',
            'template_header' => 'nullable|string',
            'template_footer' => 'nullable|string',
            'status' => 'in:active,inactive',
            'test_mode' => 'boolean',
            'show_in_dashboard' => 'boolean',
            'price' => 'nullable|numeric|min:0',
            'credits' => 'integer|min:0',
            'order' => 'integer',
            'bouquets' => 'nullable|array',
        ]);

        $plan->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Plano atualizado com sucesso',
            'data' => $plan
        ]);
    }

    public function destroy(Plan $plan)
    {
        $plan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Plano excluído com sucesso'
        ]);
    }
}
