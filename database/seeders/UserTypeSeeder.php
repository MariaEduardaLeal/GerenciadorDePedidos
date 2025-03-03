<?php

namespace Database\Seeders;

use App\Models\UserType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        UserType::create([
            'tipo' => 'P',  // Tipo Pedido
        ]);

        UserType::create([
            'tipo' => 'C',  // Tipo Cozinha
        ]);

        UserType::create([
            'tipo' => 'A',  // Tipo Administrador
        ]);
    }
}
