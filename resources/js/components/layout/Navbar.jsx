import { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Menu, CircleUser, ChevronDown, LogOut } from 'lucide-react';

export default function Navbar({ title, onMenuClick }) {
    const { auth } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-1.5 rounded text-gray-500 hover:bg-gray-100"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <h6 className="text-sm font-semibold text-gray-500">{title}</h6>
            </div>

            <div className="relative">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                    <CircleUser className="w-6 h-6 text-gray-400" />
                    {auth?.user?.name}
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {dropdownOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setDropdownOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
