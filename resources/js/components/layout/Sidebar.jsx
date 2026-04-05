import { Link, usePage } from '@inertiajs/react';
import {
    Boxes,
    LayoutDashboard,
    Tag,
    Truck,
    Users,
    Package,
    ShoppingCart,
    ShoppingBag,
} from 'lucide-react';

const navigation = [
    {
        section: 'Utama',
        items: [
            { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        section: 'Master Data',
        items: [
            { label: 'Kategori', href: '/categories', icon: Tag },
            { label: 'Supplier', href: '/suppliers', icon: Truck },
            { label: 'Customer', href: '/customers', icon: Users },
            { label: 'Produk', href: '/products', icon: Package },
        ],
    },
    {
        section: 'Transaksi',
        items: [
            { label: 'Purchase Order', href: '/purchase-orders', icon: ShoppingCart },
            { label: 'Sales Order', href: '/sales-orders', icon: ShoppingBag },
        ],
    },
];

export default function Sidebar({ isOpen, onClose }) {
    const { url } = usePage();
    const isActive = (href) => url.startsWith(href);

    return (
        <aside
            className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 flex flex-col
                transition-transform duration-250
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        >
            {/* Brand */}
            <div className="px-5 py-5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                        <Boxes className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="text-white font-semibold text-[15px] leading-none">InvenTrack</div>
                        <div className="text-slate-500 text-[10px] mt-0.5">Inventory Management</div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3">
                {navigation.map(({ section, items }) => (
                    <div key={section} className="mb-4">
                        <div className="px-4 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                            {section}
                        </div>
                        {items.map(({ label, href, icon: Icon }) => {
                            const active = isActive(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={onClose}
                                    className={`flex items-center gap-2.5 mx-2 px-3 py-2 text-sm rounded-lg transition-colors
                                        ${active
                                            ? 'bg-slate-800 text-white'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : ''}`} />
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
