@extends('layouts.app')

@section('title', 'Detail Sales Order')
@section('page-title', 'Transaksi — Detail Sales Order')

@section('content')
    <div class="mb-3">
        <a href="{{ route('sales-orders.index') }}" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i> Kembali
        </a>
        <a href="{{ route('sales-orders.edit', $salesOrder) }}" class="btn btn-sm btn-outline-primary ms-1">
            <i class="bi bi-pencil me-1"></i> Edit
        </a>
    </div>

    <div class="row g-3">
        <div class="col-md-5">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3">
                    <h6 class="mb-0 fw-semibold">Informasi SO</h6>
                </div>
                <div class="card-body">
                    <table class="table table-sm table-borderless mb-0">
                        <tr>
                            <td class="text-muted" width="140">No. SO</td>
                            <td class="fw-semibold">{{ $salesOrder->so_number }}</td>
                        </tr>
                        <tr>
                            <td class="text-muted">Customer</td>
                            <td>{{ $salesOrder->customer->name }}</td>
                        </tr>
                        <tr>
                            <td class="text-muted">Tgl Order</td>
                            <td>{{ \Carbon\Carbon::parse($salesOrder->order_date)->format('d/m/Y') }}</td>
                        </tr>
                        <tr>
                            <td class="text-muted">Status</td>
                            <td>
                                @php $badge = ['pending' => 'warning', 'shipped' => 'success', 'cancelled' => 'danger']; @endphp
                                <span class="badge bg-{{ $badge[$salesOrder->status] ?? 'secondary' }}">
                                    {{ ucfirst($salesOrder->status) }}
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td class="text-muted">Catatan</td>
                            <td>{{ $salesOrder->notes ?? '-' }}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <div class="col-md-7">
            <div class="card border-0 shadow-sm">
                <div class="card-header bg-white py-3">
                    <h6 class="mb-0 fw-semibold">Detail Produk</h6>
                </div>
                <div class="card-body p-0 table-responsive">
                    <table class="table mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>#</th>
                                <th>Produk</th>
                                <th class="text-end">Qty</th>
                                <th class="text-end">Harga Satuan</th>
                                <th class="text-end">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($salesOrder->details as $i => $detail)
                                <tr>
                                    <td>{{ $i + 1 }}</td>
                                    <td>{{ $detail->product->name }}</td>
                                    <td class="text-end">{{ $detail->quantity }} {{ $detail->product->unit }}</td>
                                    <td class="text-end">Rp {{ number_format($detail->unit_price, 0, ',', '.') }}</td>
                                    <td class="text-end">Rp {{ number_format($detail->subtotal, 0, ',', '.') }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                        <tfoot class="table-light">
                            <tr>
                                <td colspan="4" class="text-end fw-bold">Total</td>
                                <td class="text-end fw-bold">Rp {{ number_format($salesOrder->total_amount, 0, ',', '.') }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
