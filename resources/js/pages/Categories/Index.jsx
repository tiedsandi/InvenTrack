import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function Index({ categories }) {
    return (
        <AppLayout title="Master Data — Kategori">
            <Head title="Kategori" />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                    <h6 className="font-semibold text-gray-700">Daftar Kategori</h6>
                    <Link
                        href="/categories/create"
                        className="inline-flex items-center gap-1.5 bg-[#c0392b] hover:bg-[#a93226] text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Kategori
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left font-medium w-12">#</th>
                                <th className="px-5 py-3 text-left font-medium">Nama Kategori</th>
                                <th className="px-5 py-3 text-left font-medium">Deskripsi</th>
                                <th className="px-5 py-3 text-left font-medium w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">Belum ada data kategori.</td>
                                </tr>
                            ) : categories.map((category, i) => (
                                <tr key={category.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3 text-gray-500">{i + 1}</td>
                                    <td className="px-5 py-3 font-semibold text-gray-800">{category.name}</td>
                                    <td className="px-5 py-3 text-gray-500">{category.description ?? '-'}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Link
                                                href={`/categories/${category.id}/edit`}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                            <Link
                                                href={`/categories/${category.id}`}
                                                method="delete"
                                                as="button"
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                onClick={(e) => { if (!confirm('Hapus kategori ini?')) e.preventDefault(); }}
                                            >
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
