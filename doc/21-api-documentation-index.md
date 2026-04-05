# InvenTrack API Documentation Index

Dokumentasi lengkap untuk membangun REST API dari Laravel backend dan mengintegrasikannya dengan aplikasi mobile Flutter.

---

## 📚 Daftar Dokumentasi

### Setup & Konfigurasi

1. **[16-api-setup-laravel.md](16-api-setup-laravel.md)** ⭐ START HERE
    - Setup Laravel Sanctum untuk authentication
    - Konfigurasi CORS
    - Setup routes, controllers, dan models API
    - Environment configuration
    - Basic testing dengan cURL

### API Reference

2. **[17-api-endpoints-detail.md](17-api-endpoints-detail.md)**
    - Daftar lengkap semua API endpoints
    - Request/response examples untuk setiap endpoint
    - Authentication endpoints
    - Master data CRUD (Categories, Products, Suppliers, Customers)
    - Transaction endpoints (Purchase Orders, Sales Orders)
    - Dashboard endpoint
    - Error handling

### Integrasi Flutter

3. **[18-flutter-integration.md](18-flutter-integration.md)**
    - Setup Flutter project
    - API Client dengan Dio
    - State management dengan Provider
    - Models dan serialization
    - Example screens (Login, Product List, Detail)
    - Navigation setup

### Testing

4. **[19-api-testing-guide.md](19-api-testing-guide.md)**
    - Setup Postman collection
    - Testing dengan cURL
    - Testing checklist untuk setiap fitur
    - Common errors & solutions
    - Performance testing

### Deployment

5. **[20-deployment-guide.md](20-deployment-guide.md)**
    - Pre-deployment checklist
    - Environment configuration untuk production
    - Deployment methods (manual, Docker, CI/CD)
    - SSL/HTTPS setup
    - Monitoring & logging
    - Backup & recovery
    - Performance optimization

### Troubleshooting

6. **[21-troubleshooting-faq.md](21-troubleshooting-faq.md)** (Akan dibuat)
    - Common issues & solutions
    - CORS problems
    - Authentication errors
    - Database issues
    - Performance problems

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Sanctum

```bash
cd /path/to/project
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 2. Update User Model

```bash
# Add HasApiTokens trait ke app/Models/User.php
use Laravel\Sanctum\HasApiTokens;
class User extends Authenticatable {
    use HasFactory, Notifiable, HasApiTokens;
}
```

### 3. Create Routes File

```bash
touch routes/api.php
# Copy content dari 16-api-setup-laravel.md
```

### 4. Create API Controllers

```bash
mkdir -p app/Http/Controllers/Api
# Create AuthController, ProductController, dll
```

### 5. Test API

```bash
# Terminal 1: Start Laravel
php artisan serve

# Terminal 2: Test login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventrack.com","password":"admin123"}'
```

---

## 📋 Workflow Rekomendasi

### Development Phase

```
1. Setup Sanctum (Docs #16)
   ↓
2. Create API Routes & Controllers (Docs #16)
   ↓
3. Implement All Endpoints (Docs #17)
   ↓
4. Test dengan Postman (Docs #19)
   ↓
5. Fix bugs & optimize
```

### Flutter Integration Phase

```
1. Create Flutter project
   ↓
2. Setup API Client + Models (Docs #18)
   ↓
3. Implement Providers (Docs #18)
   ↓
4. Create screens & integrate API (Docs #18)
   ↓
5. Test API communication
```

### Production Phase

```
1. Pre-deployment checklist
   ↓
2. Configure environment (Docs #20)
   ↓
3. Deploy to server (Docs #20)
   ↓
4. Setup monitoring (Docs #20)
   ↓
5. Backup & recovery setup
```

---

## 🔒 API Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  FLUTTER MOBILE APP                                 │
│  (18-flutter-integration.md)                        │
└────────────────┬────────────────────────────────────┘
                 │ HTTP/HTTPS
                 │ JSON Requests/Responses
                 ↓
┌─────────────────────────────────────────────────────┐
│  INVENTRACK REST API                                │
│  (Laravel 12)                                       │
│  ├─ Authentication (Sanctum)  [16-api-setup]      │
│  ├─ CORS Middleware           [16-api-setup]      │
│  └─ Rate Limiting             [20-deployment]     │
└────────────────┬────────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────────┐
│  DB LAYER (PostgreSQL)                               │
│  ├─ Categories, Products                             │
│  ├─ Suppliers, Customers                             │
│  ├─ Purchase Orders & Details                        │
│  └─ Sales Orders & Details                           │
└──────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
laravel-project/
├── routes/
│   ├── web.php          (Web routes - untuk browser)
│   └── api.php          (API routes - untuk mobile) ⭐
│
├── app/Http/Controllers/
│   ├── Api/             (API Controllers) ⭐
│   │   ├── AuthController.php
│   │   ├── ProductController.php
│   │   ├── CategoryController.php
│   │   ├── SupplierController.php
│   │   ├── CustomerController.php
│   │   ├── PurchaseOrderController.php
│   │   └── SalesOrderController.php
│   │
│   └── (Web Controllers)
│
├── app/Models/          (Database Models)
│   ├── User.php
│   ├── Product.php
│   ├── Category.php
│   ├── Supplier.php
│   ├── Customer.php
│   ├── PurchaseOrder.php
│   ├── PurchaseOrderDetail.php
│   ├── SalesOrder.php
│   └── SalesOrderDetail.php
│
├── config/
│   ├── sanctum.php      (Konfigurasi Sanctum) ⭐
│   ├── cors.php         (CORS Configuration) ⭐
│   └── (configs lainnya)
│
└── doc/
    ├── 16-api-setup-laravel.md
    ├── 17-api-endpoints-detail.md
    ├── 18-flutter-integration.md
    ├── 19-api-testing-guide.md
    ├── 20-deployment-guide.md
    └── 21-api-documentation-index.md (this file)
```

---

## 🔑 Key Endpoints Summary

### Authentication

| Method | Endpoint        | Auth | Purpose          |
| ------ | --------------- | ---- | ---------------- |
| POST   | `/api/login`    | No   | Login user       |
| POST   | `/api/register` | No   | Register user    |
| POST   | `/api/logout`   | Yes  | Logout user      |
| GET    | `/api/user`     | Yes  | Get current user |

### Products

| Method | Endpoint                   | Auth | Purpose            |
| ------ | -------------------------- | ---- | ------------------ |
| GET    | `/api/products`            | Yes  | List products      |
| POST   | `/api/products`            | Yes  | Create product     |
| GET    | `/api/products/{id}`       | Yes  | Get product detail |
| PUT    | `/api/products/{id}`       | Yes  | Update product     |
| DELETE | `/api/products/{id}`       | Yes  | Delete product     |
| GET    | `/api/products/{id}/stock` | Yes  | Get product stock  |

### Master Data (Categories, Suppliers, Customers)

| Method | Endpoint               | Auth |
| ------ | ---------------------- | ---- |
| GET    | `/api/{resource}`      | Yes  |
| POST   | `/api/{resource}`      | Yes  |
| GET    | `/api/{resource}/{id}` | Yes  |
| PUT    | `/api/{resource}/{id}` | Yes  |
| DELETE | `/api/{resource}/{id}` | Yes  |

### Transactions (Purchase Orders & Sales Orders)

| Method | Endpoint               | Auth |
| ------ | ---------------------- | ---- |
| GET    | `/api/purchase-orders` | Yes  |
| POST   | `/api/purchase-orders` | Yes  |
| GET    | `/api/sales-orders`    | Yes  |
| POST   | `/api/sales-orders`    | Yes  |

### Dashboard

| Method | Endpoint         | Auth |
| ------ | ---------------- | ---- |
| GET    | `/api/dashboard` | Yes  |

---

## 🛠️ Tech Stack

### Backend (API)

- **Framework:** Laravel 12
- **Database:** PostgreSQL
- **Authentication:** Laravel Sanctum
- **HTTP Client:** Guzzle HTTP
- **From End-to-End Testing:** Pest or PHPUnit

### Frontend (Mobile)

- **Framework:** Flutter (Dart)
- **API Client:** Dio
- **State Management:** Provider
- **Navigation:** Go Router
- **Local Storage:** Shared Preferences, SQLite
- **JSON Serializer:** json_annotation

---

## 📞 Common Questions

### Q: Bagaimana cara authentication bekerja?

**A:** Lihat [16-api-setup-laravel.md](16-api-setup-laravel.md) - Login menghasilkan token yang digunakan untuk request selanjutnya.

### Q: Bagaimana cara setup Flutter app?

**A:** Lihat [18-flutter-integration.md](18-flutter-integration.md) - Lengkap dari setup project hingga contoh screen.

### Q: Gimana cara test API?

**A:** Lihat [19-api-testing-guide.md](19-api-testing-guide.md) - Gunakan Postman atau cURL.

### Q: Bagaimana cara deploy ke production?

**A:** Lihat [20-deployment-guide.md](20-deployment-guide.md) - Ada panduan untuk VPS, Docker, dan CI/CD.

### Q: Ada error, gimana?

**A:** Lihat [21-troubleshooting-faq.md](21-troubleshooting-faq.md) - Common issues dan solutions.

---

## 📊 Development Roadmap

### Sprint 1: API Setup

- [x] Laravel Sanctum setup
- [x] Routes & Controllers
- [x] Authentication endpoints
- [x] Testing dengan Postman

### Sprint 2: Master Data APIs

- [ ] Categories CRUD
- [ ] Suppliers CRUD
- [ ] Customers CRUD
- [ ] Products CRUD
- [ ] Integration testing

### Sprint 3: Transaction APIs

- [ ] Purchase Orders CRUD
- [ ] Sales Orders CRUD
- [ ] Stock management logic
- [ ] End-to-end testing

### Sprint 4: Flutter Integration

- [ ] API Client setup
- [ ] State Management
- [ ] Authentication flow
- [ ] Product list screen
- [ ] Transaction screens

### Sprint 5: Production Ready

- [ ] Performance optimization
- [ ] Security hardening
- [ ] Deployment setup
- [ ] Monitoring & logging
- [ ] Backup strategy

---

## 🎯 Next Steps

1. **Mulai dari [16-api-setup-laravel.md](16-api-setup-laravel.md)**
    - Set up Sanctum dan routes

2. **Implementasi endpoints**
    - Copy controllers dari dokumentasi

3. **Test dengan Postman**
    - Gunakan [19-api-testing-guide.md](19-api-testing-guide.md)

4. **Flutter integration**
    - Follow [18-flutter-integration.md](18-flutter-integration.md)

5. **Deploy ke production**
    - Follow [20-deployment-guide.md](20-deployment-guide.md)

---

## 📞 Support & Resources

### Laravel Sanctum

- https://laravel.com/docs/sanctum
- https://laravel.com/docs/cors

### Flutter Dio

- https://pub.dev/packages/dio
- https://pub.dev/packages/provider

### PostgreSQL

- https://www.postgresql.org/docs/

### Deployment

- https://laravel.com/docs/deployment
- https://docs.docker.com/

---

**Happy coding! 🚀 Jika ada pertanyaan, refer ke dokumentasi yang sesuai.**
