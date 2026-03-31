@extends('layouts.app')

@section('title', 'Purchase Order')
@section('page-title', 'Transaksi — Purchase Order')

@section('content')
    <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h6 class="mb-0 fw-semibold">Daftar Purchase Order</h6>
            <a href="{{ route('purchase-orders.create') }}" class="btn btn-sm text-white" style="background-color: #c0392b;">
                <i class="bi bi-plus-lg me-1"></i> Buat PO Baru
            </a>
        </div>
        <div class="card-body p-0 table-responsive">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th width="50">#</th>
                        <th>No. PO</th>
                        <th>Supplier</th>
                        <th>Tgl Order</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th width="150">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($purchaseOrders as $po)
                        <tr>
                            <td>{{ $loop->iteration + ($purchaseOrders->currentPage() - 1) * $purchaseOrders->perPage() }}
                            </td>
                            <td class="fw-semibold">{{ $po->po_number }}</td>
                            <td>{{ $po->supplier->name }}</td>
                            <td>{{ \Carbon\Carbon::parse($po->order_date)->format('d/m/Y') }}</td>
                            <td>Rp {{ number_format($po->total_amount, 0, ',', '.') }}</td>
                            <td>
                                @php
                                    $badge = [
                                        'pending' => 'warning',
                                        'confirmed' => 'info',
                                        'received' => 'success',
                                        'cancelled' => 'danger',
                                    ];
                                @endphp
                                <span class="badge bg-{{ $badge[$po->status] ?? 'secondary' }}">
                                    {{ ucfirst($po->status) }}
                                </span>
                            </td>
                            <td>
                                <a href="{{ route('purchase-orders.show', $po) }}" class="btn btn-sm btn-outline-secondary">
                                    <i class="bi bi-eye"></i>
                                </a>
                                <a href="{{ route('purchase-orders.edit', $po) }}" class="btn btn-sm btn-outline-primary">
                                    <i class="bi bi-pencil"></i>
                                </a>
                                <form action="{{ route('purchase-orders.destroy', $po) }}" method="POST" class="d-inline"
                                    onsubmit="return confirm('Hapus PO ini beserta semua detailnya?')">
                                    @csrf
                                    @method('DELETE')
                                    <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-muted py-4">Belum ada Purchase Order.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if ($purchaseOrders->hasPages())
            <div class="card-footer bg-white">{{ $purchaseOrders->links() }}</div>
        @endif
    </div>
@endsection
