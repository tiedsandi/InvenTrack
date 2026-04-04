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
            ['email' => 'admin@inventrack.com'],
            [
                'name'     => 'Admin InvenTrack',
                'email'    => 'admin@inventrack.com',
                'password' => Hash::make('admin123'),
            ]
        );
    }
}
