<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\SalesOrder;
use App\Models\Supplier;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            'total_categories'   => Category::count(),
            'total_products'     => Product::count(),
            'total_suppliers'    => Supplier::count(),
            'total_customers'    => Customer::count(),
            'total_po'           => PurchaseOrder::count(),
            'total_so'           => SalesOrder::count(),
            'pending_po'         => PurchaseOrder::where('status', 'pending')->count(),
            'pending_so'         => SalesOrder::where('status', 'pending')->count(),
            'total_nilai_po'     => PurchaseOrder::where('status', 'received')->sum('total_amount'),
            'total_nilai_so'     => SalesOrder::where('status', 'shipped')->sum('total_amount'),
            'low_stock_products' => Product::with('category')
                ->where('stock', '<=', 10)
                ->orderBy('stock')
                ->get(),
        ]);
    }
}
