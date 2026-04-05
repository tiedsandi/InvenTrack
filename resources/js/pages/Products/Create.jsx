import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';

const inp = (err) =>
    `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${
        err ? 'border-red-400 bg-red-50' : 'border-slate-200'
    }`;

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        code: '', name: '', category_id: '', unit: '', price: '0', stock: '0', description: '',
    });

    const submit = (e) => { e.preventDefault(); post('/products'); };

    return (
        <AppLayout title="Master Data — Tambah Produk">
            <Head title="Tambah Produk" />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-2xl">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h6 className="font-semibold text-slate-700">Form Tambah Produk</h6>
                </div>
                <div className="p-5">
                    <form onSubmit={submit}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Produk <span className="text-red-500">*</span></label>
                                <input type="text" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="BNG-001" required className={inp(errors.code)} />
                                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Produk <span className="text-red-500">*</span></label>
                                <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required className={inp(errors.name)} />
                                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                                <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} required className={inp(errors.category_id)}>
                                    <option value="">-- Pilih Kategori --</option>
                                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                                {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Satuan <span className="text-red-500">*</span></label>
                                <input type="text" value={data.unit} onChange={(e) => setData('unit', e.target.value)} placeholder="kg / m / pcs" required className={inp(errors.unit)} />
                                {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Harga (Rp) <span className="text-red-500">*</span></label>
                                <input type="number" value={data.price} onChange={(e) => setData('price', e.target.value)} min="0" step="100" required className={inp(errors.price)} />
                                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Stok Awal <span className="text-red-500">*</span></label>
                                <input type="number" value={data.stock} onChange={(e) => setData('stock', e.target.value)} min="0" required className={inp(errors.stock)} />
                                {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
                            </div>
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" disabled={processing} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <Link href="/products" className="inline-flex items-center px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Batal</Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
