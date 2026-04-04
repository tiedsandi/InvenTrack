# 12 — Transaksi: Sales Order (CRUD)

## File yang Dibuat

```
app/Http/Controllers/SalesOrderController.php
resources/views/sales-orders/index.blade.php
resources/views/sales-orders/show.blade.php
resources/views/sales-orders/create.blade.php
resources/views/sales-orders/edit.blade.php
database/seeders/SalesOrderSeeder.php
routes/web.php  ← ditambahkan route resource sales-orders
```

---

## Artisan Commands yang Digunakan

```bash
php artisan make:controller SalesOrderController
php artisan make:seeder SalesOrderSeeder
php artisan db:seed --class=SalesOrderSeeder
```

---

## Perbedaan SO vs PO

|               | Purchase Order (PO)            | Sales Order (SO)              |
| ------------- | ------------------------------ | ----------------------------- |
| Relasi ke     | Supplier                       | Customer                      |
| Nomor         | `PO-YYYYMMDD-XXX`              | `SO-YYYYMMDD-XXX`             |
| Detail relasi | `purchase_order_details`       | `sales_order_details`         |
| Status        | pending, received, cancelled   | pending, delivered, cancelled |
| Arah          | Kita **membeli** dari supplier | Kita **menjual** ke customer  |

Secara struktur kode keduanya hampir identik, yang berbeda hanya entitas yang terlibat.

---

## Status SO

```
pending   → order masuk, belum diproses
delivered → barang sudah dikirim ke customer
cancelled → order dibatalkan
```

---

## Route

```php
Route::resource('sales-orders', SalesOrderController::class);
```

---

## Seeder

`database/seeders/SalesOrderSeeder.php`

2 SO dummy mengacu ke Customer dan Product yang sudah ada.

Urutan final di `DatabaseSeeder`:

```php
$this->call([
    UserSeeder::class,
    CategorySeeder::class,
    SupplierSeeder::class,
    CustomerSeeder::class,
    ProductSeeder::class,
    PurchaseOrderSeeder::class,
    SalesOrderSeeder::class,  // ← paling terakhir
]);
```
