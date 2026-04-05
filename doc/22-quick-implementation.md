# Step-by-Step Implementation - Ready to Code

Panduan praktis untuk langsung mengimplementasikan API sesuai dokumentasi.

---

## ✅ Step 1: Install Dependencies (5 minutes)

```bash
cd /path/to/InvenTrack

# 1. Install Laravel Sanctum
composer require laravel/sanctum

# 2. Publish Sanctum config
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 3. Run migrations untuk Sanctum
php artisan migrate

# Verify migration success
php artisan migrate:status
```

**Expected Output:**

```
Sanctum

Migration table created successfully.
Migration name: create_personal_access_tokens_table
```

---

## ✅ Step 2: Update User Model (2 minutes)

**File: `app/Models/User.php`**

Replace entire file dengan:

```php
<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
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

---

## ✅ Step 3: Create API Routes (3 minutes)

**File: `routes/api.php`** (Create if not exists)

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

// Protected Routes (require token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Master Data
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('products', ProductController::class);

    // Transactions
    Route::apiResource('purchase-orders', PurchaseOrderController::class);
    Route::apiResource('sales-orders', SalesOrderController::class);

    // Additional
    Route::get('/products/{product}/stock', [ProductController::class, 'getStock']);
});
```

---

## ✅ Step 4: Create API Controllers Folder (1 minute)

```bash
mkdir -p app/Http/Controllers/Api
```

---

## ✅ Step 5: Create AuthController (5 minutes)

**File: `app/Http/Controllers/Api/AuthController.php`**

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

---

## ✅ Step 6: Create ProductController API (8 minutes)

**File: `app/Http/Controllers/Api/ProductController.php`**

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

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
        }

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

---

## ✅ Step 7: Create Other API Controllers (5 minutes)

### Auto-Generate Controllers

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

### Quick Implementation untuk CategoryController

**File: `app/Http/Controllers/Api/CategoryController.php`**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $categories = Category::paginate($perPage);

        return response()->json([
            'message' => 'Categories retrieved successfully',
            'data' => $categories,
        ]);
    }

    public function show(Category $category)
    {
        return response()->json([
            'message' => 'Category retrieved successfully',
            'data' => $category,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($validated);

        return response()->json([
            'message' => 'Category created successfully',
            'data' => $category,
        ], 201);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name' => 'required',
            'description' => 'nullable|string',
        ]);

        $category->update($validated);

        return response()->json([
            'message' => 'Category updated successfully',
            'data' => $category,
        ]);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully',
        ]);
    }
}
```

**Repeat untuk Supplier, Customer, dan PurchaseOrder, SalesOrder dengan penyesuaian model.**

---

## ✅ Step 8: Create DashboardController (3 minutes)

**File: `app/Http/Controllers/Api/DashboardController.php`**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Customer;
use App\Models\PurchaseOrder;
use App\Models\SalesOrder;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_products' => Product::count(),
            'total_categories' => Category::count(),
            'total_suppliers' => Supplier::count(),
            'total_customers' => Customer::count(),
            'total_purchase_orders' => PurchaseOrder::count(),
            'total_sales_orders' => SalesOrder::count(),
            'pending_purchase_orders' => PurchaseOrder::where('status', 'pending')->count(),
            'pending_sales_orders' => SalesOrder::where('status', 'pending')->count(),
            'low_stock_products' => Product::where('stock', '<', 10)->select('id', 'code', 'name', 'stock')->get(),
        ]);
    }
}
```

---

## ✅ Step 9: Test API (5 minutes)

### Terminal 1 - Run Laravel

```bash
cd /path/to/InvenTrack
php artisan serve
# Output: Server running at http://127.0.0.1:8000
```

### Terminal 2 - Test Login

```bash
# Login dengan user default
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventrack.com",
    "password": "admin123"
  }'

# Expected output (save token):
# {
#   "message": "Login successful",
#   "user": {...},
#   "token": "xxx|yyy"
# }

# Save token ke variable
TOKEN="xxx|yyy"
```

### Test Get Products

```bash
curl -X GET http://localhost:8000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

### Expected Response

```json
{
  "message": "Products retrieved successfully",
  "data": {
    "current_page": 1,
    "data": [...],
    "total": 50,
    "per_page": 15,
    "last_page": 4
  }
}
```

---

## ✅ Step 10: Setup Flutter Integration (Ready in 15 min)

Once API is working, follow [18-flutter-integration.md](18-flutter-integration.md)

### Quick Setup:

```bash
# Create Flutter project
flutter create inventrack_mobile
cd inventrack_mobile

# Add dependencies
flutter pub add dio
flutter pub add provider
flutter pub add shared_preferences

# Create folders
mkdir -p lib/{services,providers,screens,models}

# Copy code dari documentation
# - api_service.dart
# - auth_provider.dart
# - login_screen.dart
```

---

## ✅ Checklist untuk Verify

Pastikan semua sudah bekerja:

### Authentication

- [ ] User bisa login
- [ ] Login returns token
- [ ] Token dapat digunakan untuk request protected

### Products API

- [ ] GET /api/products - returns list
- [ ] POST /api/products - create product
- [ ] GET /api/products/{id} - get detail
- [ ] PUT /api/products/{id} - update product
- [ ] DELETE /api/products/{id} - delete product
- [ ] GET /api/products/{id}/stock - get stock

### Master Data

- [ ] Categories CRUD works
- [ ] Suppliers CRUD works
- [ ] Customers CRUD works

### Dashboard

- [ ] GET /api/dashboard - returns stats

---

## 🚀 Quick Commands Reference

```bash
# Start development
php artisan serve              # Run server
npm run dev                    # Run Vite (dalam terminal baru)

# Database
php artisan migrate             # Run migrations
php artisan migrate:fresh --seed # Reset dengan seed
php artisan tinker              # Laravel shell

# Cache
php artisan cache:clear        # Clear cache
php artisan route:cache        # Cache routes
php artisan route:clear        # Clear route cache

# Tests
php artisan test                # Run tests
php artisan test --filter=Test # Run specific test

# Logs
tail -f storage/logs/laravel.log  # View logs (live)
```

---

## 📋 Common Files Layout

```
project/
├── routes/
│   ├── api.php          ⭐ Modified (see Step 3)
│   └── web.php
│
├── app/Http/Controllers/Api/
│   ├── AuthController.php                    ⭐ New (Step 5)
│   ├── ProductController.php                 ⭐ New (Step 6)
│   ├── CategoryController.php                ⭐ New (Step 7)
│   ├── SupplierController.php                ⭐ New (Step 7)
│   ├── CustomerController.php                ⭐ New (Step 7)
│   ├── PurchaseOrderController.php           ⭐ New (Step 7)
│   ├── SalesOrderController.php              ⭐ New (Step 7)
│   └── DashboardController.php               ⭐ New (Step 8)
│
├── app/Models/
│   ├── User.php         ⭐ Modified (see Step 2)
│   └── (other models)
│
└── doc/
    ├── 16-api-setup-laravel.md
    ├── 17-api-endpoints-detail.md
    ├── 18-flutter-integration.md
    ├── 19-api-testing-guide.md
    ├── 20-deployment-guide.md
    ├── 21-api-documentation-index.md
    └── 21-troubleshooting-faq.md
```

---

## ⏱️ Total Implementation Time

| Step      | Task                       | Time           |
| --------- | -------------------------- | -------------- |
| 1         | Install Dependencies       | 5 min          |
| 2         | Update User Model          | 2 min          |
| 3         | Create API Routes          | 3 min          |
| 4         | Create Controllers Folder  | 1 min          |
| 5         | Create AuthController      | 5 min          |
| 6         | Create ProductController   | 8 min          |
| 7         | Create Other Controllers   | 5 min          |
| 8         | Create DashboardController | 3 min          |
| 9         | Test API                   | 5 min          |
| **TOTAL** | **API Ready**              | **~40 min** ⚡ |

---

## 🎯 What's Next?

1. ✅ **Basic API Setup:** 40 minutes
2. 📱 **Flutter Integration:** 1-2 hours
3. 🧪 **Testing & Debugging:** 1 hour
4. 🚀 **Deployment:** 2-3 hours

---

**Siap mulai? Start dari Step 1 di atas! 🚀**
