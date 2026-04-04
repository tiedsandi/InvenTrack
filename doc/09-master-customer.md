# 09 — Master Data: Customer (CRUD)

## File yang Dibuat

```
app/Http/Controllers/CustomerController.php
resources/views/customers/index.blade.php
resources/views/customers/create.blade.php
resources/views/customers/edit.blade.php
database/seeders/CustomerSeeder.php
routes/web.php  ← ditambahkan route resource customers
```

---

## Artisan Commands yang Digunakan

```bash
# Buat controller
php artisan make:controller CustomerController

# Buat seeder
php artisan make:seeder CustomerSeeder

# Jalankan seeder
php artisan db:seed --class=CustomerSeeder
```

---

## Route

```php
Route::resource('customers', CustomerController::class)->except(['show']);
```

| Method | URL                  | Nama Route        | Controller |
| ------ | -------------------- | ----------------- | ---------- |
| GET    | /customers           | customers.index   | index()    |
| GET    | /customers/create    | customers.create  | create()   |
| POST   | /customers           | customers.store   | store()    |
| GET    | /customers/{id}/edit | customers.edit    | edit()     |
| PUT    | /customers/{id}      | customers.update  | update()   |
| DELETE | /customers/{id}      | customers.destroy | destroy()  |

---

## Perbedaan Customer vs Supplier

Secara struktur dan tampilan, Customer **hampir identik** dengan Supplier. Perbedaannya hanya pada:

|                | Supplier               | Customer            |
| -------------- | ---------------------- | ------------------- |
| Relasi         | → PurchaseOrder        | → SalesOrder        |
| Proteksi hapus | cek `purchaseOrders()` | cek `salesOrders()` |
| Context bisnis | Pemasok bahan baku     | Pembeli produk jadi |

Ini adalah praktik umum di dunia nyata — entitas yang strukturnya sama dipisah untuk kejelasan domain bisnis.

---

## Proteksi Hapus

```php
if ($customer->salesOrders()->exists()) {
    return redirect()->route('customers.index')
        ->with('error', 'Customer tidak bisa dihapus karena masih ada Sales Order terkait.');
}
```

---

## Seeder

`database/seeders/CustomerSeeder.php`

5 customer dummy: perusahaan garmen, ritel tekstil, dan eksportir yang relevan dengan bisnis Asietex.

Urutan di `DatabaseSeeder`:

```php
$this->call([
    UserSeeder::class,
    CategorySeeder::class,
    SupplierSeeder::class,
    CustomerSeeder::class,  // ← ditambahkan
]);
```
