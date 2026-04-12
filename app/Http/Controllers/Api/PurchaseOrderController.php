<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class PurchaseOrderController extends Controller
{
    #[OA\Get(
        path: '/api/purchase-orders',
        summary: 'Daftar purchase order',
        tags: ['Purchase Orders'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'q', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['pending', 'received', 'cancelled'])),
            new OA\Parameter(name: 'date_from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'date_to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
        ],
        responses: [new OA\Response(response: 200, description: 'List purchase order')]
    )]
    public function index(Request $request)
    {
        $orders = PurchaseOrder::with('supplier')
            ->when(
                $request->q,
                fn($q, $s) =>
                $q->where('po_number', 'like', "%$s%")
                    ->orWhereHas('supplier', fn($s2) => $s2->where('name', 'like', "%$s%"))
            )
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->date_from, fn($q, $d) => $q->whereDate('order_date', '>=', $d))
            ->when($request->date_to, fn($q, $d) => $q->whereDate('order_date', '<=', $d))
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json($orders);
    }

    #[OA\Post(
        path: '/api/purchase-orders',
        summary: 'Buat purchase order baru',
        tags: ['Purchase Orders'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['supplier_id', 'order_date', 'status', 'details'],
                properties: [
                    new OA\Property(property: 'supplier_id', type: 'integer', example: 1),
                    new OA\Property(property: 'order_date', type: 'string', format: 'date', example: '2026-04-12'),
                    new OA\Property(property: 'status', type: 'string', enum: ['pending', 'received', 'cancelled'], example: 'pending'),
                    new OA\Property(property: 'notes', type: 'string', example: 'Catatan PO'),
                    new OA\Property(
                        property: 'details',
                        type: 'array',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'product_id', type: 'integer', example: 1),
                                new OA\Property(property: 'quantity', type: 'integer', example: 5),
                                new OA\Property(property: 'unit_price', type: 'number', example: 100000),
                            ]
                        )
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Purchase order berhasil dibuat'),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
    public function store(Request $request)
    {
        $request->validate([
            'supplier_id'          => 'required|exists:suppliers,id',
            'order_date'           => 'required|date',
            'status'               => 'required|in:pending,received,cancelled',
            'notes'                => 'nullable|string',
            'details'              => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity'   => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
        ]);

        $po = DB::transaction(function () use ($request) {
            $totalAmount = collect($request->details)->sum(
                fn($d) => $d['quantity'] * $d['unit_price']
            );

            $po = PurchaseOrder::create([
                'po_number'    => 'PO-' . date('Ymd') . '-' . str_pad(
                    PurchaseOrder::whereDate('created_at', today())->count() + 1,
                    3,
                    '0',
                    STR_PAD_LEFT
                ),
                'supplier_id'  => $request->supplier_id,
                'order_date'   => $request->order_date,
                'total_amount' => $totalAmount,
                'status'       => $request->status,
                'notes'        => $request->notes,
            ]);

            foreach ($request->details as $detail) {
                PurchaseOrderDetail::create([
                    'purchase_order_id' => $po->id,
                    'product_id'        => $detail['product_id'],
                    'quantity'          => $detail['quantity'],
                    'unit_price'        => $detail['unit_price'],
                    'subtotal'          => $detail['quantity'] * $detail['unit_price'],
                ]);
            }

            // Stok langsung naik jika status received
            if ($request->status === 'received') {
                foreach ($request->details as $detail) {
                    Product::where('id', $detail['product_id'])
                        ->increment('stock', $detail['quantity']);
                }
            }

            return $po;
        });

        return response()->json($po->load('supplier', 'details.product'), 201);
    }

    #[OA\Get(
        path: '/api/purchase-orders/{purchase_order}',
        summary: 'Detail purchase order',
        tags: ['Purchase Orders'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'purchase_order', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Detail purchase order'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function show(PurchaseOrder $purchaseOrder)
    {
        return response()->json($purchaseOrder->load('supplier', 'details.product'));
    }

    #[OA\Put(
        path: '/api/purchase-orders/{purchase_order}',
        summary: 'Update purchase order',
        tags: ['Purchase Orders'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'purchase_order', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['supplier_id', 'order_date', 'status', 'details'],
                properties: [
                    new OA\Property(property: 'supplier_id', type: 'integer', example: 1),
                    new OA\Property(property: 'order_date', type: 'string', format: 'date', example: '2026-04-12'),
                    new OA\Property(property: 'status', type: 'string', enum: ['pending', 'received', 'cancelled'], example: 'received'),
                    new OA\Property(property: 'notes', type: 'string', example: 'Catatan PO'),
                    new OA\Property(
                        property: 'details',
                        type: 'array',
                        items: new OA\Items(
                            properties: [
                                new OA\Property(property: 'product_id', type: 'integer', example: 1),
                                new OA\Property(property: 'quantity', type: 'integer', example: 5),
                                new OA\Property(property: 'unit_price', type: 'number', example: 100000),
                            ]
                        )
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Purchase order berhasil diupdate'),
            new OA\Response(response: 422, description: 'Validasi gagal'),
        ]
    )]
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate([
            'supplier_id'          => 'required|exists:suppliers,id',
            'order_date'           => 'required|date',
            'status'               => 'required|in:pending,received,cancelled',
            'notes'                => 'nullable|string',
            'details'              => 'required|array|min:1',
            'details.*.product_id' => 'required|exists:products,id',
            'details.*.quantity'   => 'required|integer|min:1',
            'details.*.unit_price' => 'required|numeric|min:0',
        ]);

        $po = DB::transaction(function () use ($request, $purchaseOrder) {
            $oldStatus  = $purchaseOrder->status;
            $newStatus  = $request->status;
            $oldDetails = $purchaseOrder->details()->get();

            $purchaseOrder->update([
                'supplier_id'  => $request->supplier_id,
                'order_date'   => $request->order_date,
                'total_amount' => collect($request->details)->sum(fn($d) => $d['quantity'] * $d['unit_price']),
                'status'       => $newStatus,
                'notes'        => $request->notes,
            ]);

            $purchaseOrder->details()->delete();

            foreach ($request->details as $detail) {
                PurchaseOrderDetail::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id'        => $detail['product_id'],
                    'quantity'          => $detail['quantity'],
                    'unit_price'        => $detail['unit_price'],
                    'subtotal'          => $detail['quantity'] * $detail['unit_price'],
                ]);
            }

            // pending → received : tambah stok baru
            if ($oldStatus !== 'received' && $newStatus === 'received') {
                foreach ($request->details as $detail) {
                    Product::where('id', $detail['product_id'])
                        ->increment('stock', $detail['quantity']);
                }
            }

            // received → cancelled : kembalikan stok lama
            if ($oldStatus === 'received' && $newStatus === 'cancelled') {
                foreach ($oldDetails as $detail) {
                    Product::where('id', $detail->product_id)
                        ->decrement('stock', $detail->quantity);
                }
            }

            return $purchaseOrder;
        });

        return response()->json($po->load('supplier', 'details.product'));
    }

    #[OA\Delete(
        path: '/api/purchase-orders/{purchase_order}',
        summary: 'Hapus purchase order',
        tags: ['Purchase Orders'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'purchase_order', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Purchase order berhasil dihapus'),
            new OA\Response(response: 404, description: 'Tidak ditemukan'),
        ]
    )]
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        DB::transaction(function () use ($purchaseOrder) {
            $purchaseOrder->details()->delete();
            $purchaseOrder->delete();
        });

        return response()->json(['message' => 'Purchase Order berhasil dihapus.']);
    }
}
