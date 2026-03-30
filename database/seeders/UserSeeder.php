<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@asietex.com'],
            [
                'name'     => 'Admin Asietex',
                'email'    => 'admin@asietex.com',
                'password' => Hash::make('admin123'),
            ]
        );
    }
}
