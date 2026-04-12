<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SalesOrderDetail;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Get(
        path: '/api/products',
        summary: 'Daftar produk',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'q', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'category_id', in: 'query', required: false, schema: new OA\Schema(type: 'integer')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [new OA\Response(response: 200, description: 'List produk')]
    )]
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

    #[OA\Post(
        path: '/api/products',
        summary: 'Tambah produk',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['code', 'name', 'category_id', 'unit', 'price', 'stock'],
                properties: [
                    new OA\Property(property: 'code', type: 'string', example: 'PRD-001'),
                    new OA\Property(property: 'name', type: 'string', example: 'Laptop Asus'),
                    new OA\Property(property: 'category_id', type: 'integer', example: 1),
                    new OA\Property(property: 'unit', type: 'string', example: 'pcs'),
                    new OA\Property(property: 'price', type: 'number', example: 5000000),
                    new OA\Property(property: 'stock', type: 'integer', example: 10),
                    new OA\Property(property: 'description', type: 'string', example: 'Laptop gaming'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Produk berhasil dibuat'),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
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

    #[OA\Get(
        path: '/api/products/{product}',
        summary: 'Detail produk',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'product', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detail produk'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function show(Product $product)
    {
        return response()->json($product->load('category'));
    }

    #[OA\Put(
        path: '/api/products/{product}',
        summary: 'Update produk',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'product', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['code', 'name', 'category_id', 'unit', 'price', 'stock'],
                properties: [
                    new OA\Property(property: 'code', type: 'string', example: 'PRD-001'),
                    new OA\Property(property: 'name', type: 'string', example: 'Laptop Asus'),
                    new OA\Property(property: 'category_id', type: 'integer', example: 1),
                    new OA\Property(property: 'unit', type: 'string', example: 'pcs'),
                    new OA\Property(property: 'price', type: 'number', example: 5000000),
                    new OA\Property(property: 'stock', type: 'integer', example: 10),
                    new OA\Property(property: 'description', type: 'string', example: 'Laptop gaming'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Produk berhasil diupdate'),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
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

    #[OA\Delete(
        path: '/api/products/{product}',
        summary: 'Hapus produk',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'product', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Produk berhasil dihapus'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }

    // Stok bebas = stok fisik - qty yang masih pending di SO lain
    #[OA\Get(
        path: '/api/products/{product}/stock',
        summary: 'Cek stok bebas produk',
        tags: ['Products'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'product', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Info stok produk'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
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
