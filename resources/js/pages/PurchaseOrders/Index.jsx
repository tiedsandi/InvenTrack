import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';

const badge = {
    pending:   'bg-yellow-100 text-yellow-700',
    received:  'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' }) : '-';

export default function Index({ purchaseOrders }) {
    return (
        <AppLayout title="Transaksi — Purchase Order">
            <Head title="Purchase Order" />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                    <h6 className="font-semibold text-gray-700">Daftar Purchase Order</h6>
                    <Link href="/purchase-orders/create" className="inline-flex items-center gap-1.5 bg-[#c0392b] hover:bg-[#a93226] text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> Buat PO Baru
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left font-medium w-12">#</th>
                                <th className="px-5 py-3 text-left font-medium">No. PO</th>
                                <th className="px-5 py-3 text-left font-medium">Supplier</th>
                                <th className="px-5 py-3 text-left font-medium">Tgl Order</th>
                                <th className="px-5 py-3 text-left font-medium">Total</th>
                                <th className="px-5 py-3 text-left font-medium">Status</th>
                                <th className="px-5 py-3 text-left font-medium w-36">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {purchaseOrders.length === 0 ? (
                                <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">Belum ada Purchase Order.</td></tr>
                            ) : purchaseOrders.map((po, i) => (
                                <tr key={po.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3 text-gray-500">{i + 1}</td>
                                    <td className="px-5 py-3 font-semibold text-gray-800">{po.po_number}</td>
                                    <td className="px-5 py-3 text-gray-600">{po.supplier?.name}</td>
                                    <td className="px-5 py-3 text-gray-600">{fmtDate(po.order_date)}</td>
                                    <td className="px-5 py-3 text-gray-700">{fmt(po.total_amount)}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge[po.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Link href={`/purchase-orders/${po.id}`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                            <Link href={`/purchase-orders/${po.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                            <Link href={`/purchase-orders/${po.id}`} method="delete" as="button"
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                onClick={(e) => { if (!confirm('Hapus PO ini?')) e.preventDefault(); }}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
