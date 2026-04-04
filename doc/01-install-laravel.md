# 01 — Install Laravel

## Prasyarat

Pastikan sudah terinstall:

- **PHP** >= 8.2
- **Composer** >= 2.x

Cek dengan perintah:

```bash
php --version
composer --version
```

---

## Cara 1 — Menggunakan `composer create-project` (yang kita pakai)

Ini cara paling umum dan tidak perlu install apapun tambahan.

```bash
composer create-project laravel/laravel nama-project
```

Contoh yang kita gunakan:

```bash
composer create-project laravel/laravel asietex-app
```

Setelah selesai, masuk ke folder project:

```bash
cd asietex-app
```

---

## Cara 2 — Menggunakan Laravel Installer

Install Laravel Installer secara global terlebih dahulu (hanya sekali):

```bash
composer global require laravel/installer
```

Setelah itu, buat project baru dengan:

```bash
laravel new nama-project
```

> **Catatan:** Pastikan path Composer global (`~/.composer/vendor/bin`) sudah ada di environment variable PATH agar perintah `laravel` bisa dikenali.

---

## Verifikasi Instalasi

Setelah project dibuat, cek apakah Laravel berjalan dengan benar:

```bash
cd asietex-app
php artisan --version
```

Output yang diharapkan:

```
Laravel Framework 12.x.x
```

---

## Menjalankan Development Server

```bash
php artisan serve
```

Akses di browser: `http://localhost:8000`
