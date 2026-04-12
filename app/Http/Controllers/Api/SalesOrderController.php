<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SalesOrder;
use App\Models\SalesOrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class SalesOrderController extends Controller
{
  #[OA\Get(
      path: '/api/sales-orders',
      summary: 'Daftar sales order',
      tags: ['Sales Orders'],
      security: [['bearerAuth' => []]],
      parameters: [
          new OA\Parameter(name: 'q', in: 'query', required: false, schema: new OA\Schema(type: 'string')),
          new OA\Parameter(name: 'status', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['pending', 'shipped', 'cancelled'])),
          new OA\Parameter(name: 'date_from', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
          new OA\Parameter(name: 'date_to', in: 'query', required: false, schema: new OA\Schema(type: 'string', format: 'date')),
          new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', default: 15)),
      ],
      responses: [new OA\Response(response: 200, description: 'List sales order')]
  )]
  public function index(Request $request)
  {
    $orders = SalesOrder::with('customer')
      ->when(
        $request->q,
        fn($q, $s) =>
        $q->where('so_number', 'like', "%$s%")
          ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%$s%"))
      )
      ->when($request->status, fn($q, $s) => $q->where('status', $s))
      ->when($request->date_from, fn($q, $d) => $q->whereDate('order_date', '>=', $d))
      ->when($request->date_to, fn($q, $d) => $q->whereDate('order_date', '<=', $d))
      ->latest()
      ->paginate($request->integer('per_page', 15));

    return response()->json($orders);
  }

  #[OA\Post(
      path: '/api/sales-orders',
      summary: 'Buat sales order baru',
      tags: ['Sales Orders'],
      security: [['bearerAuth' => []]],
      requestBody: new OA\RequestBody(
          required: true,
          content: new OA\JsonContent(
              required: ['customer_id', 'order_date', 'status', 'details'],
              properties: [
                  new OA\Property(property: 'customer_id', type: 'integer', example: 1),
                  new OA\Property(property: 'order_date', type: 'string', format: 'date', example: '2026-04-12'),
                  new OA\Property(property: 'status', type: 'string', enum: ['pending', 'shipped', 'cancelled'], example: 'pending'),
                  new OA\Property(property: 'notes', type: 'string', example: 'Catatan SO'),
                  new OA\Property(
                      property: 'details',
                      type: 'array',
                      items: new OA\Items(
                          properties: [
                              new OA\Property(property: 'product_id', type: 'integer', example: 1),
                              new OA\Property(property: 'quantity', type: 'integer', example: 2),
                              new OA\Property(property: 'unit_price', type: 'number', example: 150000),
                          ]
                      )
                  ),
              ]
          )
      ),
      responses: [
          new OA\Response(response: 201, description: 'Sales order berhasil dibuat'),
          new OA\Response(response: 422, description: 'Validasi gagal atau stok tidak cukup'),
      ]
  )]
  public function store(Request $request)
  {
    $request->validate([
      'customer_id'          => 'required|exists:customers,id',
      'order_date'           => 'required|date',
      'status'               => 'required|in:pending,shipped,cancelled',
      'notes'                => 'nullable|string',
      'details'              => 'required|array|min:1',
      'details.*.product_id' => 'required|exists:products,id',
      'details.*.quantity'   => 'required|integer|min:1',
      'details.*.unit_price' => 'required|numeric|min:0',
    ]);

    // Validasi stok bebas
    foreach ($request->details as $detail) {
      $product  = Product::findOrFail($detail['product_id']);
      $reserved = SalesOrderDetail::whereHas('salesOrder', fn($q) => $q->where('status', 'pending'))
        ->where('product_id', $product->id)
        ->sum('quantity');
      $freeStock = $product->stock - $reserved;

      if ($detail['quantity'] > $freeStock) {
        return response()->json([
          'message' => "Stok {$product->name} tidak cukup. Stok bebas: {$freeStock} {$product->unit}.",
        ], 422);
      }
    }

    $so = DB::transaction(function () use ($request) {
      $so = SalesOrder::create([
        'so_number'    => 'SO-' . date('Ymd') . '-' . str_pad(
          SalesOrder::whereDate('created_at', today())->count() + 1,
          3,
          '0',
          STR_PAD_LEFT
        ),
        'customer_id'  => $request->customer_id,
        'order_date'   => $request->order_date,
        'total_amount' => collect($request->details)->sum(fn($d) => $d['quantity'] * $d['unit_price']),
        'status'       => $request->status,
        'notes'        => $request->notes,
      ]);

      foreach ($request->details as $detail) {
        SalesOrderDetail::create([
          'sales_order_id' => $so->id,
          'product_id'     => $detail['product_id'],
          'quantity'       => $detail['quantity'],
          'unit_price'     => $detail['unit_price'],
          'subtotal'       => $detail['quantity'] * $detail['unit_price'],
        ]);
      }

      // Stok langsung berkurang jika dibuat dengan status shipped
      if ($request->status === 'shipped') {
        foreach ($request->details as $detail) {
          Product::where('id', $detail['product_id'])
            ->decrement('stock', $detail['quantity']);
        }
      }

      return $so;
    });

    return response()->json($so->load('customer', 'details.product'), 201);
  }

  #[OA\Get(
      path: '/api/sales-orders/{sales_order}',
      summary: 'Detail sales order',
      tags: ['Sales Orders'],
      security: [['bearerAuth' => []]],
      parameters: [
          new OA\Parameter(name: 'sales_order', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
      ],
      responses: [
          new OA\Response(response: 200, description: 'Detail sales order'),
          new OA\Response(response: 404, description: 'Tidak ditemukan'),
      ]
  )]
  public function show(SalesOrder $salesOrder)
  {
    return response()->json($salesOrder->load('customer', 'details.product'));
  }

  #[OA\Put(
      path: '/api/sales-orders/{sales_order}',
      summary: 'Update sales order',
      tags: ['Sales Orders'],
      security: [['bearerAuth' => []]],
      parameters: [
          new OA\Parameter(name: 'sales_order', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
      ],
      requestBody: new OA\RequestBody(
          required: true,
          content: new OA\JsonContent(
              required: ['customer_id', 'order_date', 'status', 'details'],
              properties: [
                  new OA\Property(property: 'customer_id', type: 'integer', example: 1),
                  new OA\Property(property: 'order_date', type: 'string', format: 'date', example: '2026-04-12'),
                  new OA\Property(property: 'status', type: 'string', enum: ['pending', 'shipped', 'cancelled'], example: 'shipped'),
                  new OA\Property(property: 'notes', type: 'string', example: 'Catatan SO'),
                  new OA\Property(
                      property: 'details',
                      type: 'array',
                      items: new OA\Items(
                          properties: [
                              new OA\Property(property: 'product_id', type: 'integer', example: 1),
                              new OA\Property(property: 'quantity', type: 'integer', example: 2),
                              new OA\Property(property: 'unit_price', type: 'number', example: 150000),
                          ]
                      )
                  ),
              ]
          )
      ),
      responses: [
          new OA\Response(response: 200, description: 'Sales order berhasil diupdate'),
          new OA\Response(response: 422, description: 'Validasi gagal'),
      ]
  )]
  public function update(Request $request, SalesOrder $salesOrder)
  {
    $request->validate([
      'customer_id'          => 'required|exists:customers,id',
      'order_date'           => 'required|date',
      'status'               => 'required|in:pending,shipped,cancelled',
      'notes'                => 'nullable|string',
      'details'              => 'required|array|min:1',
      'details.*.product_id' => 'required|exists:products,id',
      'details.*.quantity'   => 'required|integer|min:1',
      'details.*.unit_price' => 'required|numeric|min:0',
    ]);

    $oldStatus = $salesOrder->status;
    $newStatus = $request->status;

    // Validasi stok bebas saat pending → shipped
    if ($oldStatus !== 'shipped' && $newStatus === 'shipped') {
      foreach ($request->details as $detail) {
        $product  = Product::findOrFail($detail['product_id']);
        $reserved = SalesOrderDetail::whereHas(
          'salesOrder',
          fn($q) =>
          $q->where('status', 'pending')->where('id', '!=', $salesOrder->id)
        )->where('product_id', $product->id)->sum('quantity');
        $freeStock = $product->stock - $reserved;

        if ($detail['quantity'] > $freeStock) {
          return response()->json([
            'message' => "Stok {$product->name} tidak cukup. Stok bebas: {$freeStock} {$product->unit}.",
          ], 422);
        }
      }
    }

    $so = DB::transaction(function () use ($request, $salesOrder, $oldStatus, $newStatus) {
      $oldDetails = $salesOrder->details()->get();

      $salesOrder->update([
        'customer_id'  => $request->customer_id,
        'order_date'   => $request->order_date,
        'total_amount' => collect($request->details)->sum(fn($d) => $d['quantity'] * $d['unit_price']),
        'status'       => $newStatus,
        'notes'        => $request->notes,
      ]);

      $salesOrder->details()->delete();

      foreach ($request->details as $detail) {
        SalesOrderDetail::create([
          'sales_order_id' => $salesOrder->id,
          'product_id'     => $detail['product_id'],
          'quantity'       => $detail['quantity'],
          'unit_price'     => $detail['unit_price'],
          'subtotal'       => $detail['quantity'] * $detail['unit_price'],
        ]);
      }

      // pending → shipped : kurangi stok baru
      if ($oldStatus !== 'shipped' && $newStatus === 'shipped') {
        foreach ($request->details as $detail) {
          Product::where('id', $detail['product_id'])
            ->decrement('stock', $detail['quantity']);
        }
      }

      // shipped → cancelled : kembalikan stok lama
      if ($oldStatus === 'shipped' && $newStatus === 'cancelled') {
        foreach ($oldDetails as $detail) {
          Product::where('id', $detail->product_id)
            ->increment('stock', $detail->quantity);
        }
      }

      return $salesOrder;
    });

    return response()->json($so->load('customer', 'details.product'));
  }

  #[OA\Delete(
      path: '/api/sales-orders/{sales_order}',
      summary: 'Hapus sales order',
      tags: ['Sales Orders'],
      security: [['bearerAuth' => []]],
      parameters: [
          new OA\Parameter(name: 'sales_order', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
      ],
      responses: [
          new OA\Response(response: 200, description: 'Sales order berhasil dihapus'),
          new OA\Response(response: 404, description: 'Tidak ditemukan'),
      ]
  )]
  public function destroy(SalesOrder $salesOrder)
  {
    DB::transaction(function () use ($salesOrder) {
      $salesOrder->details()->delete();
      $salesOrder->delete();
    });

    return response()->json(['message' => 'Sales Order berhasil dihapus.']);
  }
}
