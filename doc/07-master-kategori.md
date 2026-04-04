# 07 — Master Data: Kategori (CRUD)

## File yang Dibuat

```
app/Http/Controllers/CategoryController.php
resources/views/categories/index.blade.php
resources/views/categories/create.blade.php
resources/views/categories/edit.blade.php
database/seeders/CategorySeeder.php
routes/web.php  ← ditambahkan route resource categories
```

---

## Route Resource

Daripada mendefinisikan route satu per satu, Laravel menyediakan **Route Resource** yang otomatis membuat 7 route sekaligus:

```php
Route::resource('categories', CategoryController::class)->except(['show']);
```

Hasilnya:

| Method | URL                   | Nama Route         | Method Controller |
| ------ | --------------------- | ------------------ | ----------------- |
| GET    | /categories           | categories.index   | index()           |
| GET    | /categories/create    | categories.create  | create()          |
| POST   | /categories           | categories.store   | store()           |
| GET    | /categories/{id}/edit | categories.edit    | edit()            |
| PUT    | /categories/{id}      | categories.update  | update()          |
| DELETE | /categories/{id}      | categories.destroy | destroy()         |

> `->except(['show'])` karena kita tidak butuh halaman detail.

Cek semua route yang terdaftar:

```bash
php artisan route:list
```

---

## CategoryController

### index — Tampilkan daftar

```php
$categories = Category::latest()->paginate(10);
return view('categories.index', compact('categories'));
```

- `latest()` → urutkan dari terbaru
- `paginate(10)` → tampilkan 10 data per halaman

### store — Simpan data baru

```php
$request->validate([
    'name' => 'required|string|max:255',
    'description' => 'nullable|string',
]);

Category::create($request->only('name', 'description'));
```

- `validate()` → validasi input sebelum disimpan, otomatis redirect balik jika gagal
- `only()` → ambil hanya field yang dibutuhkan, lebih aman dari mass assignment

### update — Perbarui data

```php
$category->update($request->only('name', 'description'));
```

- Laravel otomatis inject model via **Route Model Binding** (`Category $category`)

### destroy — Hapus data

```php
if ($category->products()->exists()) {
    return redirect()->back()->with('error', 'Tidak bisa dihapus, masih ada produk terkait.');
}
$category->delete();
```

- Cek dulu apakah ada relasi sebelum dihapus, untuk menjaga **integritas data**

---

## Route Model Binding

Laravel secara otomatis mengambil data dari database berdasarkan parameter di URL.

```php
// Di route: /categories/{category}/edit
// Di controller:
public function edit(Category $category) { ... }
//                    ^type-hint model → Laravel otomatis query Category::find($id)
```

Jika data tidak ditemukan, Laravel otomatis return **404**.

---

## Blade: Form Method Spoofing

HTML form hanya mendukung `GET` dan `POST`. Untuk `PUT` dan `DELETE`, Laravel menggunakan **method spoofing**:

```blade
<form method="POST" action="{{ route('categories.update', $category) }}">
    @csrf
    @method('PUT')   {{-- ← ini yang memberi tahu Laravel ini adalah PUT request --}}
    ...
</form>
```

---

## Seeder

`database/seeders/CategorySeeder.php`

5 kategori dummy sesuai bisnis tekstil Asietex: Benang, Kain, Garmen, Pewarna, Aksesoris.

```bash
php artisan db:seed --class=CategorySeeder
```
