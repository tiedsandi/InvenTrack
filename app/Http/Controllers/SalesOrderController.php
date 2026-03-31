<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\SalesOrder;
use App\Models\SalesOrderDetail;
use App\Models\Customer;
use App\Models\Product;

class SalesOrderController extends Controller
{
    public function index()
    {
        $salesOrders = SalesOrder::with('customer')->latest()->paginate(10);
        return view('sales-orders.index', compact('salesOrders'));
    }

    public function create()
    {
        $customers = Customer::orderBy('name')->get();
        $products  = Product::orderBy('name')->get();
        return view('sales-orders.create', compact('customers', 'products'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_id'            => 'required|exists:customers,id',
            'order_date'             => 'required|date',
            'status'                 => 'required|in:pending,shipped,cancelled',
            'notes'                  => 'nullable|string',
            'details'                => 'required|array|min:1',
            'details.*.product_id'   => 'required|exists:products,id',
            'details.*.quantity'     => 'required|integer|min:1',
            'details.*.unit_price'   => 'required|numeric|min:0',
        ]);

        foreach ($request->details as $detail) {
            $product = Product::findOrFail($detail['product_id']);
            $reserved = SalesOrderDetail::whereHas('salesOrder', fn($q) => $q->where('status', 'pending'))
                ->where('product_id', $product->id)
                ->sum('quantity');
            $freeStock = $product->stock - $reserved;

            if ($detail['quantity'] > $freeStock) {
                return redirect()->back()->withInput()
                    ->with('error', "Stok {$product->name} tidak cukup. Stok bebas: {$freeStock} {$product->unit}.");
            }
        }

        DB::transaction(function () use ($request) {
            $totalAmount = collect($request->details)->sum(
                fn($d) => $d['quantity'] * $d['unit_price']
            );

            $so = SalesOrder::create([
                'so_number'    => 'SO-' . date('Ymd') . '-' . str_pad(SalesOrder::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT),
                'customer_id'  => $request->customer_id,
                'order_date'   => $request->order_date,
                'total_amount' => $totalAmount,
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

            if ($request->status === 'shipped') {
                foreach ($request->details as $detail) {
                    Product::where('id', $detail['product_id'])
                        ->decrement('stock', $detail['quantity']);
                }
            }
        });

        return redirect()->route('sales-orders.index')->with('success', 'Sales Order berhasil dibuat.');
    }

    public function show(SalesOrder $salesOrder)
    {
        $salesOrder->load('customer', 'details.product');
        return view('sales-orders.show', compact('salesOrder'));
    }

    public function edit(SalesOrder $salesOrder)
    {
        $customers = Customer::orderBy('name')->get();
        $products  = Product::orderBy('name')->get();
        $salesOrder->load('details.product');
        return view('sales-orders.edit', compact('salesOrder', 'customers', 'products'));
    }

    public function update(Request $request, SalesOrder $salesOrder)
    {
        $request->validate([
            'customer_id'            => 'required|exists:customers,id',
            'order_date'             => 'required|date',
            'status'                 => 'required|in:pending,shipped,cancelled',
            'notes'                  => 'nullable|string',
            'details'                => 'required|array|min:1',
            'details.*.product_id'   => 'required|exists:products,id',
            'details.*.quantity'     => 'required|integer|min:1',
            'details.*.unit_price'   => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $salesOrder) {
            $oldStatus = $salesOrder->status;
            $newStatus = $request->status;

            $totalAmount = collect($request->details)->sum(
                fn($d) => $d['quantity'] * $d['unit_price']
            );

            $salesOrder->update([
                'customer_id'  => $request->customer_id,
                'order_date'   => $request->order_date,
                'total_amount' => $totalAmount,
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

            if ($oldStatus !== 'shipped' && $newStatus === 'shipped') {
                foreach ($request->details as $detail) {
                    Product::where('id', $detail['product_id'])
                        ->decrement('stock', $detail['quantity']);
                }
            }

            if ($oldStatus === 'shipped' && $newStatus === 'cancelled') {
                foreach ($request->details as $detail) {
                    Product::where('id', $detail['product_id'])
                        ->increment('stock', $detail['quantity']);
                }
            }
        });

        return redirect()->route('sales-orders.index')->with('success', 'Sales Order berhasil diperbarui.');
    }

    public function destroy(SalesOrder $salesOrder)
    {
        DB::transaction(function () use ($salesOrder) {
            $salesOrder->details()->delete();
            $salesOrder->delete();
        });

        return redirect()->route('sales-orders.index')->with('success', 'Sales Order berhasil dihapus.');
    }
}
