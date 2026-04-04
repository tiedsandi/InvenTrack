import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Login — InvenTrack" />
            <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-[#c0392b] px-6 py-6 text-center">
                        <h4 className="text-white font-bold text-xl">InvenTrack</h4>
                        <p className="text-white/80 text-sm mt-1">Inventory & Order Management</p>
                    </div>

                    <div className="p-6">
                        {errors.email && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                                {errors.email}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                    autoFocus
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/40
                                        ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                            </div>

                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c0392b]/40
                                        ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full bg-[#c0392b] hover:bg-[#a93226] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
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
