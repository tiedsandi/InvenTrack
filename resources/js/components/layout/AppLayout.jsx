import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ProgressBar from '@/components/ui/ProgressBar';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function AppLayout({ title, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash } = usePage().props;

    return (
        <div className="bg-slate-50 font-sans antialiased min-h-screen">
            <ProgressBar />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="lg:ml-64 min-h-screen flex flex-col">
                <Navbar title={title} onMenuClick={() => setSidebarOpen(true)} />

                <main className="p-5 lg:p-6 flex-1">
                    {flash?.success && (
                        <div className="mb-4 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                            <XCircle className="w-4 h-4 shrink-0" />
                            {flash.error}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
