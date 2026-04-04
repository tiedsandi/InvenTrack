<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Asietex App')</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>

<body class="bg-gray-100 font-sans antialiased">

    {{-- Sidebar Overlay (mobile) --}}
    <div id="sidebarOverlay" class="fixed inset-0 bg-black/50 z-40 hidden lg:hidden" onclick="toggleSidebar()"></div>

    {{-- Sidebar --}}
    <aside id="sidebar"
        class="fixed top-0 left-0 z-50 h-full w-64 bg-[#1a1a2e] flex flex-col
               -translate-x-full lg:translate-x-0 transition-transform duration-250">

        {{-- Brand --}}
        <div class="bg-[#c0392b] px-5 py-[18px]">
            <div class="text-white font-bold text-base flex items-center gap-2">
                <i data-lucide="building-2" class="w-4 h-4"></i>
                InvenTrack
            </div>
            <div class="text-white/80 text-[11px] font-normal">Inventory Management</div>
        </div>

        {{-- Nav --}}
        <nav class="flex-1 overflow-y-auto mt-2 pb-6">
            <div class="px-5 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Utama</div>
            <a href="{{ route('dashboard') }}"
                class="flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors
                       {{ request()->routeIs('dashboard') ? 'text-white bg-white/10 border-l-[3px] border-[#c0392b]' : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-l-[3px] hover:border-[#c0392b]' }}">
                <i data-lucide="layout-dashboard" class="w-4 h-4 shrink-0"></i>
                Dashboard
            </a>

            <div class="px-5 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Master Data
            </div>
            <a href="{{ route('categories.index') }}"
                class="flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors
                       {{ request()->routeIs('categories.*') ? 'text-white bg-white/10 border-l-[3px] border-[#c0392b]' : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-l-[3px] hover:border-[#c0392b]' }}">
                <i data-lucide="tag" class="w-4 h-4 shrink-0"></i>
                Kategori
            </a>
            <a href="{{ route('suppliers.index') }}"
                class="flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors
                       {{ request()->routeIs('suppliers.*') ? 'text-white bg-white/10 border-l-[3px] border-[#c0392b]' : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-l-[3px] hover:border-[#c0392b]' }}">
                <i data-lucide="truck" class="w-4 h-4 shrink-0"></i>
                Supplier
            </a>
            <a href="{{ route('customers.index') }}"
                class="flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors
                       {{ request()->routeIs('customers.*') ? 'text-white bg-white/10 border-l-[3px] border-[#c0392b]' : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-l-[3px] hover:border-[#c0392b]' }}">
                <i data-lucide="users" class="w-4 h-4 shrink-0"></i>
                Customer
            </a>
            <a href="{{ route('products.index') }}"
                class="flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors
                       {{ request()->routeIs('products.*') ? 'text-white bg-white/10 border-l-[3px] border-[#c0392b]' : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-l-[3px] hover:border-[#c0392b]' }}">
                <i data-lucide="package" class="w-4 h-4 shrink-0"></i>
                Produk
            </a>

            <div class="px-5 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/40">Transaksi
            </div>
            <a href="{{ route('purchase-orders.index') }}"
                class="flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors
                       {{ request()->routeIs('purchase-orders.*') ? 'text-white bg-white/10 border-l-[3px] border-[#c0392b]' : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-l-[3px] hover:border-[#c0392b]' }}">
                <i data-lucide="shopping-cart" class="w-4 h-4 shrink-0"></i>
                Purchase Order
            </a>
            <a href="{{ route('sales-orders.index') }}"
                class="flex items-center gap-2.5 px-5 py-2.5 text-sm transition-colors
                       {{ request()->routeIs('sales-orders.*') ? 'text-white bg-white/10 border-l-[3px] border-[#c0392b]' : 'text-white/70 hover:text-white hover:bg-white/10 hover:border-l-[3px] hover:border-[#c0392b]' }}">
                <i data-lucide="shopping-bag" class="w-4 h-4 shrink-0"></i>
                Sales Order
            </a>
        </nav>
    </aside>

    {{-- Main Content --}}
    <div class="lg:ml-64 min-h-screen flex flex-col">

        {{-- Topbar --}}
        <header class="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-30 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button onclick="toggleSidebar()" class="lg:hidden p-1.5 rounded text-gray-500 hover:bg-gray-100">
                    <i data-lucide="menu" class="w-5 h-5"></i>
                </button>
                <h6 class="text-sm font-semibold text-gray-500">@yield('page-title', 'Dashboard')</h6>
            </div>
            <div class="relative" x-data="{ open: false }">
                <button onclick="toggleDropdown()"
                    class="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900">
                    <i data-lucide="circle-user" class="w-6 h-6 text-gray-400"></i>
                    {{ Auth::user()->name }}
                    <i data-lucide="chevron-down" class="w-4 h-4 text-gray-400"></i>
                </button>
                <div id="userDropdown"
                    class="hidden absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit"
                            class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2">
                            <i data-lucide="log-out" class="w-4 h-4"></i>
                            Logout
                        </button>
                    </form>
                </div>
            </div>
        </header>

        {{-- Page Content --}}
        <main class="p-6 flex-1">
            @if (session('success'))
                <div
                    class="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    <i data-lucide="circle-check" class="w-4 h-4 shrink-0"></i>
                    {{ session('success') }}
                </div>
            @endif
            @if (session('error'))
                <div
                    class="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <i data-lucide="circle-x" class="w-4 h-4 shrink-0"></i>
                    {{ session('error') }}
                </div>
            @endif

            @yield('content')
        </main>
    </div>

    <script src="https://unpkg.com/lucide@latest"></script>
    <script>
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebarOverlay');
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        }

        function toggleDropdown() {
            document.getElementById('userDropdown').classList.toggle('hidden');
        }
        document.addEventListener('click', function(e) {
            const dropdown = document.getElementById('userDropdown');
            if (!e.target.closest('[onclick="toggleDropdown()"]') && !dropdown.classList.contains('hidden')) {
                dropdown.classList.add('hidden');
            }
        });
    </script>
    @yield('scripts')
    <script>
        lucide.createIcons();
    </script>
</body>

</html>
