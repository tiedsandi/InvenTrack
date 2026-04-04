# 08 — Master Data: Supplier (CRUD)

## File yang Dibuat

```
app/Http/Controllers/SupplierController.php
resources/views/suppliers/index.blade.php
resources/views/suppliers/create.blade.php
resources/views/suppliers/edit.blade.php
database/seeders/SupplierSeeder.php
routes/web.php  ← ditambahkan route resource suppliers
```

---

## Artisan Commands yang Digunakan

```bash
# Buat controller
php artisan make:controller SupplierController

# Buat seeder
php artisan make:seeder SupplierSeeder

# Jalankan seeder tertentu saja
php artisan db:seed --class=SupplierSeeder
```

> Bisa juga digabung dalam satu baris:
>
> ```bash
> php artisan make:controller SupplierController && php artisan make:seeder SupplierSeeder
> ```

---

## Route

```php
Route::resource('suppliers', SupplierController::class)->except(['show']);
```

Route yang dihasilkan:

| Method | URL                  | Nama Route        | Controller |
| ------ | -------------------- | ----------------- | ---------- |
| GET    | /suppliers           | suppliers.index   | index()    |
| GET    | /suppliers/create    | suppliers.create  | create()   |
| POST   | /suppliers           | suppliers.store   | store()    |
| GET    | /suppliers/{id}/edit | suppliers.edit    | edit()     |
| PUT    | /suppliers/{id}      | suppliers.update  | update()   |
| DELETE | /suppliers/{id}      | suppliers.destroy | destroy()  |

---

## Validasi Input

Supplier punya lebih banyak field dibanding Kategori, sehingga validasinya lebih lengkap:

```php
$request->validate([
    'name'    => 'required|string|max:255',
    'phone'   => 'nullable|string|max:20',
    'email'   => 'nullable|email|max:255',  // ← validasi format email
    'address' => 'nullable|string',
]);
```

- `nullable` → field boleh kosong (tidak wajib diisi)
- `email` → Laravel otomatis cek format email yang valid
- `max:20` → maksimal 20 karakter untuk nomor telepon

---

## Proteksi Hapus Data (Integritas Relasi)

Sama seperti Kategori, sebelum menghapus supplier kita cek dulu apakah ada Purchase Order yang terkait:

```php
if ($supplier->purchaseOrders()->exists()) {
    return redirect()->route('suppliers.index')
        ->with('error', 'Supplier tidak bisa dihapus karena masih ada Purchase Order terkait.');
}
```

Ini menjaga **integritas referensial** data — mencegah data "yatim" (orphan records).

---

## Seeder

`database/seeders/SupplierSeeder.php`

Berisi 5 supplier dummy yang relevan dengan bisnis tekstil: pemasok serat, benang, bahan kimia warna, dll.

Didaftarkan di `DatabaseSeeder`:

```php
$this->call([
    UserSeeder::class,
    CategorySeeder::class,
    SupplierSeeder::class,  // ← tambahkan di sini
]);
```

> **Urutan penting!** Seeder dijalankan sesuai urutan di array `$this->call()`. Pastikan seeder yang tidak bergantung satu sama lain bisa diurut bebas, tapi jika ada relasi (misal Produk butuh Kategori), Kategori harus dijalankan lebih dulu.
