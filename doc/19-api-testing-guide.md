# API Testing Guide - Postman & Insomnia

## 1. Setup Postman

### 1.1 Import Collection

Buat collection baru di Postman dengan nama "InvenTrack API"

### 1.2 Setup Environment Variables

Di Postman, buat environment bernama "InvenTrack" dengan variables:

```
{
  "base_url": "http://localhost:8000/api",
  "token": "",
  "product_id": "1",
  "supplier_id": "1",
  "customer_id": "1"
}
```

### 1.3 Folder Structure

```
InvenTrack API
├── Auth
│   ├── Login
│   ├── Register
│   ├── Get User
│   └── Logout
├── Master Data
│   ├── Categories
│   ├── Suppliers
│   ├── Customers
│   └── Products
├── Transactions
│   ├── Purchase Orders
│   └── Sales Orders
└── Dashboard
```

---

## 2. Auth Endpoints Testing

### 2.1 Register

**Method:** POST  
**URL:** `{{base_url}}/register`

**Body (raw JSON):**

```json
{
    "name": "Test Admin",
    "email": "testadmin@inventrack.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Expected Response:** 201

```json
{
  "message": "User registered successfully",
  "user": {...},
  "token": "bearerToken_1|abc123..."
}
```

**Post-request Script (untuk save token):**

```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
}
```

---

### 2.2 Login

**Method:** POST  
**URL:** `{{base_url}}/login`

**Body (raw JSON):**

```json
{
    "email": "admin@inventrack.com",
    "password": "admin123"
}
```

**Expected Response:** 200

**Post-request Script:**

```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
    pm.environment.set("user_id", jsonData.user.id);
}
```

---

### 2.3 Get Current User

**Method:** GET  
**URL:** `{{base_url}}/user`

**Headers:**

```
Authorization: Bearer {{token}}
Accept: application/json
```

---

### 2.4 Logout

**Method:** POST  
**URL:** `{{base_url}}/logout`

**Headers:**

```
Authorization: Bearer {{token}}
```

---

## 3. Products Testing

### 3.1 Get All Products

**Method:** GET  
**URL:** `{{base_url}}/products?page=1&per_page=15`

**Headers:**

```
Authorization: Bearer {{token}}
Accept: application/json
```

---

### 3.2 Search Products

**Method:** GET  
**URL:** `{{base_url}}/products?search=laptop&category_id=1`

**Headers:**

```
Authorization: Bearer {{token}}
Accept: application/json
```

---

### 3.3 Get Product Detail

**Method:** GET  
**URL:** `{{base_url}}/products/{{product_id}}`

**Headers:**

```
Authorization: Bearer {{token}}
Accept: application/json
```

**Expected Response:**

```json
{
    "message": "Product retrieved successfully",
    "data": {
        "id": 1,
        "code": "PROD001",
        "name": "Product Name",
        "category_id": 1,
        "unit": "pcs",
        "price": 100000,
        "stock": 10,
        "description": "..."
    }
}
```

---

### 3.4 Create Product

**Method:** POST  
**URL:** `{{base_url}}/products`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
    "code": "PROD9999",
    "name": "New Product",
    "category_id": 1,
    "unit": "pcs",
    "price": 50000,
    "stock": 5,
    "description": "Product description"
}
```

**Expected Response:** 201

**Post-request Script:**

```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("product_id", jsonData.data.id);
}
```

---

### 3.5 Update Product

**Method:** PUT  
**URL:** `{{base_url}}/products/{{product_id}}`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
    "code": "PROD9999",
    "name": "Updated Product",
    "category_id": 1,
    "unit": "pcs",
    "price": 60000,
    "stock": 10,
    "description": "Updated description"
}
```

---

### 3.6 Delete Product

**Method:** DELETE  
**URL:** `{{base_url}}/products/{{product_id}}`

**Headers:**

```
Authorization: Bearer {{token}}
```

---

### 3.7 Get Product Stock

**Method:** GET  
**URL:** `{{base_url}}/products/{{product_id}}/stock`

**Headers:**

```
Authorization: Bearer {{token}}
```

**Expected Response:**

```json
{
    "product_id": 1,
    "name": "Product Name",
    "total_stock": 10,
    "reserved_stock": 2,
    "free_stock": 8
}
```

---

## 4. Purchase Orders Testing

### 4.1 Get All Purchase Orders

**Method:** GET  
**URL:** `{{base_url}}/purchase-orders?page=1&status=pending`

**Headers:**

```
Authorization: Bearer {{token}}
Accept: application/json
```

---

### 4.2 Create Purchase Order

**Method:** POST  
**URL:** `{{base_url}}/purchase-orders`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
    "supplier_id": 1,
    "po_date": "2026-04-05",
    "status": "pending",
    "notes": "PO test",
    "items": [
        {
            "product_id": 1,
            "qty": 5,
            "unit_price": 100000
        },
        {
            "product_id": 2,
            "qty": 3,
            "unit_price": 50000
        }
    ]
}
```

**Expected Response:** 201

---

### 4.3 Update PO Status

**Method:** PUT  
**URL:** `{{base_url}}/purchase-orders/{id}`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
    "status": "received"
}
```

---

## 5. Sales Orders Testing

### 5.1 Get All Sales Orders

**Method:** GET  
**URL:** `{{base_url}}/sales-orders?page=1&status=pending`

**Headers:**

```
Authorization: Bearer {{token}}
Accept: application/json
```

---

### 5.2 Create Sales Order

**Method:** POST  
**URL:** `{{base_url}}/sales-orders`

**Headers:**

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
    "customer_id": 1,
    "so_date": "2026-04-05",
    "status": "pending",
    "notes": "SO test",
    "items": [
        {
            "product_id": 1,
            "qty": 2,
            "unit_price": 120000
        }
    ]
}
```

---

## 6. Testing dengan cURL

### 6.1 Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventrack.com",
    "password": "admin123"
  }'
```

**Save token:**

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inventrack.com",
    "password": "admin123"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

---

### 6.2 Get Products

```bash
curl -X GET "http://localhost:8000/api/products?page=1&per_page=15" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json"
```

---

### 6.3 Create Product

```bash
curl -X POST http://localhost:8000/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD9999",
    "name": "New Product",
    "category_id": 1,
    "unit": "pcs",
    "price": 50000,
    "stock": 5,
    "description": "Product description"
  }'
```

---

### 6.4 Update Product

```bash
curl -X PUT "http://localhost:8000/api/products/1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD001",
    "name": "Updated Product",
    "category_id": 1,
    "unit": "pcs",
    "price": 60000,
    "stock": 10,
    "description": "Updated"
  }'
```

---

### 6.5 Delete Product

```bash
curl -X DELETE "http://localhost:8000/api/products/1" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 7. Testing Checklist

### Authentication

- [ ] Login dengan kredensial benar
- [ ] Login dengan kredensial salah (expect 422)
- [ ] Register user baru
- [ ] Get current user
- [ ] Logout
- [ ] Access protected endpoint tanpa token (expect 401)

### Products

- [ ] Get all products
- [ ] Search products by name
- [ ] Filter products by category
- [ ] Get product detail
- [ ] Create product
- [ ] Update product
- [ ] Delete product
- [ ] Get product stock

### Purchase Orders

- [ ] Create PO dengan status pending
- [ ] Create PO dengan status received (stock harus langsung bertambah)
- [ ] Update PO dari pending ke received
- [ ] Update PO dari received ke cancelled
- [ ] Verify stok berubah sesuai logic

### Sales Orders

- [ ] Create SO dengan status pending (validasi stok bebas)
- [ ] Create SO dengan status shipped (stok harus langsung berkurang)
- [ ] Update SO dari pending ke shipped
- [ ] Update SO dari shipped ke cancelled
- [ ] Verify stok berubah sesuai logic

---

## 8. Common Errors & Solutions

### 401 Unauthorized

```json
{
    "message": "Unauthenticated"
}
```

**Solution:** Token tidak valid atau expired. Re-login untuk dapat token baru.

### 422 Validation Error

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": ["The email field is required."]
    }
}
```

**Solution:** Periksa format request data sesuai dokumentasi.

### 403 Forbidden

```json
{
    "message": "This action is unauthorized."
}
```

**Solution:** User tidak memiliki permission untuk aksi ini.

### 404 Not Found

```json
{
    "message": "Product not found"
}
```

**Solution:** Resource tidak ada. Periksa ID yang digunakan.

---

## 9. Performance Testing

### Load Test dengan Apache Bench

```bash
# Test GET endpoint
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/products"

# Test POST endpoint
ab -n 50 -c 5 -p data.json -T "application/json" \
  -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/products"
```

---

**Sekarang ready untuk testing API dengan Postman atau cURL!**
