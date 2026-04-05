import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({ name: '', description: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/categories');
    };

    return (
        <AppLayout title="Master Data — Tambah Kategori">
            <Head title="Tambah Kategori" />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-xl">
                <div className="px-5 py-4 border-b border-slate-100">
                    <h6 className="font-semibold text-slate-700">Form Tambah Kategori</h6>
                </div>
                <div className="p-5">
                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">
                                Nama Kategori <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="contoh: Benang"
                                required
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10
                                    ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                placeholder="Deskripsi singkat (opsional)"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <Link
                                href="/categories"
                                className="inline-flex items-center px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
