import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Plus, Trash2 } from 'lucide-react';

const inp = 'w-full px-2 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10';
const inpH = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10';

export default function Create({ customers, products }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        order_date: new Date().toISOString().slice(0, 10),
        status: 'pending',
        notes: '',
        details: [{ product_id: '', quantity: 1, unit_price: 0 }],
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

    const submit = (e) => { e.preventDefault(); post('/sales-orders'); };

    return (
        <AppLayout title="Transaksi — Buat Sales Order">
            <Head title="Buat Sales Order" />

            <form onSubmit={submit}>
                <div className="space-y-4">
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h6 className="font-semibold text-slate-700">Informasi Sales Order</h6>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Customer <span className="text-red-500">*</span></label>
                                <select value={data.customer_id} onChange={(e) => setData('customer_id', e.target.value)} required
                                    className={`${inpH} ${errors.customer_id ? 'border-red-400' : ''}`}>
                                    <option value="">-- Pilih Customer --</option>
                                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.customer_id && <p className="mt-1 text-xs text-red-500">{errors.customer_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal Order <span className="text-red-500">*</span></label>
                                <input type="date" value={data.order_date} onChange={(e) => setData('order_date', e.target.value)} required className={inpH} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Status <span className="text-red-500">*</span></label>
                                <select value={data.status} onChange={(e) => setData('status', e.target.value)} required className={inpH}>
                                    {['pending', 'shipped', 'cancelled'].map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                </select>
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Catatan</label>
                                <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={2} className={inpH} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h6 className="font-semibold text-slate-700">Detail Produk</h6>
                            <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                <Plus className="w-4 h-4" /> Tambah Baris
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium w-[35%]">Produk</th>
                                        <th className="px-4 py-3 text-left font-medium w-[15%]">Qty</th>
                                        <th className="px-4 py-3 text-left font-medium w-[22%]">Harga Satuan (Rp)</th>
                                        <th className="px-4 py-3 text-right font-medium w-[20%]">Subtotal</th>
                                        <th className="px-4 py-3 w-[8%]"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
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
                                            <td className="px-4 py-2 text-right font-semibold text-slate-700">
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
                                <tfoot className="bg-slate-50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right font-bold text-slate-700">Total</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-800">{fmt(grandTotal)}</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" disabled={processing} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
                            {processing ? 'Menyimpan...' : 'Simpan SO'}
                        </button>
                        <Link href="/sales-orders" className="inline-flex items-center px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Batal</Link>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
