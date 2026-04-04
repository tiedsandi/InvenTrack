import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { ChevronLeft, Pencil } from 'lucide-react';

const badge = {
    pending:   'bg-yellow-100 text-yellow-700',
    received:  'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
};
const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' }) : '-';

export default function Show({ purchaseOrder }) {
    return (
        <AppLayout title="Transaksi — Detail Purchase Order">
            <Head title="Detail Purchase Order" />

            <div className="flex gap-2 mb-4">
                <Link href="/purchase-orders" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Kembali
                </Link>
                <Link href={`/purchase-orders/${purchaseOrder.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    <Pencil className="w-4 h-4" /> Edit
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Info PO */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h6 className="font-semibold text-gray-700">Informasi PO</h6>
                    </div>
                    <div className="p-5">
                        <dl className="space-y-3 text-sm">
                            {[['No. PO', purchaseOrder.po_number], ['Supplier', purchaseOrder.supplier?.name], ['Tgl Order', fmtDate(purchaseOrder.order_date)]].map(([dt, dd]) => (
                                <div key={dt} className="flex gap-2">
                                    <dt className="w-28 text-gray-400 shrink-0">{dt}</dt>
                                    <dd className="font-semibold text-gray-800">{dd}</dd>
                                </div>
                            ))}
                            <div className="flex gap-2 items-center">
                                <dt className="w-28 text-gray-400 shrink-0">Status</dt>
                                <dd>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge[purchaseOrder.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                        {purchaseOrder.status.charAt(0).toUpperCase() + purchaseOrder.status.slice(1)}
                                    </span>
                                </dd>
                            </div>
                            <div className="flex gap-2">
                                <dt className="w-28 text-gray-400 shrink-0">Catatan</dt>
                                <dd className="text-gray-600">{purchaseOrder.notes ?? '-'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Detail Produk */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h6 className="font-semibold text-gray-700">Detail Produk</h6>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium w-8">#</th>
                                    <th className="px-4 py-3 text-left font-medium">Produk</th>
                                    <th className="px-4 py-3 text-right font-medium">Qty</th>
                                    <th className="px-4 py-3 text-right font-medium">Harga Satuan</th>
                                    <th className="px-4 py-3 text-right font-medium">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {purchaseOrder.details.map((detail, i) => (
                                    <tr key={detail.id}>
                                        <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                                        <td className="px-4 py-3 text-gray-800">{detail.product?.name}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{detail.quantity} {detail.product?.unit}</td>
                                        <td className="px-4 py-3 text-right text-gray-600">{fmt(detail.unit_price)}</td>
                                        <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(detail.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-700">Total</td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-800">{fmt(purchaseOrder.total_amount)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
