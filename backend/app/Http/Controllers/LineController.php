<?php

namespace App\Http\Controllers;

use App\Services\AdminApiService;
use Illuminate\Http\Request;

class LineController extends Controller
{
    private $adminApi;

    public function __construct(AdminApiService $adminApi)
    {
        $this->adminApi = $adminApi;
    }

    public function index()
    {
        return response()->json($this->adminApi->getLines());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
            'exp_date' => 'required|date',
            'max_connections' => 'required|integer',
            'bouquet' => 'required|array'
        ]);

        return response()->json($this->adminApi->createLine($validated));
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'username' => 'string',
            'password' => 'string',
            'exp_date' => 'date',
            'max_connections' => 'integer',
            'bouquet' => 'array'
        ]);

        return response()->json($this->adminApi->editLine($id, $validated));
    }

    public function destroy($id)
    {
        return response()->json($this->adminApi->deleteLine($id));
    }
}
