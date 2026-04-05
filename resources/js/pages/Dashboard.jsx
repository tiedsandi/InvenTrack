import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { formatCurrency } from '@/lib/utils';
import { Tag, Package, Truck, Users, ShoppingCart, ShoppingBag, ArrowDownCircle, ArrowUpCircle, TriangleAlert } from 'lucide-react';

const statusBadgePO = {
    pending:   'bg-yellow-100 text-yellow-700',
    received:  'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};
const statusBadgeSO = {
    pending:   'bg-yellow-100 text-yellow-700',
    shipped:   'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};

export default function Dashboard({
    totalCategories, totalProducts, totalSuppliers, totalCustomers,
    totalPO, totalSO, pendingPO, pendingSO,
    totalNilaiPO, totalNilaiSO,
    lowStockProducts, recentPO, recentSO,
}) {
    const masterCards = [
        { label: 'Kategori',  value: totalCategories, bg: 'bg-red-50',    text: 'text-slate-700',  icon: Tag },
        { label: 'Produk',    value: totalProducts,   bg: 'bg-blue-50',   text: 'text-blue-600',   icon: Package },
        { label: 'Supplier',  value: totalSuppliers,  bg: 'bg-green-50',  text: 'text-green-600',  icon: Truck },
        { label: 'Customer',  value: totalCustomers,  bg: 'bg-yellow-50', text: 'text-yellow-600', icon: Users },
    ];

    return (
        <AppLayout title="Dashboard">
            <Head title="Dashboard" />

            {/* Master Data Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {masterCards.map(({ label, value, bg, text, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${bg} shrink-0`}>
                            <Icon className={`w-5 h-5 ${text}`} />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">{label}</div>
                            <div className="text-2xl font-bold text-slate-800">{value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Transaksi Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-xl bg-purple-50 shrink-0">
                            <ShoppingCart className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Purchase Order</div>
                            <div className="text-2xl font-bold text-slate-800">{totalPO}</div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Pending: <span className="font-semibold text-yellow-500">{pendingPO}</span></span>
                        <Link href="/purchase-orders" className="text-purple-600 hover:underline">Lihat</Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-xl bg-pink-50 shrink-0">
                            <ShoppingBag className="w-5 h-5 text-pink-600" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-500">Sales Order</div>
                            <div className="text-2xl font-bold text-slate-800">{totalSO}</div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Pending: <span className="font-semibold text-yellow-500">{pendingSO}</span></span>
                        <Link href="/sales-orders" className="text-pink-600 hover:underline">Lihat</Link>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-green-50 shrink-0">
                        <ArrowDownCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500">Total Pembelian (received)</div>
                        <div className="text-sm font-bold text-slate-800">{formatCurrency(totalNilaiPO)}</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-red-50 shrink-0">
                        <ArrowUpCircle className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500">Total Penjualan (shipped)</div>
                        <div className="text-sm font-bold text-slate-800">{formatCurrency(totalNilaiSO)}</div>
                    </div>
                </div>
            </div>

            {/* Bottom 3 panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Low Stock */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TriangleAlert className="w-4 h-4 text-red-500" />
                            <h6 className="text-sm font-semibold text-slate-700">Produk Stok Rendah</h6>
                        </div>
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">≤ 10</span>
                    </div>
                    {lowStockProducts.length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-8">Semua stok aman ✓</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Produk</th>
                                    <th className="px-4 py-2 text-right font-medium">Stok</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {lowStockProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-2.5">
                                            <div className="font-medium text-slate-800 text-xs">{p.name}</div>
                                            <div className="text-slate-400 text-xs">{p.category?.name ?? '-'}</div>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {p.stock} {p.unit}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Recent PO */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <h6 className="text-sm font-semibold text-slate-700">PO Terbaru</h6>
                        <Link href="/purchase-orders" className="text-xs text-slate-400 hover:text-slate-600">Semua</Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentPO.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm py-8">Belum ada data.</div>
                        ) : recentPO.map((po) => (
                            <div key={po.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">{po.po_number}</div>
                                    <div className="text-xs text-slate-400">{po.supplier?.name}</div>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadgePO[po.status] ?? 'bg-slate-50 text-slate-600'}`}>
                                    {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent SO */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <h6 className="text-sm font-semibold text-slate-700">SO Terbaru</h6>
                        <Link href="/sales-orders" className="text-xs text-slate-400 hover:text-slate-600">Semua</Link>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {recentSO.length === 0 ? (
                            <div className="text-center text-slate-400 text-sm py-8">Belum ada data.</div>
                        ) : recentSO.map((so) => (
                            <div key={so.id} className="px-4 py-3 flex items-center justify-between hover:bg-slate-50">
                                <div>
                                    <div className="text-sm font-semibold text-slate-800">{so.so_number}</div>
                                    <div className="text-xs text-slate-400">{so.customer?.name}</div>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadgeSO[so.status] ?? 'bg-slate-50 text-slate-600'}`}>
                                    {so.status.charAt(0).toUpperCase() + so.status.slice(1)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
