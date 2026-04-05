import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/ui/Pagination';
import { confirmDelete } from '@/lib/swal';
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';

const badge = {
    pending:   'bg-yellow-100 text-yellow-700',
    shipped:   'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-600',
};
const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' }) : '-';

export default function Index({ salesOrders, filters }) {
    const [q, setQ]               = useState(filters.q ?? '');
    const [status, setStatus]     = useState(filters.status ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo]     = useState(filters.date_to ?? '');

    const applyFilters = (overrides = {}) => {
        const params = { q, status, date_from: dateFrom, date_to: dateTo, ...overrides };
        router.get('/sales-orders', params, { preserveState: true, replace: true });
    };

    useEffect(() => {
        const timer = setTimeout(() => applyFilters(), 400);
        return () => clearTimeout(timer);
    }, [q]);

    const handleStatus = (val) => { setStatus(val); applyFilters({ status: val }); };
    const handleDateFrom = (val) => { setDateFrom(val); applyFilters({ date_from: val }); };
    const handleDateTo = (val) => { setDateTo(val); applyFilters({ date_to: val }); };

    const resetFilters = () => {
        setQ(''); setStatus(''); setDateFrom(''); setDateTo('');
        router.get('/sales-orders', {}, { preserveState: true, replace: true });
    };

    const hasFilter = q || status || dateFrom || dateTo;

    return (
        <AppLayout title="Transaksi — Sales Order">
            <Head title="Sales Order" />
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <h6 className="font-semibold text-slate-700">Daftar Sales Order</h6>
                        <Link href="/sales-orders/create" className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> Buat SO
                        </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="text" value={q} onChange={(e) => setQ(e.target.value)}
                                placeholder="No. SO / Customer..."
                                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 w-48" />
                        </div>
                        <select value={status} onChange={(e) => handleStatus(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-600">
                            <option value="">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="shipped">Shipped</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <div className="flex items-center gap-1.5">
                            <input type="date" value={dateFrom} onChange={(e) => handleDateFrom(e.target.value)}
                                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-600" />
                            <span className="text-slate-400 text-sm">s/d</span>
                            <input type="date" value={dateTo} onChange={(e) => handleDateTo(e.target.value)}
                                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 text-slate-600" />
                        </div>
                        {hasFilter && (
                            <button onClick={resetFilters} className="text-xs text-slate-500 hover:text-slate-800 underline">Reset</button>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left font-medium w-12">#</th>
                                <th className="px-5 py-3 text-left font-medium">No. SO</th>
                                <th className="px-5 py-3 text-left font-medium">Customer</th>
                                <th className="px-5 py-3 text-left font-medium">Tgl Order</th>
                                <th className="px-5 py-3 text-left font-medium">Total</th>
                                <th className="px-5 py-3 text-left font-medium">Status</th>
                                <th className="px-5 py-3 text-left font-medium w-36">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {salesOrders.data.length === 0 ? (
                                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Tidak ada data.</td></tr>
                            ) : salesOrders.data.map((so, i) => (
                                <tr key={so.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 text-slate-500">{(salesOrders.current_page - 1) * salesOrders.per_page + i + 1}</td>
                                    <td className="px-5 py-3 font-medium text-slate-800">{so.so_number}</td>
                                    <td className="px-5 py-3 text-slate-600">{so.customer?.name}</td>
                                    <td className="px-5 py-3 text-slate-500">{fmtDate(so.order_date)}</td>
                                    <td className="px-5 py-3 text-slate-700">{fmt(so.total_amount)}</td>
                                    <td className="px-5 py-3">
                                        <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + (badge[so.status] ?? 'bg-slate-100 text-slate-600')}>
                                            {so.status.charAt(0).toUpperCase() + so.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Link href={"/sales-orders/"+so.id} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                            <Link href={"/sales-orders/"+so.id+"/edit"} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                onClick={async () => { if (await confirmDelete(so.so_number)) router.delete('/sales-orders/'+so.id); }}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {salesOrders.last_page > 1 && (
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{salesOrders.total} transaksi</span>
                        <Pagination currentPage={salesOrders.current_page} totalPages={salesOrders.last_page}
                            onPageChange={(p) => router.get('/sales-orders', { q, status, date_from: dateFrom, date_to: dateTo, page: p }, { preserveState: true })} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
