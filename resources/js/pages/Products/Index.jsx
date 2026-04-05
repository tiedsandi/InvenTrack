import { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/ui/Pagination';
import { usePagination } from '@/lib/usePagination';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

export default function Index({ products }) {
    const [q, setQ] = useState('');
    const filtered = useMemo(
        () => products.filter((p) =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.code.toLowerCase().includes(q.toLowerCase())
        ),
        [products, q]
    );
    const { paginated, page, goTo, totalPages } = usePagination(filtered, 10);

    return (
        <AppLayout title="Master Data — Produk">
            <Head title="Produk" />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                    <h6 className="font-semibold text-slate-700">Daftar Produk</h6>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input type="text" value={q} onChange={(e) => { setQ(e.target.value); goTo(1); }}
                                placeholder="Nama / kode..." className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 w-44" />
                        </div>
                        <Link href="/products/create" className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> Tambah
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left font-medium w-12">#</th>
                                <th className="px-5 py-3 text-left font-medium">Kode</th>
                                <th className="px-5 py-3 text-left font-medium">Nama Produk</th>
                                <th className="px-5 py-3 text-left font-medium">Kategori</th>
                                <th className="px-5 py-3 text-left font-medium">Satuan</th>
                                <th className="px-5 py-3 text-left font-medium">Harga</th>
                                <th className="px-5 py-3 text-left font-medium">Stok</th>
                                <th className="px-5 py-3 text-left font-medium w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginated.length === 0 ? (
                                <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-400">Tidak ada data.</td></tr>
                            ) : paginated.map((product, i) => (
                                <tr key={product.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 text-slate-500">{(page - 1) * 10 + i + 1}</td>
                                    <td className="px-5 py-3">
                                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{product.code}</span>
                                    </td>
                                    <td className="px-5 py-3 font-medium text-slate-800">{product.name}</td>
                                    <td className="px-5 py-3 text-slate-500">{product.category?.name ?? '-'}</td>
                                    <td className="px-5 py-3 text-slate-500">{product.unit}</td>
                                    <td className="px-5 py-3 text-slate-700">Rp {Number(product.price).toLocaleString('id-ID')}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                            product.stock <= 10 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                                        }`}>{product.stock}</span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Link href={`/products/${product.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                            <Link href={`/products/${product.id}`} method="delete" as="button"
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                onClick={(e) => { if (!confirm('Hapus produk ini?')) e.preventDefault(); }}>
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
                        <span className="text-xs text-slate-500">{filtered.length} produk</span>
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={goTo} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
