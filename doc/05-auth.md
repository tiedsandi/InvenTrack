# 05 — Auth (Login & Logout)

Fitur autentikasi dibuat secara manual (tanpa Laravel Breeze/Jetstream) agar lebih mudah dipahami dan dikustomisasi.

---

## File yang Dibuat

```
app/Http/Controllers/AuthController.php
resources/views/auth/login.blade.php
routes/web.php  ← ditambahkan route auth
database/seeders/UserSeeder.php
```

---

## AuthController

`app/Http/Controllers/AuthController.php`

Berisi 3 method:

| Method        | Fungsi                                                            |
| ------------- | ----------------------------------------------------------------- |
| `showLogin()` | Tampilkan halaman login. Jika sudah login, redirect ke dashboard. |
| `login()`     | Proses validasi & autentikasi.                                    |
| `logout()`    | Hapus sesi dan redirect ke login.                                 |

```php
// Proses login menggunakan Auth::attempt()
if (Auth::attempt($credentials)) {
    $request->session()->regenerate(); // Cegah session fixation attack
    return redirect()->intended(route('dashboard'));
}
```

> **`session()->regenerate()`** penting untuk keamanan — mencegah serangan session fixation.

---

## Routes

`routes/web.php`

```php
// Guest only — jika sudah login tidak bisa akses halaman login
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Protected — harus login untuk akses
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    // ... route lain ditambahkan di sini
});
```

### Penjelasan Middleware

| Middleware | Fungsi                                                                            |
| ---------- | --------------------------------------------------------------------------------- |
| `auth`     | Hanya bisa diakses jika sudah login. Jika belum, redirect ke `/login`.            |
| `guest`    | Hanya bisa diakses jika **belum** login. Jika sudah login, redirect ke dashboard. |

---

## View Login

`resources/views/auth/login.blade.php`

- Menggunakan Bootstrap 5 via CDN
- Form POST ke `route('login')` dengan `@csrf` token
- Menampilkan pesan error dengan `$errors->first()`

```html
<form method="POST" action="{{ route('login') }}">
    @csrf {{-- wajib ada untuk keamanan (CSRF protection) --}} ...
</form>
```

> **`@csrf`** wajib ada di semua form POST di Laravel untuk mencegah serangan Cross-Site Request Forgery.

---

## Seeder — UserSeeder

`database/seeders/UserSeeder.php`

Membuat user admin default saat pertama kali setup aplikasi.

```bash
# Jalankan seeder
php artisan db:seed

# Atau jalankan seeder tertentu saja
php artisan db:seed --class=UserSeeder
```

**Data login default:**
| Field | Value |
|---|---|
| Email | `admin@asietex.com` |
| Password | `password` |

> Password disimpan dengan **Hash::make()** — tidak pernah disimpan dalam bentuk plain text.

---

## Cara Kerja Autentikasi Laravel

```
1. User input email + password di form login
2. Form POST ke /login
3. Laravel cek @csrf token (keamanan)
4. Controller validasi input (required, format email)
5. Auth::attempt() → cek ke tabel "users" di database
6. Cocok? → buat session, redirect ke dashboard
7. Tidak cocok? → balik ke form login dengan pesan error
```
