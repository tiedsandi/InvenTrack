import { Link, usePage } from '@inertiajs/react';
import {
    Building2,
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
            className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#1a1a2e] flex flex-col
                transition-transform duration-250
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        >
            {/* Brand */}
            <div className="bg-[#c0392b] px-5 py-[18px]">
                <div className="text-white font-bold text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    InvenTrack
                </div>
                <div className="text-white/80 text-[11px] font-normal">Inventory Management</div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto mt-2 pb-6">
                {navigation.map(({ section, items }) => (
                    <div key={section}>
                        <div className="px-5 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">
                            {section}
                        </div>
                        {items.map(({ label, href, icon: Icon }) => {
                            const active = isActive(href);
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={onClose}
                                    className={`flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors
                                        ${active
                                            ? 'text-white bg-white/10 border-l-[3px] border-[#c0392b]'
                                            : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-l-[3px] hover:border-[#c0392b]'
                                        }`}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
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
