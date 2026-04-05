import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/ui/Pagination';
import { usePagination } from '@/lib/usePagination';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

export default function Index({ categories }) {
    const [q, setQ] = useState('');
    const filtered = useMemo(
        () => categories.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())),
        [categories, q]
    );
    const { paginated, page, goTo, totalPages } = usePagination(filtered, 10);

    return (
        <AppLayout title="Master Data — Kategori">
            <Head title="Kategori" />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                    <h6 className="font-semibold text-slate-700">Daftar Kategori</h6>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text" value={q} onChange={(e) => { setQ(e.target.value); goTo(1); }}
                                placeholder="Cari..."
                                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 w-40"
                            />
                        </div>
                        <Link href="/categories/create" className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> Tambah
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left font-medium w-12">#</th>
                                <th className="px-5 py-3 text-left font-medium">Nama Kategori</th>
                                <th className="px-5 py-3 text-left font-medium">Deskripsi</th>
                                <th className="px-5 py-3 text-left font-medium w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginated.length === 0 ? (
                                <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Tidak ada data.</td></tr>
                            ) : paginated.map((category, i) => (
                                <tr key={category.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 text-slate-500">{(page - 1) * 10 + i + 1}</td>
                                    <td className="px-5 py-3 font-semibold text-slate-800">{category.name}</td>
                                    <td className="px-5 py-3 text-slate-500">{category.description ?? '-'}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Link href={`/categories/${category.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                            <Link href={`/categories/${category.id}`} method="delete" as="button"
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                onClick={(e) => { if (!confirm('Hapus kategori ini?')) e.preventDefault(); }}>
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
                        <span className="text-xs text-slate-500">{filtered.length} data</span>
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={goTo} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
