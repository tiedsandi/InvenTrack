# 13 — Manajemen Stok Otomatis

## Konsep: Opsi B + Validasi Stok Bebas

Stok berubah **hanya saat status transaksi berubah ke kondisi fisik**, bukan saat dibuat.

---

## Alur Lengkap

### Sales Order (stok keluar)

| Aksi                             | Efek Stok                                   |
| -------------------------------- | ------------------------------------------- |
| Create status `pending`          | Validasi stok bebas, stok **tidak berubah** |
| Create status `shipped` langsung | Validasi + stok **langsung berkurang**      |
| Update `pending → shipped`       | Stok **berkurang**                          |
| Update `shipped → cancelled`     | Stok **dikembalikan**                       |

### Purchase Order (stok masuk)

| Aksi                          | Efek Stok                  |
| ----------------------------- | -------------------------- |
| Create (status apapun)        | Stok **tidak berubah**     |
| Update `pending → received`   | Stok **bertambah**         |
| Update `received → cancelled` | Stok **dikurangi kembali** |

---

## Masalah Overcommit & Solusinya

Tanpa validasi, bisa terjadi stok minus:

```
Stok: 5
SO #1 pending qty 5  → stok masih 5  (boleh dibuat)
SO #2 pending qty 3  → stok masih 5  (boleh dibuat) ← overcommit!
SO #1 shipped        → stok jadi 0
SO #2 mau shipped    → stok 0, butuh 3 → MINUS ❌
```

Solusi: saat **create SO**, hitung **stok bebas** = stok fisik - total qty SO pending lain:

```php
$reserved  = SalesOrderDetail::whereHas('salesOrder', fn($q) => $q->where('status', 'pending'))
    ->where('product_id', $product->id)
    ->sum('quantity');

$freeStock = $product->stock - $reserved;

if ($detail['quantity'] > $freeStock) {
    return redirect()->back()->withInput()
        ->with('error', "Stok {$product->name} tidak cukup. Stok bebas: {$freeStock}.");
}
```

---

## Implementasi di Controller

### SalesOrderController — `store()`

```php
// 1. Validasi stok bebas sebelum simpan
foreach ($request->details as $detail) {
    $reserved  = SalesOrderDetail::whereHas('salesOrder', fn($q) => $q->where('status', 'pending'))
        ->where('product_id', $detail['product_id'])->sum('quantity');
    $freeStock = $product->stock - $reserved;
    if ($detail['quantity'] > $freeStock) → tolak
}

// 2. Jika langsung shipped, potong stok
if ($request->status === 'shipped') {
    Product::where('id', $detail['product_id'])->decrement('stock', $detail['quantity']);
}
```

### SalesOrderController — `update()`

```php
$oldStatus = $salesOrder->status;
$newStatus = $request->status;

// pending → shipped: potong stok
if ($oldStatus !== 'shipped' && $newStatus === 'shipped') {
    Product::where('id', ...)->decrement('stock', qty);
}

// shipped → cancelled: kembalikan stok
if ($oldStatus === 'shipped' && $newStatus === 'cancelled') {
    Product::where('id', ...)->increment('stock', qty);
}
```

### PurchaseOrderController — `update()`

```php
// pending → received: tambah stok
if ($oldStatus !== 'received' && $newStatus === 'received') {
    Product::where('id', ...)->increment('stock', qty);
}

// received → cancelled: kurangi stok kembali
if ($oldStatus === 'received' && $newStatus === 'cancelled') {
    Product::where('id', ...)->decrement('stock', qty);
}
```

---

## Kenapa Pakai `increment`/`decrement`?

```php
// ❌ Tidak aman — race condition jika ada request paralel
$product->stock = $product->stock - $qty;
$product->save();

// ✅ Aman — operasi atomik langsung di database
Product::where('id', $id)->decrement('stock', $qty);
```

`increment`/`decrement` menerjemah ke SQL `UPDATE products SET stock = stock - ?` yang bersifat atomik.

---

## Catatan: Seeder vs Controller

Data dari seeder **tidak memanggil controller**, sehingga stok tidak otomatis terpotong meski status SO seeder adalah `shipped`. Ini behavior yang diharapkan — seeder hanya mengisi data dummy, bukan mensimulasikan alur bisnis.

Untuk testing, gunakan form aplikasi (create/edit SO/PO) bukan seeder.

---

## Perbandingan Pendekatan

| Opsi                  | Kompleksitas | Akurasi       | Keterangan           |
| --------------------- | ------------ | ------------- | -------------------- |
| Tanpa validasi        | Rendah       | Bisa minus    | Tidak aman           |
| **Opsi B + validasi** | Sedang       | Cukup akurat  | **Yang dipakai**     |
| Reserved stock        | Tinggi       | Sangat akurat | Untuk production ERP |
