import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/ui/Pagination';
import { confirmDelete } from '@/lib/swal';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

export default function Index({ suppliers, filters }) {
    const [q, setQ] = useState(filters.q ?? '');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get('/suppliers', { q }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(timer);
    }, [q]);

    return (
        <AppLayout title="Master Data — Supplier">
            <Head title="Supplier" />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
                    <h6 className="font-semibold text-slate-700">Daftar Supplier</h6>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text" value={q} onChange={(e) => setQ(e.target.value)}
                                placeholder="Cari nama..."
                                className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 w-44"
                            />
                        </div>
                        <Link href="/suppliers/create" className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                            <Plus className="w-4 h-4" /> Tambah
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-3 text-left font-medium w-12">#</th>
                                <th className="px-5 py-3 text-left font-medium">Nama Supplier</th>
                                <th className="px-5 py-3 text-left font-medium">Telepon</th>
                                <th className="px-5 py-3 text-left font-medium">Email</th>
                                <th className="px-5 py-3 text-left font-medium">Alamat</th>
                                <th className="px-5 py-3 text-left font-medium w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {suppliers.data.length === 0 ? (
                                <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Tidak ada data.</td></tr>
                            ) : suppliers.data.map((supplier, i) => (
                                <tr key={supplier.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 text-slate-500">{(suppliers.current_page - 1) * suppliers.per_page + i + 1}</td>
                                    <td className="px-5 py-3 font-medium text-slate-800">{supplier.name}</td>
                                    <td className="px-5 py-3 text-slate-600">{supplier.phone ?? '-'}</td>
                                    <td className="px-5 py-3 text-slate-600">{supplier.email ?? '-'}</td>
                                    <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{supplier.address ?? '-'}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Link href={`/suppliers/${supplier.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                                                onClick={async () => { if (await confirmDelete(supplier.name)) router.delete(`/suppliers/${supplier.id}`); }}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {suppliers.last_page > 1 && (
                    <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs text-slate-500">{suppliers.total} data</span>
                        <Pagination
                            currentPage={suppliers.current_page}
                            totalPages={suppliers.last_page}
                            onPageChange={(p) => router.get('/suppliers', { q, page: p }, { preserveState: true })}
                        />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
