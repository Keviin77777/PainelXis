<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Criar usuário admin padrão
        User::create([
            'name' => 'Administrador',
            'email' => 'admin@admin.com',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'is_active' => true,
            'credits' => 1000.00
        ]);

        // Criar usuário revendedor de teste
        User::create([
            'name' => 'Revendedor Teste',
            'email' => 'reseller@test.com',
            'password' => Hash::make('reseller123'),
            'role' => 'reseller',
            'is_active' => true,
            'credits' => 500.00
        ]);
    }
}
