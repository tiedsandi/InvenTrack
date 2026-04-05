import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/ui/Pagination';
import { usePagination } from '@/lib/usePagination';
import { Plus, Eye, Pencil, Trash2, Search } from 'lucide-react';

const badge = {
    pending:   'bg-yellow-100 text-yellow-700',
    shipped:   'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};
const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' }) : '-';

export default function Index({ salesOrders }) {
    const [q, setQ] = useState('');
    const filtered = useMemo(
        () => salesOrders.filter((so) =>
            so.so_number?.toLowerCase().includes(q.toLowerCase()) ||
            so.customer?.name?.toLowerCase().includes(q.toLowerCase())
        ),
        [salesOrders, q]
    );
    const { paginated, page, goTo, totalPages } = usePagination(filtered, 10);

    return (
        <AppLayout title="Transaksi — Sales Order">
            <Head title="Sales Order" />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                    <h6 className="font-semibold text-slate-700">Daftar Sales Order</h6>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="text" value={q} onChange={(e) => { setQ(e.target.value); goTo(1); }}
                                placeholder="No. SO / Customer..." className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 w-44" />
                        </div>
                        <Link href="/sales-orders/create" className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> Buat SO
                        </Link>
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
                            {paginated.length === 0 ? (
                                <tr><td colSpan={7} className="px-5 py-8 text-center text-slate-400">Tidak ada data.</td></tr>
                            ) : paginated.map((so, i) => (
                                <tr key={so.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 text-slate-500">{(page - 1) * 10 + i + 1}</td>
                                    <td className="px-5 py-3 font-medium text-slate-800">{so.so_number}</td>
                                    <td className="px-5 py-3 text-slate-600">{so.customer?.name}</td>
                                    <td className="px-5 py-3 text-slate-500">{fmtDate(so.order_date)}</td>
                                    <td className="px-5 py-3 text-slate-700">{fmt(so.total_amount)}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge[so.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                            {so.status.charAt(0).toUpperCase() + so.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Link href={`/sales-orders/${so.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                            <Link href={`/sales-orders/${so.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                            <Link href={`/sales-orders/${so.id}`} method="delete" as="button"
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                onClick={(e) => { if (!confirm('Hapus SO ini?')) e.preventDefault(); }}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{filtered.length} transaksi</span>
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={goTo} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
