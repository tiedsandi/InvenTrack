# 04 — Model & Eloquent ORM

Model adalah representasi dari tabel database dalam bentuk class PHP. Laravel menggunakan **Eloquent ORM** yang membuat operasi database lebih mudah dan ekspresif.

---

## Membuat Model

```bash
php artisan make:model NamaModel
```

Contoh yang kita buat:

```bash
php artisan make:model Category
php artisan make:model Supplier
php artisan make:model Customer
php artisan make:model Product
php artisan make:model PurchaseOrder
php artisan make:model PurchaseOrderDetail
php artisan make:model SalesOrder
php artisan make:model SalesOrderDetail
```

File model tersimpan di `app/Models/`.

---

## Struktur Model

```php
class Product extends Model
{
    // Kolom yang boleh diisi via mass assignment (create/update)
    protected $fillable = ['code', 'name', 'category_id', 'unit', 'price', 'stock'];

    // Relasi ke tabel lain
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
```

### Mengapa `$fillable` penting?

Tanpa `$fillable`, Laravel akan menolak `Model::create([...])` untuk mencegah **mass assignment vulnerability**. Daftarkan hanya kolom yang memang boleh diisi dari input user.

---

## Jenis Relasi Eloquent

### `belongsTo` — Satu model dimiliki oleh satu model lain

```php
// Product belongsTo Category (products.category_id → categories.id)
public function category()
{
    return $this->belongsTo(Category::class);
}
```

### `hasMany` — Satu model memiliki banyak model lain

```php
// Category hasMany Products
public function products()
{
    return $this->hasMany(Product::class);
}
```

### `hasOne` — Satu model memiliki satu model lain

```php
public function profile()
{
    return $this->hasOne(Profile::class);
}
```

---

## Relasi di Project Ini

```
Category (1) ──── (N) Product
Supplier  (1) ──── (N) PurchaseOrder
PurchaseOrder (1) ── (N) PurchaseOrderDetail
PurchaseOrderDetail (N) ── (1) Product

Customer (1) ──── (N) SalesOrder
SalesOrder (1) ── (N) SalesOrderDetail
SalesOrderDetail (N) ── (1) Product
```

---

## Contoh Penggunaan di Controller

```php
// Ambil semua kategori
$categories = Category::all();

// Ambil produk beserta kategorinya (eager loading)
$products = Product::with('category')->get();

// Buat data baru
Category::create(['name' => 'Benang', 'description' => 'Kategori benang']);

// Update
$category = Category::find(1);
$category->update(['name' => 'Benang Pintal']);

// Hapus
$category->delete();
```
