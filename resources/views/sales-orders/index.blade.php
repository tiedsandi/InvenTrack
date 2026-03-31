@extends('layouts.app')

@section('title', 'Sales Order')
@section('page-title', 'Transaksi — Sales Order')

@section('content')
    <div class="card border-0 shadow-sm">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h6 class="mb-0 fw-semibold">Daftar Sales Order</h6>
            <a href="{{ route('sales-orders.create') }}" class="btn btn-sm text-white" style="background-color: #c0392b;">
                <i class="bi bi-plus-lg me-1"></i> Buat SO Baru
            </a>
        </div>
        <div class="card-body p-0 table-responsive">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th width="50">#</th>
                        <th>No. SO</th>
                        <th>Customer</th>
                        <th>Tgl Order</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th width="150">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($salesOrders as $so)
                        <tr>
                            <td>{{ $loop->iteration + ($salesOrders->currentPage() - 1) * $salesOrders->perPage() }}</td>
                            <td class="fw-semibold">{{ $so->so_number }}</td>
                            <td>{{ $so->customer->name }}</td>
                            <td>{{ \Carbon\Carbon::parse($so->order_date)->format('d/m/Y') }}</td>
                            <td>Rp {{ number_format($so->total_amount, 0, ',', '.') }}</td>
                            <td>
                                @php $badge = ['pending' => 'warning', 'shipped' => 'success', 'cancelled' => 'danger']; @endphp
                                <span class="badge bg-{{ $badge[$so->status] ?? 'secondary' }}">
                                    {{ ucfirst($so->status) }}
                                </span>
                            </td>
                            <td>
                                <a href="{{ route('sales-orders.show', $so) }}" class="btn btn-sm btn-outline-secondary">
                                    <i class="bi bi-eye"></i>
                                </a>
                                <a href="{{ route('sales-orders.edit', $so) }}" class="btn btn-sm btn-outline-primary">
                                    <i class="bi bi-pencil"></i>
                                </a>
                                <form action="{{ route('sales-orders.destroy', $so) }}" method="POST" class="d-inline"
                                    onsubmit="return confirm('Hapus SO ini beserta semua detailnya?')">
                                    @csrf
                                    @method('DELETE')
                                    <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-muted py-4">Belum ada Sales Order.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        @if ($salesOrders->hasPages())
            <div class="card-footer bg-white">{{ $salesOrders->links() }}</div>
        @endif
    </div>
@endsection
