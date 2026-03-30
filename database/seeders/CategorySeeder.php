<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Benang',   'description' => 'Berbagai jenis benang untuk spinning dan twisting'],
            ['name' => 'Kain',     'description' => 'Produk kain hasil weaving dan knitting'],
            ['name' => 'Garmen',   'description' => 'Produk garmen jadi siap pakai'],
            ['name' => 'Pewarna',  'description' => 'Bahan pewarna untuk proses dyeing dan printing'],
            ['name' => 'Aksesoris', 'description' => 'Aksesoris pendukung produksi garmen'],
        ];

        foreach ($categories as $item) {
            Category::updateOrCreate(['name' => $item['name']], $item);
        }
    }
}
