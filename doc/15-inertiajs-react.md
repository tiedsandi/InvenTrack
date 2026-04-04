# 15 — Migrasi ke Inertia.js + React

Dokumen ini mencatat langkah-langkah mengkonversi project dari Blade murni menjadi **Inertia.js + React** (SPA tanpa full-page reload), tetap menggunakan routing Laravel.

---

## Stack Setelah Migrasi

| Layer   | Sebelum              | Sesudah               |
| ------- | -------------------- | --------------------- |
| View    | Blade (`.blade.php`) | React (`.jsx`)        |
| Routing | Laravel routes       | Laravel routes (sama) |
| HTTP    | Full-page reload     | Inertia SPA (XHR)     |
| State   | Session flash        | Inertia shared props  |
| Build   | Vite (CSS only)      | Vite + React HMR      |

---

## 1 — Install Laravel-side Package

```bash
composer require inertiajs/inertia-laravel
```

Ini menginstall adapter PHP yang menjembatani Laravel dengan Inertia di sisi server.

### Publish middleware

```bash
php artisan inertia:middleware
```

File yang dibuat: `app/Http/Middleware/HandleInertiaRequests.php`

### Daftarkan middleware di `bootstrap/app.php`

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \App\Http\Middleware\HandleInertiaRequests::class,
    ]);
})
```

---

## 2 — Install JavaScript Packages

```bash
npm install @inertiajs/react react react-dom
```

Package yang terinstall:

| Package            | Fungsi                                           |
| ------------------ | ------------------------------------------------ |
| `react`            | Core library React                               |
| `react-dom`        | React DOM renderer                               |
| `@inertiajs/react` | Adapter Inertia untuk React (Link, useForm, dll) |

### Install Vite plugin React

```bash
npm install -D @vitejs/plugin-react
```

---

## 3 — Konfigurasi Vite

Edit `vite.config.js`:

```js
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            "@": "/resources/js",
        },
    },
});
```

> **Catatan:** entry point diganti dari `app.js` ke `app.jsx`.

---

## 4 — Entry Point React (`resources/js/app.jsx`)

```jsx
import { createInertiaApp } from "@inertiajs/react";
import { createRoot } from "react-dom/client";
import "../css/app.css";

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob("./pages/**/*.jsx", { eager: true });
        return pages[`./pages/${name}.jsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    title: (title) => (title ? `${title} — InvenTrack` : "InvenTrack"),
});
```

---

## 5 — Root Blade Template

File `resources/views/app.blade.php` — ini satu-satunya file Blade yang tersisa:

```html
<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        @viteReactRefresh @vite(['resources/js/app.jsx']) @inertiaHead
    </head>
    <body class="bg-gray-100 font-sans antialiased">
        @inertia
    </body>
</html>
```

> `@inertia` akan dirender menjadi `<div id="app" data-page="...">` yang menjadi mount point React.

---

## 6 — Struktur Folder Pages

```
resources/js/
├── app.jsx                    ← Entry point
├── lib/
│   └── utils.js               ← Helper (formatCurrency, dll)
├── components/
│   └── layout/
│       └── AppLayout.jsx      ← Layout utama (sidebar + topbar)
└── pages/
    ├── Auth/
    │   └── Login.jsx
    ├── Dashboard.jsx
    ├── Categories/
    │   ├── Index.jsx
    │   ├── Create.jsx
    │   └── Edit.jsx
    ├── Suppliers/
    │   ├── Index.jsx
    │   ├── Create.jsx
    │   └── Edit.jsx
    ├── Customers/
    │   ├── Index.jsx
    │   ├── Create.jsx
    │   └── Edit.jsx
    ├── Products/
    │   ├── Index.jsx
    │   ├── Create.jsx
    │   └── Edit.jsx
    ├── PurchaseOrders/
    │   ├── Index.jsx
    │   ├── Show.jsx
    │   ├── Create.jsx
    │   └── Edit.jsx
    └── SalesOrders/
        ├── Index.jsx
        ├── Show.jsx
        ├── Create.jsx
        └── Edit.jsx
```

---

## 7 — Konversi Controller

Setiap method controller diubah dari `return view(...)` menjadi `Inertia::render(...)`.

### Sebelum (Blade)

```php
use App\Http\Controllers\Controller;

public function index()
{
    $categories = Category::paginate(15);
    return view('categories.index', compact('categories'));
}
```

### Sesudah (Inertia)

```php
use Inertia\Inertia;
use App\Http\Controllers\Controller;

public function index()
{
    $categories = Category::orderBy('name')->get();
    return Inertia::render('Categories/Index', [
        'categories' => $categories,
    ]);
}
```

> **Perbedaan utama:**
>
> - `view('categories.index')` → `Inertia::render('Categories/Index')`
> - Path page menggunakan `/` (slash) sesuai struktur folder
> - Data di-pass sebagai array kedua (otomatis di-JSON-kan)

---

## 8 — Navigasi dengan `<Link>`

Inertia menyediakan komponen `<Link>` pengganti `<a>` biasa. Link ini mencegah full-page reload.

```jsx
import { Link } from '@inertiajs/react';

// GET (navigasi biasa)
<Link href="/categories">Kategori</Link>

// DELETE (dengan method override)
<Link
    href={`/categories/${id}`}
    method="delete"
    as="button"
    onClick={(e) => { if (!confirm('Hapus?')) e.preventDefault(); }}
>
    Hapus
</Link>
```

---

## 9 — Form dengan `useForm`

Hook `useForm` menggantikan form HTML biasa + validasi Blade.

```jsx
import { useForm } from "@inertiajs/react";

const { data, setData, post, put, processing, errors } = useForm({
    name: "",
    description: "",
});

// Submit POST
const submit = (e) => {
    e.preventDefault();
    post("/categories");
};

// Submit PUT (update)
const submit = (e) => {
    e.preventDefault();
    put(`/categories/${category.id}`);
};
```

| Property     | Keterangan                                       |
| ------------ | ------------------------------------------------ |
| `data`       | State form saat ini                              |
| `setData`    | Setter untuk field tertentu                      |
| `post/put`   | Submit form ke server                            |
| `processing` | `true` saat request sedang berlangsung           |
| `errors`     | Validation errors dari Laravel (key: field name) |

---

## 10 — Shared Props (Auth User)

`HandleInertiaRequests.php` digunakan untuk men-share data ke semua page:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'auth' => [
            'user' => $request->user(),
        ],
        'flash' => [
            'success' => $request->session()->get('success'),
            'error'   => $request->session()->get('error'),
        ],
    ];
}
```

Di komponen React, akses dengan hook `usePage`:

```jsx
import { usePage } from "@inertiajs/react";

const { auth, flash } = usePage().props;
console.log(auth.user.name);
```

---

## 11 — Build & Development

### Development (dengan HMR)

```bash
npm run dev
```

### Production build

```bash
npm run build
```

Asset hasil build tersimpan di `public/build/`.

---

## 12 — Perbedaan Utama vs Blade

| Aspek          | Blade                       | Inertia + React                   |
| -------------- | --------------------------- | --------------------------------- |
| Navigasi       | Full-page reload            | SPA (tanpa reload)                |
| Form submit    | `<form method="POST">`      | `useForm` hook                    |
| Validasi error | `@error('field')` directive | `errors.field` prop               |
| Flash message  | `session()->flash()`        | Shared props via middleware       |
| Pagination     | `$data->links()`            | Data di-pass as array + custom    |
| Assets         | `@vite(['app.css'])`        | `@vite(['resources/js/app.jsx'])` |
| Layout         | `@extends('layouts.app')`   | Komponen `<AppLayout>`            |
