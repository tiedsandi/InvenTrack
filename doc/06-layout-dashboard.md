# 06 — Layout & Dashboard

---

## File yang Dibuat

```
app/Http/Controllers/DashboardController.php
resources/views/layouts/app.blade.php
resources/views/dashboard.blade.php
```

---

## Blade Layout (Master Template)

`resources/views/layouts/app.blade.php`

Layout utama yang digunakan bersama oleh semua halaman setelah login. Berisi:

- **Sidebar** — navigasi ke semua halaman
- **Topbar** — judul halaman + dropdown user + tombol logout

### Konsep `@yield` dan `@section`

Layout mendefinisikan "slot" dengan `@yield`:

```blade
{{-- di layouts/app.blade.php --}}
@yield('title')       {{-- untuk judul tab browser --}}
@yield('page-title')  {{-- untuk judul di topbar --}}
@yield('content')     {{-- untuk konten utama halaman --}}
@yield('scripts')     {{-- untuk JavaScript tambahan --}}
```

Halaman yang menggunakan layout mengisi slot dengan `@section`:

```blade
{{-- di dashboard.blade.php --}}
@extends('layouts.app')

@section('title', 'Dashboard')
@section('page-title', 'Dashboard')

@section('content')
    <p>Konten halaman di sini...</p>
@endsection
```

---

## DashboardController

Mengambil jumlah (count) data dari setiap tabel dan mengirimnya ke view:

```php
$data = [
    'totalCategories'     => Category::count(),
    'totalProducts'       => Product::count(),
    'totalSuppliers'      => Supplier::count(),
    'totalCustomers'      => Customer::count(),
    'totalPurchaseOrders' => PurchaseOrder::count(),
    'totalSalesOrders'    => SalesOrder::count(),
];

return view('dashboard', $data);
```

Di view, variabel diakses langsung: `{{ $totalCategories }}`

---

## Menampilkan Data User yang Login

Di dalam view (setelah menggunakan middleware `auth`), data user bisa diakses dengan:

```blade
{{ Auth::user()->name }}
{{ Auth::user()->email }}
```

---

## Flash Message (Notifikasi)

Layout sudah menyiapkan notifikasi otomatis. Dari controller, cukup kirimkan:

```php
return redirect()->route('categories.index')->with('success', 'Data berhasil disimpan!');
return redirect()->back()->with('error', 'Terjadi kesalahan!');
```

Layout akan otomatis menampilkan alert Bootstrap jika ada session `success` atau `error`.
