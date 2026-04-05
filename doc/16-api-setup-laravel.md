# Setup API untuk Flutter Mobile - Dokumentasi Lengkap

## Pendahuluan

Dokumentasi ini menjelaskan langkah-langkah membuat API REST untuk aplikasi mobile Flutter dari project InvenTrack yang sudah ada berbasis Laravel 12.

## Tahap 1: Setup Sanctum (Token-Based Authentication)

### 1.1 Install Laravel Sanctum

```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 1.2 Konfigurasi `config/sanctum.php`

Pastikan konfigurasi CORS sudah benar di `config/sanctum.php`:

```php
// config/sanctum.php
return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,127.0.0.1:5173',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    'guard' => ['web'],

    'expiration' => null,

    'token_prefix' => 'bearerToken_',

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
```

### 1.3 Update User Model untuk Token

Edit `app/Models/User.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

## Tahap 2: Setup CORS untuk Flutter

### 2.1 Update `config/cors.php`

```php
// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

### 2.2 Register Middleware di `bootstrap/app.php`

```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(append: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'throttle' => \Illuminate\Routing\Middleware\ThrottleRequestsWithRedis::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

## Tahap 3: Setup Routes API

Buat file `routes/api.php` (jika belum ada):

```bash
touch routes/api.php
```

Isi `routes/api.php`:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\SalesOrderController;
use App\Http\Controllers\Api\DashboardController;

// Public Routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected Routes (memerlukan token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Master Data
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('products', ProductController::class);

    // Transaksi
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::apiResource('sales-orders', SalesOrderController::class);

    // Tambahan: Get stok product
    Route::get('/products/{product}/stock', [ProductController::class, 'getStock']);
});
```

## Tahap 4: Buat API Controllers

Buat folder untuk API Controllers:

```bash
mkdir -p app/Http/Controllers/Api
```

### 4.1 AuthController

Buat `app/Http/Controllers/Api/AuthController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are invalid.'],
            ]);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $user->createToken('api-token')->plainTextToken,
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $user->createToken('api-token')->plainTextToken,
        ], 201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }
}
```

### 4.2 ProductController API

Buat `app/Http/Controllers/Api/ProductController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with('category');

        // Filter berdasarkan category jika ada
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search by name atau code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $products = $query->paginate($perPage);

        return response()->json([
            'message' => 'Products retrieved successfully',
            'data' => $products,
        ]);
    }

    public function show(Product $product)
    {
        return response()->json([
            'message' => 'Product retrieved successfully',
            'data' => $product->load('category'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|unique:products',
            'name' => 'required',
            'category_id' => 'required|exists:categories,id',
            'unit' => 'required',
            'price' => 'required|numeric',
            'stock' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $product = Product::create($validated);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => $product->load('category'),
        ], 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'code' => 'required|unique:products,code,' . $product->id,
            'name' => 'required',
            'category_id' => 'required|exists:categories,id',
            'unit' => 'required',
            'price' => 'required|numeric',
            'stock' => 'required|numeric',
            'description' => 'nullable|string',
        ]);

        $product->update($validated);

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => $product->load('category'),
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }

    // Get stok tersedia (free stock)
    public function getStock(Product $product)
    {
        $freeStock = $product->stock - $product->salesOrderDetails()
            ->whereHas('salesOrder', function ($q) {
                $q->where('status', 'pending');
            })->sum('qty');

        return response()->json([
            'product_id' => $product->id,
            'name' => $product->name,
            'total_stock' => $product->stock,
            'reserved_stock' => $product->stock - $freeStock,
            'free_stock' => $freeStock,
        ]);
    }
}
```

### 4.3 Controller Tambahan

Buat controller API untuk resource lainnya dengan pola yang sama:

```bash
# CategoryController
php artisan make:controller Api/CategoryController --model=Category --api

# SupplierController
php artisan make:controller Api/SupplierController --model=Supplier --api

# CustomerController
php artisan make:controller Api/CustomerController --model=Customer --api

# PurchaseOrderController
php artisan make:controller Api/PurchaseOrderController --model=PurchaseOrder --api

# SalesOrderController
php artisan make:controller Api/SalesOrderController --model=SalesOrder --api

# DashboardController
php artisan make:controller Api/DashboardController
```

## Tahap 5: Update Environment Variables

Edit `.env`:

```env
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,127.0.0.1:5173

# Jika menggunakan Docker
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1,app

# Frontend Flutter (sesuaikan IP)
FRONTEND_URL=http://localhost:8080
```

## Tahap 6: Testing API

### 6.1 Test dengan cURL dan Postman

```bash
# Register
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get Products (dengan token)
curl -X GET http://localhost:8000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

### 6.2 Endpoint List untuk Testing

| Method | Endpoint                   | Auth | Deskripsi          |
| ------ | -------------------------- | ---- | ------------------ |
| POST   | `/api/login`               | No   | Login user         |
| POST   | `/api/register`            | No   | Register user      |
| POST   | `/api/logout`              | Yes  | Logout user        |
| GET    | `/api/user`                | Yes  | Get current user   |
| GET    | `/api/dashboard`           | Yes  | Get dashboard data |
| GET    | `/api/categories`          | Yes  | List categories    |
| GET    | `/api/suppliers`           | Yes  | List suppliers     |
| GET    | `/api/customers`           | Yes  | List customers     |
| GET    | `/api/products`            | Yes  | List products      |
| GET    | `/api/products/{id}`       | Yes  | Get product detail |
| POST   | `/api/products`            | Yes  | Create product     |
| PUT    | `/api/products/{id}`       | Yes  | Update product     |
| DELETE | `/api/products/{id}`       | Yes  | Delete product     |
| GET    | `/api/products/{id}/stock` | Yes  | Get product stock  |
| GET    | `/api/purchase-orders`     | Yes  | List PO            |
| GET    | `/api/sales-orders`        | Yes  | List SO            |

## Tips Penting

1. **Error Handling**: Semua endpoint API harus mengembalikan error response yang konsisten
2. **Pagination**: Implementasikan pagination untuk endpoint list dengan parameter `page` dan `per_page`
3. **Validation**: Gunakan form request untuk validation yang lebih clean
4. **Rate Limiting**: Pertimbangkan menggunakan rate limiting untuk API
5. **Logging**: Log semua API requests untuk debugging

## Langkah Selanjutnya

Lanjut ke: [17-api-endpoints-detail.md](17-api-endpoints-detail.md)
