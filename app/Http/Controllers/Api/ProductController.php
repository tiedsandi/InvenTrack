<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SalesOrderDetail;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with('category')
            ->when(
                $request->q,
                fn($q, $s) =>
                $q->where('name', 'like', "%$s%")->orWhere('code', 'like', "%$s%")
            )
            ->when($request->category_id, fn($q, $id) => $q->where('category_id', $id))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'        => 'required|string|max:50|unique:products,code',
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'unit'        => 'required|string|max:20',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $product = Product::create($data);

        return response()->json($product->load('category'), 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'code'        => 'required|string|max:50|unique:products,code,' . $product->id,
            'name'        => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'unit'        => 'required|string|max:20',
            'price'       => 'required|numeric|min:0',
            'stock'       => 'required|integer|min:0',
            'description' => 'nullable|string',
        ]);

        $product->update($data);

        return response()->json($product->load('category'));
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    // Stok bebas = stok fisik - qty yang masih pending di SO lain
    public function stock(Product $product)
    {
        $reserved = SalesOrderDetail::whereHas('salesOrder', fn($q) => $q->where('status', 'pending'))
            ->where('product_id', $product->id)
            ->sum('quantity');

        return response()->json([
            'product_id'     => $product->id,
            'name'           => $product->name,
            'unit'           => $product->unit,
            'stock'          => $product->stock,
            'reserved'       => $reserved,
            'free_stock'     => $product->stock - $reserved,
        ]);
    }
}
