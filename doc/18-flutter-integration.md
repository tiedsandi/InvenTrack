# Integrasi API avec Flutter - Panduan Lengkap

## 1. Setup Awal Flutter Project

### 1.1 Create New Flutter Project

```bash
flutter create inventrack_mobile
cd inventrack_mobile
```

### 1.2 Update `pubspec.yaml`

```yaml
dependencies:
    flutter:
        sdk: flutter
    cupertino_icons: ^1.0.2

    # HTTP & API
    http: ^1.1.0
    dio: ^5.3.0

    # State Management
    provider: ^6.0.0
    # atau
    # get: ^4.6.5

    # Local Storage
    shared_preferences: ^2.2.2
    sqflite: ^2.3.0

    # JSON Serialization
    json_annotation: ^4.8.0

    # UI & Navigation
    go_router: ^12.0.0
    flutter_spinkit: ^5.2.0

    # Utility
    intl: ^0.19.0
    connectivity_plus: ^5.0.0

dev_dependencies:
    flutter_test:
        sdk: flutter
    flutter_lints: ^3.0.0
    build_runner: ^2.4.0
    json_serializable: ^6.7.0
```

### 1.3 Install Dependencies

```bash
flutter pub get
```

---

## 2. Setup API Service

### 2.1 Buat API Client dengan Dio

**File: `lib/services/api_service.dart`**

```dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:8000/api';

  late Dio _dio;
  String? _token;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        contentType: Headers.jsonContentType,
        headers: {
          'Accept': 'application/json',
        },
      ),
    );

    // Tambah interceptor untuk token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        if (_token != null) {
          options.headers['Authorization'] = 'Bearer $_token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Token expired, require re-login
          _token = null;
        }
        return handler.next(error);
      },
    ));
  }

  // ===== AUTH =====

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      _token = response.data['token'];
      await _saveToken(_token!);

      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
    String passwordConfirmation,
  ) async {
    try {
      final response = await _dio.post(
        '/register',
        data: {
          'name': name,
          'email': email,
          'password': password,
          'password_confirmation': passwordConfirmation,
        },
      );

      _token = response.data['token'];
      await _saveToken(_token!);

      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/logout');
      _token = null;
      await _clearToken();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getUser() async {
    try {
      final response = await _dio.get('/user');
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ===== PRODUCTS =====

  Future<Map<String, dynamic>> getProducts({
    int page = 1,
    int perPage = 15,
    String? search,
    int? categoryId,
  }) async {
    try {
      final response = await _dio.get(
        '/products',
        queryParameters: {
          'page': page,
          'per_page': perPage,
          if (search != null) 'search': search,
          if (categoryId != null) 'category_id': categoryId,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getProduct(int id) async {
    try {
      final response = await _dio.get('/products/$id');
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> createProduct(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/products', data: data);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updateProduct(int id, Map<String, dynamic> data) async {
    try {
      final response = await _dio.put('/products/$id', data: data);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> deleteProduct(int id) async {
    try {
      await _dio.delete('/products/$id');
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getProductStock(int id) async {
    try {
      final response = await _dio.get('/products/$id/stock');
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ===== CATEGORIES =====

  Future<Map<String, dynamic>> getCategories({int page = 1, int perPage = 15}) async {
    try {
      final response = await _dio.get(
        '/categories',
        queryParameters: {'page': page, 'per_page': perPage},
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> createCategory(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/categories', data: data);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ===== SUPPLIERS =====

  Future<Map<String, dynamic>> getSuppliers({int page = 1, int perPage = 15}) async {
    try {
      final response = await _dio.get(
        '/suppliers',
        queryParameters: {'page': page, 'per_page': perPage},
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ===== CUSTOMERS =====

  Future<Map<String, dynamic>> getCustomers({int page = 1, int perPage = 15}) async {
    try {
      final response = await _dio.get(
        '/customers',
        queryParameters: {'page': page, 'per_page': perPage},
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ===== PURCHASE ORDERS =====

  Future<Map<String, dynamic>> getPurchaseOrders({
    int page = 1,
    int perPage = 15,
    String? status,
  }) async {
    try {
      final response = await _dio.get(
        '/purchase-orders',
        queryParameters: {
          'page': page,
          'per_page': perPage,
          if (status != null) 'status': status,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> createPurchaseOrder(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/purchase-orders', data: data);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updatePurchaseOrder(
    int id,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.put('/purchase-orders/$id', data: data);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ===== SALES ORDERS =====

  Future<Map<String, dynamic>> getSalesOrders({
    int page = 1,
    int perPage = 15,
    String? status,
  }) async {
    try {
      final response = await _dio.get(
        '/sales-orders',
        queryParameters: {
          'page': page,
          'per_page': perPage,
          if (status != null) 'status': status,
        },
      );
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> createSalesOrder(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/sales-orders', data: data);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updateSalesOrder(
    int id,
    Map<String, dynamic> data,
  ) async {
    try {
      final response = await _dio.put('/sales-orders/$id', data: data);
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ===== DASHBOARD =====

  Future<Map<String, dynamic>> getDashboard() async {
    try {
      final response = await _dio.get('/dashboard');
      return response.data;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ===== HELPER METHODS =====

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<void> _clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Future<void> loadSavedToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  bool get isAuthenticated => _token != null;

  String _handleError(DioException error) {
    if (error.response != null) {
      return error.response?.data['message'] ?? 'Terjadi kesalahan';
    } else if (error.type == DioExceptionType.connectionTimeout) {
      return 'Connection timeout';
    } else if (error.type == DioExceptionType.receiveTimeout) {
      return 'Receive timeout';
    } else {
      return error.message ?? 'Terjadi kesalahan';
    }
  }
}
```

---

## 3. Setup State Management dengan Provider

### 3.1 Auth Provider

**File: `lib/providers/auth_provider.dart`**

```dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _apiService;

  bool _isLoading = false;
  String? _error;
  Map<String, dynamic>? _user;
  bool _isAuthenticated = false;

  AuthProvider(this._apiService) {
    _checkAuth();
  }

  bool get isLoading => _isLoading;
  String? get error => _error;
  Map<String, dynamic>? get user => _user;
  bool get isAuthenticated => _isAuthenticated;

  Future<void> _checkAuth() async {
    await _apiService.loadSavedToken();
    _isAuthenticated = _apiService.isAuthenticated;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.login(email, password);
      _user = response['user'];
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(
    String name,
    String email,
    String password,
    String passwordConfirmation,
  ) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.register(
        name,
        email,
        password,
        passwordConfirmation,
      );
      _user = response['user'];
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _apiService.logout();
      _user = null;
      _isAuthenticated = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  Future<void> getUser() async {
    try {
      final response = await _apiService.getUser();
      _user = response['user'];
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
}
```

### 3.2 Product Provider

**File: `lib/providers/product_provider.dart`**

```dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/product.dart';

class ProductProvider extends ChangeNotifier {
  final ApiService _apiService;

  bool _isLoading = false;
  String? _error;
  List<Product> _products = [];
  int _currentPage = 1;
  int _totalPages = 1;
  int? _selectedCategoryId;

  ProductProvider(this._apiService);

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Product> get products => _products;
  int get currentPage => _currentPage;
  int get totalPages => _totalPages;

  Future<void> getProducts({
    int page = 1,
    String? search,
    int? categoryId,
  }) async {
    _isLoading = true;
    _error = null;
    _selectedCategoryId = categoryId;
    notifyListeners();

    try {
      final response = await _apiService.getProducts(
        page: page,
        search: search,
        categoryId: categoryId,
      );

      final data = response['data'];
      _products = (data['data'] as List)
          .map((p) => Product.fromJson(p))
          .toList();
      _currentPage = data['current_page'];
      _totalPages = data['last_page'];

      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Product?> getProduct(int id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _apiService.getProduct(id);
      _isLoading = false;
      notifyListeners();
      return Product.fromJson(response['data']);
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<bool> createProduct(Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.createProduct(data);
      await getProducts();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateProduct(int id, Map<String, dynamic> data) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await _apiService.updateProduct(id, data);
      await getProducts();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteProduct(int id) async {
    try {
      await _apiService.deleteProduct(id);
      await getProducts();
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<Map<String, dynamic>?> getProductStock(int id) async {
    try {
      return await _apiService.getProductStock(id);
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }
}
```

---

## 4. Models

### 4.1 Product Model

**File: `lib/models/product.dart`**

```dart
class Product {
  final int id;
  final String code;
  final String name;
  final int categoryId;
  final Category? category;
  final String unit;
  final double price;
  final int stock;
  final String? description;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.code,
    required this.name,
    required this.categoryId,
    this.category,
    required this.unit,
    required this.price,
    required this.stock,
    this.description,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      code: json['code'],
      name: json['name'],
      categoryId: json['category_id'],
      category: json['category'] != null
          ? Category.fromJson(json['category'])
          : null,
      unit: json['unit'],
      price: (json['price'] as num).toDouble(),
      stock: json['stock'],
      description: json['description'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'code': code,
      'name': name,
      'category_id': categoryId,
      'unit': unit,
      'price': price,
      'stock': stock,
      'description': description,
    };
  }
}

class Category {
  final int id;
  final String name;
  final String? description;

  Category({
    required this.id,
    required this.name,
    this.description,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      name: json['name'],
      description: json['description'],
    );
  }
}
```

---

## 5. Setup Main App dengan Navigation

**File: `lib/main.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'services/api_service.dart';
import 'providers/auth_provider.dart';
import 'providers/product_provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/product_list_screen.dart';
import 'screens/product_detail_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late ApiService _apiService;
  late GoRouter _router;

  @override
  void initState() {
    super.initState();
    _apiService = ApiService();

    _router = GoRouter(
      redirect: (context, state) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final isAuth = authProvider.isAuthenticated;

        if (!isAuth && state.matchedLocation != '/login') {
          return '/login';
        }
        if (isAuth && state.matchedLocation == '/login') {
          return '/home';
        }
        return null;
      },
      routes: [
        GoRoute(
          path: '/login',
          builder: (context, state) => const LoginScreen(),
        ),
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/products',
          builder: (context, state) => const ProductListScreen(),
        ),
        GoRoute(
          path: '/products/:id',
          builder: (context, state) {
            final id = int.parse(state.pathParameters['id']!);
            return ProductDetailScreen(productId: id);
          },
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiService>(create: (_) => _apiService),
        ChangeNotifierProvider(
          create: (_) => AuthProvider(_apiService),
        ),
        ChangeNotifierProvider(
          create: (_) => ProductProvider(_apiService),
        ),
      ],
      child: MaterialApp.router(
        title: 'InvenTrack Mobile',
        theme: ThemeData(
          primarySwatch: Colors.blue,
          useMaterial3: true,
        ),
        routerConfig: _router,
      ),
    );
  }
}
```

---

## 6. Contoh Screen

### 6.1 Login Screen

**File: `lib/screens/login_screen.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late TextEditingController _emailController;
  late TextEditingController _passwordController;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('InvenTrack Login')),
      body: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return Padding(
            padding: const EdgeInsets.all(16.0),
            child: SingleChildScrollView(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(height: 40),
                  TextField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Password',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 24),
                  if (auth.error != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Text(
                        auth.error!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  ElevatedButton(
                    onPressed: auth.isLoading
                        ? null
                        : () async {
                            final success = await auth.login(
                              _emailController.text,
                              _passwordController.text,
                            );
                            if (success && context.mounted) {
                              context.go('/home');
                            }
                          },
                    child: auth.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(),
                          )
                        : const Text('Login'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
```

### 6.2 Product List Screen

**File: `lib/screens/product_list_screen.dart`**

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../providers/product_provider.dart';
import '../models/product.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({Key? key}) : super(key: key);

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  late TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController();

    Future.microtask(() {
      Provider.of<ProductProvider>(context, listen: false).getProducts();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Products'),
      ),
      body: Consumer<ProductProvider>(
        builder: (context, products, _) {
          if (products.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (products.error != null) {
            return Center(child: Text('Error: ${products.error}'));
          }

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search products...',
                    border: OutlineInputBorder(),
                    prefixIcon: const Icon(Icons.search),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear),
                            onPressed: () {
                              _searchController.clear();
                              products.getProducts();
                            },
                          )
                        : null,
                  ),
                  onChanged: (value) {
                    setState(() {});
                    products.getProducts(search: value);
                  },
                ),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: products.products.length,
                  itemBuilder: (context, index) {
                    final product = products.products[index];
                    return ListTile(
                      title: Text(product.name),
                      subtitle: Text(
                        '${product.code} - Stok: ${product.stock}',
                      ),
                      trailing: Text(
                        'Rp ${product.price.toStringAsFixed(0)}',
                      ),
                      onTap: () {
                        context.push('/products/${product.id}');
                      },
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
```

---

## 7. Build & Run

### 7.1 Run di emulator/device

```bash
# Android
flutter run -d android

# iOS
flutter run -d ios

# Web (untuk testing)
flutter run -d chrome
```

---

## 8. Tips Penting

1. **HTTPS Production**: Gunakan HTTPS untuk production, bukan HTTP
2. **Error Handling**: Implement proper error handling & user feedback
3. **Offline Support**: Implementasikan local caching dengan sqflite
4. **Performance**: Gunakan pagination dan lazy loading untuk list
5. **Security**: Jangan hardcode token, gunakan SharedPreferences dengan enkripsi
6. **Testing**: Buat unit tests untuk service & providers

---

## Referensi Lengkap

- [Flutter HTTP Package](https://pub.dev/packages/http)
- [Dio Documentation](https://pub.dev/packages/dio)
- [Provider Package](https://pub.dev/packages/provider)
- [Go Router](https://pub.dev/packages/go_router)
- [Flutter REST API Guide](https://flutter.dev/docs/development/data-and-backend/json)

---

**Lanjutkan dengan membuat models, screens, dan testing sesuai kebutuhan project Anda.**
