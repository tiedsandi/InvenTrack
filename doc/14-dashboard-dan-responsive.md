# 14 — Dashboard

## File yang Diubah

```
app/Http/Controllers/DashboardController.php
resources/views/dashboard.blade.php
```

---

## Data yang Ditampilkan

### Row 1 — Master Data (4 card)

| Card     | Data                |
| -------- | ------------------- |
| Kategori | `Category::count()` |
| Produk   | `Product::count()`  |
| Supplier | `Supplier::count()` |
| Customer | `Customer::count()` |

### Row 2 — Statistik Transaksi (4 card)

| Card            | Data                                            |
| --------------- | ----------------------------------------------- |
| Purchase Order  | Total PO + jumlah pending                       |
| Sales Order     | Total SO + jumlah pending                       |
| Total Pembelian | `SUM(total_amount)` PO dengan status `received` |
| Total Penjualan | `SUM(total_amount)` SO dengan status `shipped`  |

> Total pembelian/penjualan hanya menghitung transaksi yang sudah selesai secara fisik, bukan yang masih pending.

### Row 3 — Insights (3 kolom)

| Kolom       | Data                                                 |
| ----------- | ---------------------------------------------------- |
| Stok Rendah | Produk dengan `stock <= 10`, diurutkan dari terkecil |
| PO Terbaru  | 5 PO terakhir dengan status badge                    |
| SO Terbaru  | 5 SO terakhir dengan status badge                    |

---

## Controller

```php
$data = [
    'totalCategories'  => Category::count(),
    'totalProducts'    => Product::count(),
    'totalSuppliers'   => Supplier::count(),
    'totalCustomers'   => Customer::count(),

    'totalPO'          => PurchaseOrder::count(),
    'totalSO'          => SalesOrder::count(),
    'pendingPO'        => PurchaseOrder::where('status', 'pending')->count(),
    'pendingSO'        => SalesOrder::where('status', 'pending')->count(),
    'totalNilaiPO'     => PurchaseOrder::where('status', 'received')->sum('total_amount'),
    'totalNilaiSO'     => SalesOrder::where('status', 'shipped')->sum('total_amount'),

    'lowStockProducts' => Product::with('category')->where('stock', '<=', 10)->orderBy('stock')->get(),
    'recentPO'         => PurchaseOrder::with('supplier')->latest()->take(5)->get(),
    'recentSO'         => SalesOrder::with('customer')->latest()->take(5)->get(),
];
```

---

## Badge Warna Status

```php
// PO
$badge = ['pending' => 'warning', 'received' => 'success', 'cancelled' => 'danger'];

// SO
$badge = ['pending' => 'warning', 'shipped' => 'success', 'cancelled' => 'danger'];
```

---

# 15 — Responsive Layout

## File yang Diubah

```
resources/views/layouts/app.blade.php
resources/views/purchase-orders/index.blade.php
resources/views/purchase-orders/show.blade.php
resources/views/sales-orders/index.blade.php
resources/views/sales-orders/show.blade.php
```

---

## Strategi Responsive

### 1. Sidebar Collapsible (mobile)

Di layar `< 992px` (lg breakpoint Bootstrap), sidebar disembunyikan dengan CSS transform:

```css
@media (max-width: 991.98px) {
    .sidebar {
        transform: translateX(-100%); /* sembunyikan ke kiri */
    }
    .sidebar.show {
        transform: translateX(0); /* tampilkan saat toggle */
    }
    .main-content {
        margin-left: 0; /* konten full width */
    }
}
```

### 2. Overlay Gelap

Saat sidebar terbuka di mobile, muncul overlay gelap di belakangnya. Klik overlay = tutup sidebar.

```html
<div
    class="sidebar-overlay"
    id="sidebarOverlay"
    onclick="toggleSidebar()"
></div>
```

### 3. Tombol Hamburger

Muncul hanya di mobile (`d-lg-none`):

```html
<button
    class="btn btn-sm btn-outline-secondary d-lg-none"
    onclick="toggleSidebar()"
>
    <i class="bi bi-list fs-5"></i>
</button>
```

### 4. Toggle Function

```js
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("show");
    document.getElementById("sidebarOverlay").classList.toggle("show");
}
```

### 5. Tabel Horizontal Scroll

Tabel PO/SO di layar kecil bisa di-scroll horizontal dengan `table-responsive`:

```html
<div class="card-body p-0 table-responsive">
    <table class="table ..."></table>
</div>
```

---

## Perubahan Lain

### Hapus "Ingat Saya" (Remember Me)

Checkbox remember me dihapus dari `login.blade.php` dan `Auth::attempt()` di `AuthController` disederhanakan:

```php
// Sebelum
Auth::attempt($credentials, $request->boolean('remember'))

// Sesudah
Auth::attempt($credentials)
```
