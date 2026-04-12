<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class CustomerController extends Controller
{
    #[OA\Get(
        path: '/api/customers',
        summary: 'Daftar customer',
        tags: ['Customers'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'q', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [new OA\Response(response: 200, description: 'List customer')]
    )]
    public function index(Request $request)
    {
        $customers = Customer::when($request->q, fn($q, $s) => $q->where('name', 'like', "%$s%"))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($customers);
    }

    #[OA\Post(
        path: '/api/customers',
        summary: 'Tambah customer',
        tags: ['Customers'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Toko Maju Jaya'),
                    new OA\Property(property: 'phone', type: 'string', example: '081234567890'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'customer@example.com'),
                    new OA\Property(property: 'address', type: 'string', example: 'Jl. Sudirman No. 5'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Customer berhasil dibuat'),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'email'   => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $customer = Customer::create($data);

        return response()->json($customer, 201);
    }

    #[OA\Get(
        path: '/api/customers/{customer}',
        summary: 'Detail customer',
        tags: ['Customers'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'customer', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detail customer'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function show(Customer $customer)
    {
        return response()->json($customer);
    }

    #[OA\Put(
        path: '/api/customers/{customer}',
        summary: 'Update customer',
        tags: ['Customers'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'customer', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Toko Maju Jaya'),
                    new OA\Property(property: 'phone', type: 'string', example: '081234567890'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'customer@example.com'),
                    new OA\Property(property: 'address', type: 'string', example: 'Jl. Sudirman No. 5'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Customer berhasil diupdate'),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
    public function update(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'phone'   => 'nullable|string|max:20',
            'email'   => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $customer->update($data);

        return response()->json($customer);
    }

    #[OA\Delete(
        path: '/api/customers/{customer}',
        summary: 'Hapus customer',
        tags: ['Customers'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'customer', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Customer berhasil dihapus'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function destroy(Customer $customer)
    {
        $customer->delete();

        return response()->json(['message' => 'Customer berhasil dihapus.']);
    }
}
