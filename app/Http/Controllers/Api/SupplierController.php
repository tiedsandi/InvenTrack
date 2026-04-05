<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
  public function index(Request $request)
  {
    $suppliers = Supplier::when($request->q, fn($q, $s) => $q->where('name', 'like', "%$s%"))
      ->latest()
      ->paginate($request->integer('per_page', 15));

    return response()->json($suppliers);
  }

  public function store(Request $request)
  {
    $data = $request->validate([
      'name'    => 'required|string|max:255',
      'phone'   => 'nullable|string|max:20',
      'email'   => 'nullable|email|max:255',
      'address' => 'nullable|string',
    ]);

    $supplier = Supplier::create($data);

    return response()->json($supplier, 201);
  }

  public function show(Supplier $supplier)
  {
    return response()->json($supplier);
  }

  public function update(Request $request, Supplier $supplier)
  {
    $data = $request->validate([
      'name'    => 'required|string|max:255',
      'phone'   => 'nullable|string|max:20',
      'email'   => 'nullable|email|max:255',
      'address' => 'nullable|string',
    ]);

    $supplier->update($data);

    return response()->json($supplier);
  }

  public function destroy(Supplier $supplier)
  {
    $supplier->delete();

    return response()->json(['message' => 'Supplier berhasil dihapus.']);
  }
}
