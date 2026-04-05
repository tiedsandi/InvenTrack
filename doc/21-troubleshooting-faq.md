# API Troubleshooting & FAQ

## Common Issues & Solutions

---

## 1. Authentication Issues

### 1.1 Error: "Unauthenticated" (401)

**Problem:** Token tidak valid atau tidak dikirim

**Solutions:**

```bash
# 1. Verify token ada di header
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/user

# 2. Check token format (Bearer + space + token)
# ❌ Wrong: Authorization: YOUR_TOKEN
# ✅ Correct: Authorization: Bearer YOUR_TOKEN

# 3. Token mungkin expired, re-login untuk dapat token baru
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventrack.com","password":"admin123"}'

# 4. Verify Sanctum sudah installed
php artisan migrate
php artisan cache:clear
```

---

### 1.2 Login gagal - "Invalid credentials"

**Problem:** Email atau password salah

**Solutions:**

```bash
# 1. Verify user exists di database
php artisan tinker
# Lalu:
User::where('email', 'admin@inventrack.com')->first();

# 2. Verify password format (harus di-hash)
use Illuminate\Support\Facades\Hash;
Hash::check('admin123', $user->password); // harus return true

# 3. Jika user tidak ada, buat user baru
php artisan tinker
User::create([
    'name' => 'Admin',
    'email' => 'admin@inventrack.com',
    'password' => Hash::make('admin123')
]);

# 4. Reset password jika lupa
php artisan tinker
$user = User::find(1);
$user->password = Hash::make('newpassword123');
$user->save();
```

---

### 1.3 Register error - "Validation failed"

**Problem:** Data tidak sesuai requirement

**Solutions:**

```bash
# Pastikan semua field ada:
{
  "name": "User Name",           # Required, max 255
  "email": "user@example.com",   # Required, unique, email format
  "password": "password123",      # Required, min 8 chars
  "password_confirmation": "password123"  # Harus sama dengan password
}

# Error: Email sudah terdaftar
# Solution: Gunakan email berbeda atau reset database
```

---

## 2. CORS Issues

### 2.1 Error: "Access to XMLHttpRequest blocked by CORS"

**Problem:** Flutter/browser tidak bisa akses API karena CORS

**Solutions:**

```php
// File: config/cors.php
// Pastikan configuration benar:
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],  // Development
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

**For Production:**

```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
    'allowed_origins' => [
        'https://inventrack.com',
        'https://app.inventrack.com'
    ],
    'allowed_headers' => ['Content-Type', 'Authorization'],
    'max_age' => 86400,
];
```

**Verify CORS is enabled:**

```bash
# Check middleware di bootstrap/app.php
# Pastikan ada:
$middleware->api(append: [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
]);
```

---

### 2.2 Preflight request (OPTIONS) gagal

**Problem:** Request OPTIONS ke API blocked

**Solutions:**

```nginx
# Nginx config untuk preflight requests
location ~ ^/api {
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
        return 204;
    }
}
```

---

## 3. Database Issues

### 3.1 Error: "SQLSTATE[08006] could not connect to server"

**Problem:** Koneksi database gagal

**Solutions:**

```bash
# 1. Verify database is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# 2. Check .env configuration
cat .env | grep DB_

# Expected output:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=inventrack_db
# DB_USERNAME=postgres
# DB_PASSWORD=password

# 3. Test koneksi dengan psql
psql -h 127.0.0.1 -U postgres -d inventrack_db

# 4. Jika menggunakan Docker, verify container running
docker-compose ps

# 5. Clear cache
php artisan cache:clear
php artisan config:clear
```

---

### 3.2 Migration error - "Schema not found"

**Problem:** Migration tidak berjalan

**Solutions:**

```bash
# 1. Jalankan migration
php artisan migrate

# 2. Fresh migration (HATI-HATI - hapus semua data)
php artisan migrate:fresh --seed

# 3. Rollback & retry
php artisan migrate:rollback
php artisan migrate

# 4. Check migration status
php artisan migrate:status

# 5. Jika ada error di migration file, fix dan run:
php artisan migrate:reset
php artisan migrate
```

---

### 3.3 Seeder tidak jalan

**Problem:** Data tidak di-seed

**Solutions:**

```bash
# 1. Run seeder
php artisan db:seed

# 2. Run specific seeder
php artisan db:seed --class=UserSeeder

# 3. Run migration + seed
php artisan migrate --seed

# 4. Fresh database dengan seed
php artisan migrate:fresh --seed
```

---

## 4. API Response Issues

### 4.1 Error: "404 Not Found"

**Problem:** Endpoint tidak ditemukan

**Solutions:**

```bash
# 1. Verify route ada di routes/api.php
php artisan route:list

# Output yang diharapkan:
# GET    /api/products
# GET    /api/products/{id}
# POST   /api/products
# PUT    /api/products/{id}
# DELETE /api/products/{id}

# 2. Verify URL benar
# ❌ Wrong: /api/product (singular)
# ✅ Correct: /api/products (plural)

# 3. Jika baru tambah route, cache routes:
php artisan route:cache
php artisan route:clear
```

---

### 4.2 Error: "422 Unprocessable Entity" (Validation error)

**Problem:** Request data tidak valid

**Solutions:**

```bash
# Response akan berisi error details:
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}

# Solutions:
# 1. Pastikan semua required fields ada
# 2. Verify data format (email, number type, etc.)
# 3. Check max length (string max 255, etc.)
# 4. Lihat dokumentasi 17-api-endpoints-detail.md untuk format
```

---

### 4.3 Error: "500 Internal Server Error"

**Problem:** Server error

**Solutions:**

```bash
# 1. Check Laravel log
tail -f storage/logs/laravel.log

# 2. Enable debug mode (HANYA untuk development)
# Edit .env:
APP_DEBUG=true
php artisan cache:clear

# 3. Common causes:
# - Model tidak ditemukan
# - Function tidak ada
# - Database query error
# - Missing dependency

# 4. Check error message di log untuk lebih detail
grep -i error storage/logs/laravel.log | tail -20
```

---

## 5. Flutter Integration Issues

### 5.1 Connection refused / Cannot reach server

**Problem:** Flutter app tidak bisa connect ke API

**Solutions:**

```dart
// File: lib/services/api_service.dart

// 1. Verify API URL benar
static const String baseUrl = 'http://localhost:8000/api';  // Development
// atau untuk physical device:
// static const String baseUrl = 'http://192.168.x.x:8000/api';

// 2. Verify server berjalan
// Terminal: php artisan serve

// 3. Untuk physical device, gunakan IP address device
// Bukan localhost:
adb shell "getprop ro.wifi.ip_address"  // Get device IP
// Lalu gunakan: http://192.168.x.x:8000/api

// 4. Check firewall
sudo ufw allow 8000  # Linux
```

---

### 5.2 Token tidak tersimpan di SharedPreferences

**Problem:** Setelah login, token hilang

**Solutions:**

```dart
// Pastikan token disave:
Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
}

// Pastikan token di-load saat startup:
Future<void> loadSavedToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    notifyListeners();
}

// Panggil di main.dart:
void initState() {
    super.initState();
    _apiService.loadSavedToken();  // <-- Jangan lupa
}
```

---

### 5.3 CORS error dari Flutter

**Problem:** Flutter app dapat CORS error

**Solutions:**

```dart
// Pastikan API URL protocol benar
// ❌ Wrong: http://api.inventrack.com (HTTP untuk production)
// ✅ Correct: https://api.inventrack.com (HTTPS)

// Jika masih error, debug dengan:
print(response.headers);
print(response.data);

// Setup Dio interceptor untuk log:
_dio.interceptors.add(LoggingInterceptor());  // dari package: logger
```

---

## 6. Performance Issues

### 6.1 API response lambat (> 1 second)

**Problem:** Endpoint terlalu lambat

**Solutions:**

```php
// 1. Enable query logging
// config/database.php
'logging' => true,

// 2. Check slow queries di log:
php artisan tinker
DB::enableQueryLog();
Product::with('category')->get();
dd(DB::getQueryLog());

// 3. Optimize dengan eager loading:
// ❌ N+1 Query problem:
$products = Product::all();
foreach ($products as $p) {
    echo $p->category->name;  // Query setiap iteration
}

// ✅ Eager loading:
$products = Product::with('category')->get();
foreach ($products as $p) {
    echo $p->category->name;  // Hanya 2 queries total
}

// 4. Add indexing pada frequently queried columns:
// database/migrations/xxx_create_products_table.php
$table->index('category_id');
$table->index('created_at');
```

---

### 6.2 Memory limit exceeded

**Problem:** "Allowed memory size exceeded"

**Solutions:**

```bash
# Increase PHP memory limit
php -d memory_limit=512M artisan tinker

# Edit php.ini permanently:
# Cari: memory_limit = 128M
# Ubah: memory_limit = 512M
# Restart PHP-FPM: sudo systemctl restart php-fpm
```

---

## 7. Docker Issues

### 7.1 Container tidak jalan

**Problem:** `docker-compose up` gagal

**Solutions:**

```bash
# 1. Check status
docker-compose ps

# 2. Check logs
docker-compose logs app
docker-compose logs db

# 3. Rebuild
docker-compose down
docker-compose up -d --build

# 4. Clear volumes (HATI-HATI - hapus data)
docker-compose down -v
docker-compose up -d

# 5. Verify ports not in use
lsof -i :8000  # Cek port 8000
lsof -i :5432  # Cek port 5432
```

---

### 7.2 Database connection error dalam container

**Problem:** App container tidak bisa connect ke db

**Solutions:**

```bash
# 1. Verify db container jalan
docker-compose ps

# 2. Check app logs
docker-compose logs app

# 3. Verify .env correct untuk docker
# DB_HOST harus nama service (db), bukan localhost
DB_HOST=db

# 4. Test connection dari app container
docker-compose exec app php artisan tinker
# Lalu test: DB::connection()->getPdo();
```

---

## 8. Deployment Issues

### 8.1 SSL Certificate error

**Problem:** "SSL: CERTIFICATE_VERIFY_FAILED"

**Solutions:**

```bash
# 1. Verify certificate exists
sudo ls -la /etc/letsencrypt/live/api.inventrack.com/

# 2. Renew certificate
sudo certbot renew

# 3. Auto-renew setup
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# 4. Test SSL
openssl s_client -connect api.inventrack.com:443
```

---

### 8.2 Timeout saat deploy

**Problem:** Deploy process timeout

**Solutions:**

```bash
# 1. Increase timeout
composer install --timeout=0

# 2. Run migrations dengan timeout
php artisan migrate --timeout=600

# 3. Check server resources
top
df -h
free -h

# 4. Optimize deployment:
# - Use caching
# - Use CDN
# - Optimize images
# - Enable compression
```

---

## 9. Debugging Tips

### 9.1 Enable Debug Mode (Development Only!)

```bash
# .env
APP_DEBUG=true
LOG_LEVEL=debug

# Clear cache
php artisan cache:clear
php artisan config:clear

# Lihat query
DB::enableQueryLog();
// ... your code ...
dd(DB::getQueryLog());
```

---

### 9.2 Useful Artisan Commands

```bash
# Routes
php artisan route:list
php artisan route:cache
php artisan route:clear

# Cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Database
php artisan migrate:status
php artisan migrate:refresh
php artisan tinker

# Logs
tail -f storage/logs/laravel.log

# Test
php artisan test
php artisan test --filter=TestName
```

---

### 9.3 Testing Endpoints

```bash
# Get all products
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/products | jq

# Get with filter
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:8000/api/products?search=laptop" | jq

# Create product
curl -X POST http://localhost:8000/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"PROD","name":"Name","category_id":1,"unit":"pcs","price":1000,"stock":5}' | jq
```

---

## 10. FAQ

### Q: Bagaimana cara reset database?

**A:** `php artisan migrate:fresh --seed` (HATI-HATI - hapus semua data)

### Q: Token mana yang harus disimpan di Flutter?

**A:** Token dari response login (key: "token"). Simpan di SharedPreferences.

### Q: Berapa lama token valid?

**A:** Default Sanctum tidak ada expiration. Konfigurasi di config/sanctum.php

### Q: Bagaimana cara handle expired token?

**A:** Interceptor Dio akan return 401, redirect ke login screen.

### Q: Bisa test API dari browser?

**A:** Ya, gunakan Postman atau insomnia (lebih mudah daripada cURL).

### Q: Bagaimana cara protect route API?

**A:** Gunakan middleware 'auth:sanctum' di routes/api.php

### Q: Bisa multiple database connection?

**A:** Ya, konfigurasi di config/database.php dan gunakan `DB::connection('nama')->`

### Q: Gimana rate limiting di API?

**A:** Konfigurasi di bootstrap/app.php dengan `$middleware->throttleApi('60,1')`

---

## 📞 Getting Help

Jika masih ada error:

1. **Read the docs:**
    - [16-api-setup-laravel.md](16-api-setup-laravel.md)
    - [18-flutter-integration.md](18-flutter-integration.md)
    - [19-api-testing-guide.md](19-api-testing-guide.md)

2. **Check Laravel documentation:**
    - https://laravel.com/docs

3. **Check Flutter documentation:**
    - https://flutter.dev/docs

4. **Debug dengan Laravel log:**
    - `tail -f storage/logs/laravel.log`

5. **Ask in communities:**
    - Laravel Indonesia
    - Flutter Indonesia
    - Stack Overflow

---

**Semoga issue sudah solved! 🚀**
