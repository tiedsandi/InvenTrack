import { Head, useForm } from '@inertiajs/react';
import { Boxes, BookOpen, X } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });
    const [showBanner, setShowBanner] = useState(true);

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login" />
            <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4">

                {showBanner && (
                    <div className="fixed bottom-5 right-5 max-w-xs bg-slate-900 text-white rounded-2xl shadow-lg px-4 py-3 flex items-start gap-3 z-50">
                        <div className="shrink-0 mt-0.5">
                            <BookOpen className="w-4 h-4 text-slate-300" />
                        </div>
                        <div className="flex-1 text-sm">
                            <p className="font-semibold text-white">REST API tersedia</p>
                            <p className="text-slate-400 text-xs mt-0.5">Dokumentasi interaktif untuk integrasi mobile & third-party.</p>
                            <a
                                href="/api/documentation"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-xs font-medium text-slate-900 bg-white hover:bg-slate-100 px-3 py-1 rounded-lg transition-colors"
                            >
                                Lihat API Docs →
                            </a>
                        </div>
                        <button onClick={() => setShowBanner(false)} className="shrink-0 text-slate-400 hover:text-white transition-colors mt-0.5">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <div className="w-full max-w-sm">
                    {/* Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-2xl mb-4">
                            <Boxes className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900">InvenTrack</h1>
                        <p className="text-sm text-slate-500 mt-1">Inventory & Order Management</p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        {errors.email && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                                {errors.email}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin@inventrack.com"
                                    autoFocus
                                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400
                                        ${errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="admin123"
                                    className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400
                                        ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
                            >
                                {processing ? 'Memproses...' : 'Masuk'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
