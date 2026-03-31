# Asietex App

Aplikasi manajemen data berbasis **Laravel 12** untuk PT. Asietex Sinar Indopratama. Aplikasi ini mencakup fitur CRUD dengan menerapkan prinsip **Relational Database Management System (RDBMS)**, autentikasi user, master data, dan transaksi.

---

## Teknologi

- **Framework:** Laravel 12
- **PHP:** 8.2
- **Database:** PostgreSQL
- **Frontend:** Blade + Bootstrap 5

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
git clone https://github.com/tiedsandi/asietex-app
cd asietex-app
```

### 2. Install dependencies

```bash
composer install
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
DB_DATABASE=asietex_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### 4. Jalankan migration & seeder

```bash
php artisan migrate --seed
```

### 5. Jalankan server

```bash
php artisan serve
```

Akses aplikasi di `http://localhost:8000`

---

### 6. Login default

| Email             | Password |
| ----------------- | -------- |
| admin@asietex.com | admin123 |

---
