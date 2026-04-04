# 11 — Transaksi: Purchase Order (CRUD)

## File yang Dibuat

```
app/Http/Controllers/PurchaseOrderController.php
resources/views/purchase-orders/index.blade.php
resources/views/purchase-orders/show.blade.php
resources/views/purchase-orders/create.blade.php
resources/views/purchase-orders/edit.blade.php
database/seeders/PurchaseOrderSeeder.php
routes/web.php  ← ditambahkan route resource purchase-orders
```

---

## Artisan Commands yang Digunakan

```bash
php artisan make:controller PurchaseOrderController
php artisan make:seeder PurchaseOrderSeeder
php artisan db:seed --class=PurchaseOrderSeeder
```

---

## Perbedaan dengan Master Data

Purchase Order jauh lebih kompleks karena strukturnya **header + detail**:

```
purchase_orders (header)        purchase_order_details (detail)
─────────────────────────       ──────────────────────────────
id                        ←──   purchase_order_id
po_number                       product_id
supplier_id                     quantity
order_date                      unit_price
total_amount                    subtotal
status
notes
```

Satu PO bisa punya **banyak detail produk** → relasi `hasMany`.

---

## Route

```php
Route::resource('purchase-orders', PurchaseOrderController::class);
// Tanpa ->except(['show']) karena PO butuh halaman detail
```

---

## Auto Generate PO Number

```php
'po_number' => 'PO-' . date('Ymd') . '-' . str_pad(
    PurchaseOrder::whereDate('created_at', today())->count() + 1,
    3, '0', STR_PAD_LEFT
),
```

Contoh hasil: `PO-20260331-001`, `PO-20260331-002`, dst.

- `date('Ymd')` → tanggal hari ini
- `whereDate('created_at', today())->count() + 1` → hitung PO hari ini + 1
- `str_pad(..., 3, '0', STR_PAD_LEFT)` → format 3 digit dengan leading zero

---

## DB Transaction

Digunakan agar penyimpanan header PO dan semua detail-nya bersifat **atomik** — kalau salah satu gagal, semua dibatalkan (rollback):

```php
DB::transaction(function () use ($request) {
    // 1. Simpan header PO
    $po = PurchaseOrder::create([...]);

    // 2. Simpan semua detail produk
    foreach ($request->details as $detail) {
        PurchaseOrderDetail::create([...]);
    }
});
// Kalau ada exception di dalam closure → otomatis rollback
```

Tanpa transaction, bisa terjadi situasi di mana header PO tersimpan tapi detail-nya tidak → data rusak (inconsistent).

---

## Validasi Array (Nested Validation)

Karena detail produk dikirim sebagai array, validasinya menggunakan notasi titik-bintang (`*`):

```php
'details'              => 'required|array|min:1',
'details.*.product_id' => 'required|exists:products,id',
'details.*.quantity'   => 'required|integer|min:1',
'details.*.unit_price' => 'required|numeric|min:0',
```

`details.*.product_id` artinya: **setiap elemen** array `details` harus punya field `product_id` yang valid.

---

## Dynamic Rows dengan JavaScript

Form create/edit menggunakan vanilla JS untuk:

- **Tambah baris** produk secara dinamis
- **Auto-fill harga** saat produk dipilih (`fillPrice()`)
- **Hitung subtotal** otomatis tiap baris (`calcSubtotal()`)
- **Hitung grand total** dari semua baris (`calcGrandTotal()`)

Data produk di-pass dari PHP ke JS menggunakan:

```blade
@php
    $productData = $products->map(fn($p) => [...])->values();
@endphp
const products = {!! json_encode($productData) !!};
```

> Tidak bisa pakai `@json()` langsung dengan arrow function `fn() => [...]` karena Blade parser konflik dengan karakter `[` dan `]` di dalam `@json(...)`.

---

## Status PO

```
pending   → baru dibuat, belum diproses
received  → barang sudah diterima
cancelled → dibatalkan
```

Nilai ini dikunci di migration dengan PostgreSQL CHECK constraint:

```php
$table->enum('status', ['pending', 'received', 'cancelled'])->default('pending');
```

---

## Seeder

`database/seeders/PurchaseOrderSeeder.php`

2 PO dummy dengan detail produk yang mengacu ke data Supplier dan Product yang sudah ada.

> **Urutan penting:** `PurchaseOrderSeeder` harus dijalankan setelah `SupplierSeeder` dan `ProductSeeder`.

```php
$this->call([
    UserSeeder::class,
    CategorySeeder::class,
    SupplierSeeder::class,
    CustomerSeeder::class,
    ProductSeeder::class,
    PurchaseOrderSeeder::class, // ← terakhir karena butuh supplier & product
]);
```
