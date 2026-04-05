import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ProgressBar from '@/components/ui/ProgressBar';
import { toastSuccess, toastError } from '@/lib/swal';

export default function AppLayout({ title, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toastSuccess(flash.success);
        else if (flash?.error) toastError(flash.error);
    }, [flash]);

    return (
        <div className="bg-slate-50 font-sans antialiased min-h-screen">
            <ProgressBar />

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
                    {children}
                </main>
            </div>
        </div>
    );
}
