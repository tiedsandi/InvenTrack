<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSupplierRequest;
use App\Http\Requests\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use OpenApi\Attributes as OA;

class SupplierController extends Controller
{
    #[OA\Get(
        path: '/api/suppliers',
        summary: 'Daftar supplier',
        tags: ['Suppliers'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'q', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [new OA\Response(response: 200, description: 'List supplier')]
    )]
    public function index()
    {
        $suppliers = Supplier::when(request('q'), fn($q, $s) => $q->where('name', 'like', "%$s%"))
            ->latest()
            ->paginate(request()->integer('per_page', 15));

        return SupplierResource::collection($suppliers);
    }

    #[OA\Post(
        path: '/api/suppliers',
        summary: 'Tambah supplier',
        tags: ['Suppliers'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'PT Sumber Makmur'),
                    new OA\Property(property: 'phone', type: 'string', example: '081234567890'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'supplier@example.com'),
                    new OA\Property(property: 'address', type: 'string', example: 'Jl. Raya No. 1'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Supplier berhasil dibuat'),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
    public function store(StoreSupplierRequest $request)
    {
        $supplier = Supplier::create($request->validated());

        return new SupplierResource($supplier);
    }

    #[OA\Get(
        path: '/api/suppliers/{supplier}',
        summary: 'Detail supplier',
        tags: ['Suppliers'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'supplier', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detail supplier'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function show(Supplier $supplier)
    {
        return new SupplierResource($supplier);
    }

    #[OA\Put(
        path: '/api/suppliers/{supplier}',
        summary: 'Update supplier',
        tags: ['Suppliers'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'supplier', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'PT Sumber Makmur'),
                    new OA\Property(property: 'phone', type: 'string', example: '081234567890'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'supplier@example.com'),
                    new OA\Property(property: 'address', type: 'string', example: 'Jl. Raya No. 1'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Supplier berhasil diupdate'),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
    public function update(UpdateSupplierRequest $request, Supplier $supplier)
    {
        $supplier->update($request->validated());

        return new SupplierResource($supplier);
    }

    #[OA\Delete(
        path: '/api/suppliers/{supplier}',
        summary: 'Hapus supplier',
        tags: ['Suppliers'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'supplier', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Supplier berhasil dihapus'),
            new OA\Response(response: 422, description: 'Supplier masih terkait Purchase Order'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function destroy(Supplier $supplier)
    {
        if ($supplier->purchaseOrders()->exists()) {
            return response()->json([
                'message' => 'Supplier tidak bisa dihapus karena masih ada Purchase Order terkait.',
            ], 422);
        }

        $supplier->delete();

        return response()->json(['message' => 'Supplier berhasil dihapus.']);
    }
}
