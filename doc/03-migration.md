# 03 — Migration

Migration adalah cara Laravel mengelola struktur database menggunakan kode PHP, sehingga perubahan skema bisa di-track, di-share, dan di-rollback.

---

## Membuat File Migration

```bash
php artisan make:migration nama_migration
```

Konvensi penamaan: `create_namatabel_table` untuk tabel baru.

Contoh yang kita buat:

```bash
php artisan make:migration create_categories_table
php artisan make:migration create_suppliers_table
php artisan make:migration create_customers_table
php artisan make:migration create_products_table
php artisan make:migration create_purchase_orders_table
php artisan make:migration create_purchase_order_details_table
php artisan make:migration create_sales_orders_table
php artisan make:migration create_sales_order_details_table
```

File migration tersimpan di `database/migrations/`.

---

## Struktur File Migration

```php
public function up(): void
{
    Schema::create('categories', function (Blueprint $table) {
        $table->id();                          // kolom id auto-increment
        $table->string('name');                // VARCHAR
        $table->text('description')->nullable(); // TEXT, boleh kosong
        $table->timestamps();                  // created_at & updated_at
    });
}

public function down(): void
{
    Schema::dropIfExists('categories');        // untuk rollback
}
```

### Tipe Kolom yang Sering Dipakai

| Method                           | Tipe di Database               |
| -------------------------------- | ------------------------------ |
| `$table->id()`                   | BIGINT UNSIGNED AUTO INCREMENT |
| `$table->string('col')`          | VARCHAR(255)                   |
| `$table->text('col')`            | TEXT                           |
| `$table->integer('col')`         | INT                            |
| `$table->decimal('col', 15, 2)`  | DECIMAL(15,2)                  |
| `$table->date('col')`            | DATE                           |
| `$table->boolean('col')`         | TINYINT(1)                     |
| `$table->enum('col', ['a','b'])` | ENUM                           |
| `$table->timestamps()`           | created_at + updated_at        |
| `->nullable()`                   | Kolom boleh NULL               |
| `->default(0)`                   | Nilai default                  |

### Foreign Key / Relasi Antar Tabel

```php
$table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
//    ^kolom FK         ^nama tabel referensi       ^aksi jika data induk dihapus
```

---

## Menjalankan Migration

### Pertama kali / tambah migration baru:

```bash
php artisan migrate
```

> Jika database belum ada, Laravel akan menawarkan untuk membuatnya otomatis.

### Reset semua tabel dan jalankan ulang dari awal:

```bash
php artisan migrate:fresh
```

> ⚠️ **Hati-hati:** Semua data akan terhapus!

### Rollback migration terakhir:

```bash
php artisan migrate:rollback
```

### Rollback semua migration:

```bash
php artisan migrate:reset
```

### Lihat status migration:

```bash
php artisan migrate:status
```

---

## Urutan Eksekusi Migration

Laravel menjalankan migration berdasarkan **urutan nama file** (timestamp di depan nama file). Oleh karena itu:

- Tabel yang direferensi oleh foreign key **harus dibuat lebih dulu**.
- Contoh: `products` punya FK ke `categories`, maka `categories` harus punya timestamp lebih kecil.

Jika ada dua file dengan timestamp sama (dibuat waktu yang bersamaan), rename file-nya:

```bash
# Contoh: ubah urutan dengan rename manual
mv 2026_03_30_000011_create_details_table.php 2026_03_30_000013_create_details_table.php
```
