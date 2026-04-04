import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Plus, Trash2 } from 'lucide-react';

const inp = 'w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/40';
const inpH = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/40';

export default function Edit({ purchaseOrder, suppliers, products }) {
    const { data, setData, put, processing, errors } = useForm({
        supplier_id: purchaseOrder.supplier_id,
        order_date: purchaseOrder.order_date?.slice(0, 10),
        status: purchaseOrder.status,
        notes: purchaseOrder.notes ?? '',
        details: purchaseOrder.details.map((d) => ({
            product_id: d.product_id,
            quantity: d.quantity,
            unit_price: d.unit_price,
        })),
    });

    const addRow = () => setData('details', [...data.details, { product_id: '', quantity: 1, unit_price: 0 }]);
    const removeRow = (i) => setData('details', data.details.filter((_, idx) => idx !== i));
    const updateDetail = (i, field, value) =>
        setData('details', data.details.map((d, idx) => idx === i ? { ...d, [field]: value } : d));
    const fillPrice = (i, productId) => {
        const p = products.find((p) => String(p.id) === String(productId));
        setData('details', data.details.map((d, idx) =>
            idx === i ? { ...d, product_id: productId, unit_price: p ? p.price : 0 } : d
        ));
    };

    const grandTotal = data.details.reduce((sum, d) => sum + (Number(d.quantity) || 0) * (Number(d.unit_price) || 0), 0);
    const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

    const submit = (e) => { e.preventDefault(); put(`/purchase-orders/${purchaseOrder.id}`); };

    return (
        <AppLayout title="Transaksi — Edit Purchase Order">
            <Head title="Edit Purchase Order" />

            <form onSubmit={submit}>
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100">
                            <h6 className="font-semibold text-gray-700">Informasi Purchase Order</h6>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Supplier <span className="text-red-500">*</span></label>
                                <select value={data.supplier_id} onChange={(e) => setData('supplier_id', e.target.value)} required className={`${inpH} ${errors.supplier_id ? 'border-red-400' : ''}`}>
                                    <option value="">-- Pilih Supplier --</option>
                                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                {errors.supplier_id && <p className="mt-1 text-xs text-red-500">{errors.supplier_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Order <span className="text-red-500">*</span></label>
                                <input type="date" value={data.order_date} onChange={(e) => setData('order_date', e.target.value)} required className={inpH} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status <span className="text-red-500">*</span></label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={inpH}>
                                    {['pending', 'received', 'cancelled'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan</label>
                                <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={2} className={inpH} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h6 className="font-semibold text-gray-700">Detail Produk</h6>
                            <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                <Plus className="w-4 h-4" /> Tambah Baris
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium w-[35%]">Produk</th>
                                        <th className="px-4 py-3 text-left font-medium w-[15%]">Qty</th>
                                        <th className="px-4 py-3 text-left font-medium w-[22%]">Harga Satuan (Rp)</th>
                                        <th className="px-4 py-3 text-right font-medium w-[20%]">Subtotal</th>
                                        <th className="px-4 py-3 w-[8%]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data.details.map((detail, i) => (
                                        <tr key={i}>
                                            <td className="px-4 py-2">
                                                <select value={detail.product_id} onChange={(e) => fillPrice(i, e.target.value)} required className={inp}>
                                                    <option value="">-- Pilih Produk --</option>
                                                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
                                                </select>
                                            </td>
                                            <td className="px-4 py-2">
                                                <input type="number" value={detail.quantity} onChange={(e) => updateDetail(i, 'quantity', e.target.value)} min="1" required className={inp} />
                                            </td>
                                            <td className="px-4 py-2">
                                                <input type="number" value={detail.unit_price} onChange={(e) => updateDetail(i, 'unit_price', e.target.value)} min="0" required className={inp} />
                                            </td>
                                            <td className="px-4 py-2 text-right font-semibold text-gray-700">
                                                {fmt((detail.quantity || 0) * (detail.unit_price || 0))}
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                                <button type="button" onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-700">Total</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-800">{fmt(grandTotal)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" disabled={processing} className="bg-[#c0392b] hover:bg-[#a93226] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                        <Link href="/purchase-orders" className="inline-flex items-center px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Batal</Link>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
