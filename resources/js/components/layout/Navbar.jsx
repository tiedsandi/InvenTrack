import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar({ title, onMenuClick }) {
    const { auth } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => router.post('/logout');

    const initials = auth?.user?.name
        ?.split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <header className="bg-white border-b border-slate-100 px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-slate-500">{title}</span>
            </div>

            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
                >
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600">
                        {initials}
                    </div>
                    <span className="hidden sm:block font-medium">{auth?.user?.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {dropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                        <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20">
                            <div className="px-3 py-2 border-b border-slate-100 mb-1">
                                <div className="text-xs text-slate-500">Masuk sebagai</div>
                                <div className="text-sm font-medium text-slate-800 truncate">{auth?.user?.name}</div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 rounded-lg mx-1"
                                style={{ width: 'calc(100% - 8px)' }}
                            >
                                <LogOut className="w-4 h-4" />
                                Keluar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
