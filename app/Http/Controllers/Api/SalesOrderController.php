<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\SalesOrder;
use App\Models\SalesOrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesOrderController extends Controller
{
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

  public function show(SalesOrder $salesOrder)
  {
    return response()->json($salesOrder->load('customer', 'details.product'));
  }

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

  public function destroy(SalesOrder $salesOrder)
  {
    DB::transaction(function () use ($salesOrder) {
      $salesOrder->details()->delete();
      $salesOrder->delete();
    });

    return response()->json(['message' => 'Sales Order berhasil dihapus.']);
  }
}
