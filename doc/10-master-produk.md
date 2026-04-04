# 10 — Master Data: Produk (CRUD)

## File yang Dibuat

```
app/Http/Controllers/ProductController.php
resources/views/products/index.blade.php
resources/views/products/create.blade.php
resources/views/products/edit.blade.php
database/seeders/ProductSeeder.php
routes/web.php  ← ditambahkan route resource products
```

---

## Artisan Commands yang Digunakan

```bash
php artisan make:controller ProductController
php artisan make:seeder ProductSeeder
php artisan db:seed --class=ProductSeeder
```

---

## Route

```php
Route::resource('products', ProductController::class)->except(['show']);
```

---

## Perbedaan dengan Master Data Sebelumnya

Produk lebih kompleks karena:

1. **Relasi ke Kategori** — ada dropdown select di form
2. **Field angka** — harga dan stok dengan validasi numerik
3. **Kode unik** — field `code` tidak boleh duplikat

---

## Validasi Unik dengan Pengecualian ID

Saat **create**, kode produk harus unik di seluruh tabel:

```php
'code' => 'required|string|max:50|unique:products,code',
```

Saat **update**, kode boleh sama dengan kode produk itu sendiri (tidak berubah), tapi tidak boleh sama dengan produk lain:

```php
'code' => 'required|string|max:50|unique:products,code,' . $product->id,
//                                                          ^kecualikan ID ini
```

Format: `unique:tabel,kolom,id_yang_dikecualikan`

---

## Eager Loading Relasi

Di method `index()`, kita load data kategori sekaligus agar tidak terjadi **N+1 query problem**:

```php
// ❌ Tanpa eager loading → 1 query untuk produk + N query untuk tiap kategori
$products = Product::paginate(10);

// ✅ Dengan eager loading → hanya 2 query total
$products = Product::with('category')->paginate(10);
```

Di view, relasi diakses dengan:

```blade
{{ $product->category->name }}
```

---

## Dropdown Select dari Database

Di controller, kirim data kategori ke view:

```php
$categories = Category::orderBy('name')->get();
return view('products.create', compact('categories'));
```

Di view, buat dropdown:

```blade
<select name="category_id">
    @foreach($categories as $category)
        <option value="{{ $category->id }}"
            {{ old('category_id') == $category->id ? 'selected' : '' }}>
            {{ $category->name }}
        </option>
    @endforeach
</select>
```

`old('category_id')` memastikan pilihan tetap terpilih saat form dikembalikan karena validasi gagal.

---

## Indikator Stok di Tabel

```blade
<span class="badge {{ $product->stock <= 10 ? 'bg-danger' : 'bg-success' }}">
    {{ $product->stock }}
</span>
```

Stok ≤ 10 → badge merah (peringatan), stok > 10 → badge hijau.

---

## Seeder

`database/seeders/ProductSeeder.php`

7 produk dummy yang mengambil `category_id` dari data kategori yang sudah ada di database:

```php
$benang = Category::where('name', 'Benang')->first();
// ...
Product::updateOrCreate(['code' => 'BNG-001'], [..., 'category_id' => $benang->id, ...]);
```

> **Penting:** `ProductSeeder` harus dijalankan **setelah** `CategorySeeder` karena butuh data kategori yang sudah ada.

```php
$this->call([
    UserSeeder::class,
    CategorySeeder::class,  // ← harus duluan
    SupplierSeeder::class,
    CustomerSeeder::class,
    ProductSeeder::class,   // ← baru ini
]);
```
