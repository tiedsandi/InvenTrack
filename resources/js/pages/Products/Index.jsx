import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/components/layout/AppLayout';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function Index({ products }) {
    return (
        <AppLayout title="Master Data — Produk">
            <Head title="Produk" />

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100">
                    <h6 className="font-semibold text-gray-700">Daftar Produk</h6>
                    <Link href="/products/create" className="inline-flex items-center gap-1.5 bg-[#c0392b] hover:bg-[#a93226] text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" /> Tambah Produk
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
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
                        <tbody className="divide-y divide-gray-50">
                            {products.length === 0 ? (
                                <tr><td colSpan={8} className="px-5 py-8 text-center text-gray-400">Belum ada data produk.</td></tr>
                            ) : products.map((product, i) => (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-5 py-3 text-gray-500">{i + 1}</td>
                                    <td className="px-5 py-3">
                                        <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{product.code}</span>
                                    </td>
                                    <td className="px-5 py-3 font-semibold text-gray-800">{product.name}</td>
                                    <td className="px-5 py-3 text-gray-600">{product.category?.name ?? '-'}</td>
                                    <td className="px-5 py-3 text-gray-600">{product.unit}</td>
                                    <td className="px-5 py-3 text-gray-700">Rp {Number(product.price).toLocaleString('id-ID')}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                            product.stock <= 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                                        }`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Link href={`/products/${product.id}/edit`} className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors">
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
            </div>
        </AppLayout>
    );
}
