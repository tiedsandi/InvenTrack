# API Endpoints Detail & Response Examples

## 1. Authentication Endpoints

### 1.1 Login

**Request:**

```
POST /api/login
Content-Type: application/json

{
  "email": "admin@inventrack.com",
  "password": "admin123"
}
```

**Success Response (200):**

```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "Admin",
        "email": "admin@inventrack.com",
        "created_at": "2026-03-30T07:00:00.000000Z",
        "updated_at": "2026-03-30T07:00:00.000000Z"
    },
    "token": "bearerToken_1|abc123xyz789..."
}
```

**Error Response (422):**

```json
{
    "message": "The provided credentials are invalid.",
    "errors": {
        "email": ["The provided credentials are invalid."]
    }
}
```

### 1.2 Register

**Request:**

```
POST /api/register
Content-Type: application/json

{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Success Response (201):**

```json
{
    "message": "User registered successfully",
    "user": {
        "id": 2,
        "name": "New User",
        "email": "newuser@example.com",
        "created_at": "2026-04-05T10:00:00.000000Z",
        "updated_at": "2026-04-05T10:00:00.000000Z"
    },
    "token": "bearerToken_2|xyz789abc123..."
}
```

### 1.3 Get Current User

**Request:**

```
GET /api/user
Authorization: Bearer {token}
```

**Response:**

```json
{
    "user": {
        "id": 1,
        "name": "Admin",
        "email": "admin@inventrack.com",
        "email_verified_at": null,
        "created_at": "2026-03-30T07:00:00.000000Z",
        "updated_at": "2026-03-30T07:00:00.000000Z"
    }
}
```

### 1.4 Logout

**Request:**

```
POST /api/logout
Authorization: Bearer {token}
```

**Response (200):**

```json
{
    "message": "Logged out successfully"
}
```

---

## 2. Dashboard Endpoint

### 2.1 Get Dashboard Data

**Request:**

```
GET /api/dashboard
Authorization: Bearer {token}
```

**Response:**

```json
{
    "total_products": 50,
    "total_purchase_orders": 25,
    "total_sales_orders": 30,
    "total_categories": 8,
    "total_suppliers": 12,
    "total_customers": 35,
    "pending_purchase_orders": 5,
    "pending_sales_orders": 8,
    "low_stock_products": [
        {
            "id": 1,
            "code": "PROD001",
            "name": "Product A",
            "stock": 2,
            "category_id": 1
        }
    ]
}
```

---

## 3. Master Data Endpoints

### 3.1 Categories

#### Get All Categories

**Request:**

```
GET /api/categories?page=1&per_page=15
Authorization: Bearer {token}
```

**Response:**

```json
{
    "message": "Categories retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "name": "Elektronik",
                "description": "Produk elektronik",
                "created_at": "2026-03-30T07:00:00.000000Z",
                "updated_at": "2026-03-30T07:00:00.000000Z"
            },
            {
                "id": 2,
                "name": "Furniture",
                "description": "Produk furniture",
                "created_at": "2026-03-30T07:00:00.000000Z",
                "updated_at": "2026-03-30T07:00:00.000000Z"
            }
        ],
        "first_page_url": "http://localhost:8000/api/categories?page=1",
        "from": 1,
        "last_page": 1,
        "last_page_url": "http://localhost:8000/api/categories?page=1",
        "links": [],
        "next_page_url": null,
        "path": "http://localhost:8000/api/categories",
        "per_page": 15,
        "prev_page_url": null,
        "to": 2,
        "total": 2
    }
}
```

#### Get Category Detail

**Request:**

```
GET /api/categories/{id}
Authorization: Bearer {token}
```

**Response:**

```json
{
    "message": "Category retrieved successfully",
    "data": {
        "id": 1,
        "name": "Elektronik",
        "description": "Produk elektronik",
        "created_at": "2026-03-30T07:00:00.000000Z",
        "updated_at": "2026-03-30T07:00:00.000000Z"
    }
}
```

#### Create Category

**Request:**

```
POST /api/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Kategori Baru",
  "description": "Deskripsi kategori"
}
```

**Response (201):**

```json
{
    "message": "Category created successfully",
    "data": {
        "id": 9,
        "name": "Kategori Baru",
        "description": "Deskripsi kategori",
        "created_at": "2026-04-05T10:30:00.000000Z",
        "updated_at": "2026-04-05T10:30:00.000000Z"
    }
}
```

#### Update Category

**Request:**

```
PUT /api/categories/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Kategori Update",
  "description": "Deskripsi update"
}
```

**Response:**

```json
{
    "message": "Category updated successfully",
    "data": {
        "id": 9,
        "name": "Kategori Update",
        "description": "Deskripsi update",
        "created_at": "2026-04-05T10:30:00.000000Z",
        "updated_at": "2026-04-05T10:35:00.000000Z"
    }
}
```

#### Delete Category

**Request:**

```
DELETE /api/categories/{id}
Authorization: Bearer {token}
```

**Response:**

```json
{
    "message": "Category deleted successfully"
}
```

---

### 3.2 Products (sama pattern seperti categories)

#### Get All Products dengan Search & Filter

**Request:**

```
GET /api/products?page=1&per_page=15&search=laptop&category_id=1
Authorization: Bearer {token}
```

**Response:**

```json
{
    "message": "Products retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "code": "PROD001",
                "name": "Laptop Dell XPS 13",
                "category_id": 1,
                "category": {
                    "id": 1,
                    "name": "Elektronik",
                    "description": "Produk elektronik"
                },
                "unit": "pcs",
                "price": 15000000,
                "stock": 5,
                "description": "Laptop high-end",
                "created_at": "2026-03-30T07:00:00.000000Z",
                "updated_at": "2026-03-30T07:00:00.000000Z"
            }
        ],
        "total": 1,
        "per_page": 15,
        "current_page": 1,
        "last_page": 1
    }
}
```

#### Get Product Stock

**Request:**

```
GET /api/products/{id}/stock
Authorization: Bearer {token}
```

**Response:**

```json
{
    "product_id": 1,
    "name": "Laptop Dell XPS 13",
    "total_stock": 5,
    "reserved_stock": 2,
    "free_stock": 3
}
```

---

### 3.3 Suppliers

**Endpoints:**

- `GET /api/suppliers` - List semua suppliers
- `POST /api/suppliers` - Create supplier
- `GET /api/suppliers/{id}` - Get supplier detail
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

**Request body untuk Create/Update:**

```json
{
    "code": "SUP001",
    "name": "PT Supplier Indonesia",
    "contact_person": "Budi",
    "phone": "081234567890",
    "email": "supplier@example.com",
    "address": "Jl. Supplier No. 123"
}
```

---

### 3.4 Customers

**Endpoints:** (sama pattern seperti suppliers)

- `GET /api/customers`
- `POST /api/customers`
- `GET /api/customers/{id}`
- `PUT /api/customers/{id}`
- `DELETE /api/customers/{id}`

**Request body untuk Create/Update:**

```json
{
    "code": "CUST001",
    "name": "PT Customer Indonesia",
    "contact_person": "Andi",
    "phone": "089876543210",
    "email": "customer@example.com",
    "address": "Jl. Customer No. 456"
}
```

---

## 4. Transaction Endpoints

### 4.1 Purchase Orders

#### Get All Purchase Orders

**Request:**

```
GET /api/purchase-orders?page=1&per_page=15&status=pending
Authorization: Bearer {token}
```

**Response:**

```json
{
    "message": "Purchase orders retrieved successfully",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "po_number": "PO/2026/0001",
                "supplier_id": 1,
                "supplier": {
                    "id": 1,
                    "name": "PT Supplier Indo",
                    "code": "SUP001"
                },
                "po_date": "2026-03-30",
                "status": "pending",
                "total_amount": 75000000,
                "notes": "Pembelian barang",
                "created_at": "2026-03-30T07:00:00.000000Z",
                "updated_at": "2026-03-30T07:00:00.000000Z",
                "details": [
                    {
                        "id": 1,
                        "product_id": 1,
                        "product": {
                            "id": 1,
                            "name": "Laptop Dell XPS 13",
                            "code": "PROD001"
                        },
                        "qty": 5,
                        "unit_price": 15000000,
                        "subtotal": 75000000
                    }
                ]
            }
        ],
        "total": 1,
        "per_page": 15,
        "current_page": 1,
        "last_page": 1
    }
}
```

#### Create Purchase Order

**Request:**

```
POST /api/purchase-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "supplier_id": 1,
  "po_date": "2026-04-05",
  "status": "pending",
  "notes": "PO baru",
  "items": [
    {
      "product_id": 1,
      "qty": 3,
      "unit_price": 15000000
    },
    {
      "product_id": 2,
      "qty": 2,
      "unit_price": 5000000
    }
  ]
}
```

**Response (201):**

```json
{
    "message": "Purchase order created successfully",
    "data": {
        "id": 2,
        "po_number": "PO/2026/0002",
        "supplier_id": 1,
        "po_date": "2026-04-05",
        "status": "pending",
        "total_amount": 55000000,
        "notes": "PO baru",
        "details": [
            {
                "id": 2,
                "product_id": 1,
                "qty": 3,
                "unit_price": 15000000,
                "subtotal": 45000000
            },
            {
                "id": 3,
                "product_id": 2,
                "qty": 2,
                "unit_price": 5000000,
                "subtotal": 10000000
            }
        ]
    }
}
```

#### Update Purchase Order Status

**Request:**

```
PUT /api/purchase-orders/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "received"
}
```

**Response:**

```json
{
    "message": "Purchase order updated successfully",
    "data": {
        "id": 2,
        "po_number": "PO/2026/0002",
        "status": "received",
        "total_amount": 55000000,
        "created_at": "2026-04-05T10:00:00.000000Z",
        "updated_at": "2026-04-05T10:30:00.000000Z"
    }
}
```

#### Delete Purchase Order

**Request:**

```
DELETE /api/purchase-orders/{id}
Authorization: Bearer {token}
```

**Response:**

```json
{
    "message": "Purchase order deleted successfully"
}
```

---

### 4.2 Sales Orders (pola sama seperti PO)

#### Get All Sales Orders

**Request:**

```
GET /api/sales-orders?page=1&per_page=15&status=pending
Authorization: Bearer {token}
```

#### Create Sales Order

**Request:**

```
POST /api/sales-orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "customer_id": 1,
  "so_date": "2026-04-05",
  "status": "pending",
  "notes": "SO penjualan",
  "items": [
    {
      "product_id": 1,
      "qty": 2,
      "unit_price": 16000000
    }
  ]
}
```

#### Update Sales Order Status

**Request:**

```
PUT /api/sales-orders/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "shipped"
}
```

---

## 5. Error Handling

### 5.1 Validation Error (422)

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

### 5.2 Unauthorized (401)

```json
{
    "message": "Unauthenticated"
}
```

### 5.3 Forbidden (403)

```json
{
    "message": "This action is unauthorized."
}
```

### 5.4 Not Found (404)

```json
{
    "message": "Product not found"
}
```

### 5.5 Server Error (500)

```json
{
    "message": "Server error occurred"
}
```

---

## 6. Request Headers

Semua request (kecuali login & register) harus include headers:

```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

---

## 7. Pagination Parameters

Untuk semua endpoint list/index:

```
?page=1           // Nomor halaman (default 1)
&per_page=15      // Items per page (default 15, max 100)
&sort=id          // Sort by field
&order=asc        // asc atau desc
```

---

## Lanjut ke: [18-flutter-integration.md](18-flutter-integration.md)
