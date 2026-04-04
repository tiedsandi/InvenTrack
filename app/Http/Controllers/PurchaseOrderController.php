<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderDetail;
use App\Models\Supplier;
use App\Models\Product;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $purchaseOrders = PurchaseOrder::with('supplier')->latest()->get();
        return Inertia::render('PurchaseOrders/Index', compact('purchaseOrders'));
    }

    public function create()
    {
        $suppliers = Supplier::orderBy('name')->get();
        $products  = Product::orderBy('name')->get();
        return Inertia::render('PurchaseOrders/Create', compact('suppliers', 'products'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'supplier_id'            => 'required|exists:suppliers,id',
            'order_date'             => 'required|date',
            'status'                 => 'required|in:pending,received,cancelled',
            'notes'                  => 'nullable|string',
            'details'                => 'required|array|min:1',
            'details.*.product_id'   => 'required|exists:products,id',
            'details.*.quantity'     => 'required|integer|min:1',
            'details.*.unit_price'   => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request) {
            $totalAmount = collect($request->details)->sum(
                fn($d) => $d['quantity'] * $d['unit_price']
            );

            $po = PurchaseOrder::create([
                'po_number'    => 'PO-' . date('Ymd') . '-' . str_pad(PurchaseOrder::whereDate('created_at', today())->count() + 1, 3, '0', STR_PAD_LEFT),
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

            if ($request->status === 'received') {
                foreach ($request->details as $detail) {
                    Product::where('id', $detail['product_id'])
                        ->increment('stock', $detail['quantity']);
                }
            }
        });

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order berhasil dibuat.');
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load('supplier', 'details.product');
        return Inertia::render('PurchaseOrders/Show', compact('purchaseOrder'));
    }

    public function edit(PurchaseOrder $purchaseOrder)
    {
        $suppliers = Supplier::orderBy('name')->get();
        $products  = Product::orderBy('name')->get();
        $purchaseOrder->load('details.product');
        return Inertia::render('PurchaseOrders/Edit', compact('purchaseOrder', 'suppliers', 'products'));
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $request->validate([
            'supplier_id'            => 'required|exists:suppliers,id',
            'order_date'             => 'required|date',
            'status'                 => 'required|in:pending,received,cancelled',
            'notes'                  => 'nullable|string',
            'details'                => 'required|array|min:1',
            'details.*.product_id'   => 'required|exists:products,id',
            'details.*.quantity'     => 'required|integer|min:1',
            'details.*.unit_price'   => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($request, $purchaseOrder) {
            $oldStatus = $purchaseOrder->status;
            $newStatus = $request->status;

            $totalAmount = collect($request->details)->sum(
                fn($d) => $d['quantity'] * $d['unit_price']
            );

            $oldDetails = $purchaseOrder->details()->get();

            $purchaseOrder->update([
                'supplier_id'  => $request->supplier_id,
                'order_date'   => $request->order_date,
                'total_amount' => $totalAmount,
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

            if ($oldStatus !== 'received' && $newStatus === 'received') {
                foreach ($request->details as $detail) {
                    Product::where('id', $detail['product_id'])
                        ->increment('stock', $detail['quantity']);
                }
            }

            if ($oldStatus === 'received' && $newStatus === 'cancelled') {
                foreach ($oldDetails as $detail) {
                    Product::where('id', $detail->product_id)
                        ->decrement('stock', $detail->quantity);
                }
            }
        });

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order berhasil diperbarui.');
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        DB::transaction(function () use ($purchaseOrder) {
            $purchaseOrder->details()->delete();
            $purchaseOrder->delete();
        });

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order berhasil dihapus.');
    }
}
