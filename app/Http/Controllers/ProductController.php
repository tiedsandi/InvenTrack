<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')->latest()->get();
        return Inertia::render('Products/Index', compact('products'));
    }

    public function create()
    {
        $categories = Category::orderBy('name')->get();
        return Inertia::render('Products/Create', compact('categories'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'code'        => 'required|string|max:50|unique:products,code',
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'unit'        => 'required|string|max:20',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        Product::create($request->only('code', 'name', 'category_id', 'unit', 'price', 'stock', 'description'));

        return redirect()->route('products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(Product $product)
    {
        $categories = Category::orderBy('name')->get();
        return Inertia::render('Products/Edit', compact('product', 'categories'));
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'code'        => 'required|string|max:50|unique:products,code,' . $product->id,
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'unit'        => 'required|string|max:20',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $product->update($request->only('code', 'name', 'category_id', 'unit', 'price', 'stock', 'description'));

        return redirect()->route('products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(Product $product)
    {
        if ($product->purchaseOrderDetails()->exists() || $product->salesOrderDetails()->exists()) {
            return redirect()->route('products.index')->with('error', 'Produk tidak bisa dihapus karena sudah ada di transaksi.');
        }

        $product->delete();
        return redirect()->route('products.index')->with('success', 'Produk berhasil dihapus.');
    }
}
