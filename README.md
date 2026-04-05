# InvenTrack

Aplikasi manajemen inventory & transaksi berbasis **Laravel 12**. Aplikasi ini mencakup fitur CRUD dengan menerapkan prinsip **Relational Database Management System (RDBMS)**, autentikasi user, master data, dan transaksi.

---

## Teknologi

- **Framework:** Laravel 12
- **PHP:** 8.2
- **Database:** PostgreSQL
- **Frontend:** Blade + Tailwind CSS

---

## Fitur

- Login & autentikasi user
- **Master Data:** Kategori, Produk, Supplier, Customer
- **Transaksi:** Purchase Order (beli dari supplier), Sales Order (jual ke customer)
- **Manajemen Stok Otomatis** — stok berubah saat status transaksi dikonfirmasi secara fisik

---

## Logika Manajemen Stok

### Sales Order (stok keluar)

| Aksi                             | Efek                                              |
| -------------------------------- | ------------------------------------------------- |
| Create status `pending`          | Validasi stok bebas, stok **tidak berubah**       |
| Create langsung status `shipped` | Validasi stok bebas + stok **langsung berkurang** |
| Update `pending → shipped`       | Stok **berkurang**                                |
| Update `shipped → cancelled`     | Stok **dikembalikan**                             |
| Update `pending → cancelled`     | Tidak ada efek (belum pernah potong stok)         |

### Purchase Order (stok masuk)

| Aksi                              | Efek                                      |
| --------------------------------- | ----------------------------------------- |
| Create status `pending`           | Stok **tidak berubah**                    |
| Create langsung status `received` | Stok **langsung bertambah**               |
| Update `pending → received`       | Stok **bertambah**                        |
| Update `received → cancelled`     | Stok **dikurangi kembali**                |
| Update `pending → cancelled`      | Tidak ada efek (belum pernah tambah stok) |

> Validasi stok bebas pada SO = stok fisik dikurangi total qty SO lain yang masih `pending`, mencegah overcommit stok.

---

## 📱 Mobile API untuk Flutter

Aplikasi ini sudah dilengkapi dengan **REST API** yang siap diintegrasikan dengan aplikasi mobile Flutter.

### Dokumentasi API Lengkap

Semua dokumentasi untuk membuat dan mengintegrasikan API tersedia di folder `doc/`:

| Dokumen                                                                | Deskripsi                                                                    |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **[16-api-setup-laravel.md](doc/16-api-setup-laravel.md)** ⭐          | Setup Laravel Sanctum, CORS, Routes & Controllers API - **START HERE**       |
| **[17-api-endpoints-detail.md](doc/17-api-endpoints-detail.md)**       | Dokumentasi lengkap semua API endpoints dengan request/response examples     |
| **[18-flutter-integration.md](doc/18-flutter-integration.md)**         | Panduan integrasi API ke Flutter app (API Client, Provider, Models, Screens) |
| **[19-api-testing-guide.md](doc/19-api-testing-guide.md)**             | Testing API dengan Postman & cURL, testing checklist                         |
| **[20-deployment-guide.md](doc/20-deployment-guide.md)**               | Panduan deploy API ke production (VPS, Docker, CI/CD)                        |
| **[21-api-documentation-index.md](doc/21-api-documentation-index.md)** | Index lengkap & workflow rekomendasi                                         |
| **[21-troubleshooting-faq.md](doc/21-troubleshooting-faq.md)**         | Common issues, solutions, dan FAQ                                            |
| **[22-quick-implementation.md](doc/22-quick-implementation.md)** ⚡    | Step-by-step ready-to-code implementation (40 minutes)                       |

### Quick Start API (5 Minutes)

```bash
# 1. Install Sanctum
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate

# 2. Update User Model (add HasApiTokens trait)
# lihat doc/16-api-setup-laravel.md

# 3. Create routes/api.php
# Copy dari doc/22-quick-implementation.md Step 3

# 4. Create API Controllers
# Follow doc/22-quick-implementation.md Steps 5-8

# 5. Test API
php artisan serve
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventrack.com","password":"admin123"}'
```

📖 **Untuk panduan lengkap step-by-step, lihat [22-quick-implementation.md](doc/22-quick-implementation.md)**

### API Architecture

```
Flutter Mobile App
        ↓
    REST API (Laravel 12 + Sanctum)
    ├─ Authentication (Login, Register, Logout)
    ├─ Master Data (Categories, Products, Suppliers, Customers)
    └─ Transactions (Purchase Orders, Sales Orders)
        ↓
    PostgreSQL Database
```

### Fitur API

✅ Token-based authentication (Sanctum)  
✅ CORS enabled untuk Flutter  
✅ Full CRUD untuk semua resources  
✅ Stock management dengan business logic  
✅ Pagination & search support  
✅ Error handling & validation  
✅ Ready untuk production

---

## Struktur Database

```
categories       → master kategori produk
suppliers        → master supplier / pemasok
customers        → master pelanggan
products         → master produk (relasi ke categories)
purchase_orders  → transaksi pembelian (relasi ke suppliers)
purchase_order_details → detail PO (relasi ke purchase_orders & products)
sales_orders     → transaksi penjualan (relasi ke customers)
sales_order_details    → detail SO (relasi ke sales_orders & products)
```

---

## Cara Menjalankan

### 1. Clone repository

```bash
git clone https://github.com/tiedsandi/inventrack
cd inventrack
```

### 2. Install dependencies

```bash
composer install
npm install
```

### 3. Konfigurasi environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit file `.env` sesuaikan konfigurasi database PostgreSQL:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=inventrack_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### 4. Jalankan migration & seeder

```bash
php artisan migrate --seed
```

### 5. Jalankan server

Jalankan backend dan frontend secara bersamaan di dua terminal terpisah:

```bash
# Terminal 1 — Laravel
php artisan serve

# Terminal 2 — Vite (React HMR)
npm run dev
```

Akses aplikasi di `http://localhost:8000`

---

### 6. Login default

| Email                | Password |
| -------------------- | -------- |
| admin@inventrack.com | admin123 |

---

## Cara Menjalankan dengan Docker

Project ini menggunakan Docker multi-service: **PHP-FPM**, **Nginx**, **PostgreSQL**, dan **Node.js** (Vite dev server).

### 1. Clone repository

```bash
git clone https://github.com/tiedsandi/inventrack
cd inventrack
```

### 2. Setup environment

```bash
cp .env.example .env
```

Edit file `.env` sesuaikan dengan docker-compose:

```env
DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=inventrack_db
DB_USERNAME=postgres
DB_PASSWORD=password123
```

### 3. Jalankan Docker

```bash
docker compose up -d --build
```

Ini akan menjalankan 4 service sekaligus:

- `app` — PHP-FPM
- `nginx` — Web server (port `8000`)
- `db` — PostgreSQL
- `node` — Vite dev server / React HMR (port `5173`)

### 4. Generate key & migration

```bash
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
```

Akses aplikasi di `http://localhost:8000`

---
