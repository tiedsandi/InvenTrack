import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';

export default function Edit({ category }) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        description: category.description ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/categories/${category.id}`);
    };

    return (
        <AppLayout title="Master Data — Edit Kategori">
            <Head title="Edit Kategori" />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden max-w-xl">
                <div className="px-5 py-4 border-b border-gray-100">
                    <h6 className="font-semibold text-gray-700">Form Edit Kategori</h6>
                </div>
                <div className="p-5">
                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Nama Kategori <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/40
                                    ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>

                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/40"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 bg-[#c0392b] hover:bg-[#a93226] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                            <Link
                                href="/categories"
                                className="inline-flex items-center px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
