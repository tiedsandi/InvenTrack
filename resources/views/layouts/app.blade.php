<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Asietex App')</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f0f2f5;
        }

        /* ── Sidebar ── */
        .sidebar {
            width: 250px;
            min-height: 100vh;
            background-color: #1a1a2e;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1045;
            padding-top: 0;
            transition: transform 0.25s ease;
            overflow-y: auto;
        }

        .sidebar-brand {
            background-color: #c0392b;
            padding: 18px 20px;
            color: white;
            font-weight: 700;
            font-size: 16px;
        }

        .sidebar-brand small {
            display: block;
            font-weight: 400;
            font-size: 11px;
            opacity: 0.8;
        }

        .sidebar .nav-link {
            color: rgba(255, 255, 255, 0.7);
            padding: 10px 20px;
            font-size: 14px;
            border-radius: 0;
            transition: all 0.2s;
        }

        .sidebar .nav-link:hover,
        .sidebar .nav-link.active {
            color: #fff;
            background-color: rgba(255, 255, 255, 0.1);
            border-left: 3px solid #c0392b;
        }

        .sidebar .nav-label {
            color: rgba(255, 255, 255, 0.4);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 16px 20px 6px;
        }

        /* ── Main Content ── */
        .main-content {
            margin-left: 250px;
            transition: margin-left 0.25s ease;
        }

        .topbar {
            background-color: #fff;
            border-bottom: 1px solid #dee2e6;
            padding: 12px 24px;
            position: sticky;
            top: 0;
            z-index: 99;
        }

        .page-content {
            padding: 24px;
        }

        /* ── Overlay (mobile) ── */
        .sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1044;
        }

        /* ── Mobile breakpoint ── */
        @media (max-width: 991.98px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.show {
                transform: translateX(0);
            }

            .sidebar-overlay.show {
                display: block;
            }

            .main-content {
                margin-left: 0;
            }

            .page-content {
                padding: 16px;
            }
        }
    </style>
</head>

<body>
    {{-- Sidebar Overlay (mobile) --}}
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    {{-- Sidebar --}}
    <div class="sidebar" id="sidebar">
        <div class="sidebar-brand">
            <i class="bi bi-building me-2"></i> ASIETEX
            <small>Sinar Indopratama</small>
        </div>
        <nav class="mt-2">
            <div class="nav-label">Utama</div>
            <a href="{{ route('dashboard') }}" class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}">
                <i class="bi bi-speedometer2 me-2"></i> Dashboard
            </a>

            <div class="nav-label">Master Data</div>
            <a href="{{ route('categories.index') }}"
                class="nav-link {{ request()->routeIs('categories.*') ? 'active' : '' }}">
                <i class="bi bi-tags me-2"></i> Kategori
            </a>
            <a href="{{ route('suppliers.index') }}"
                class="nav-link {{ request()->routeIs('suppliers.*') ? 'active' : '' }}">
                <i class="bi bi-truck me-2"></i> Supplier
            </a>
            <a href="{{ route('customers.index') }}"
                class="nav-link {{ request()->routeIs('customers.*') ? 'active' : '' }}">
                <i class="bi bi-people me-2"></i> Customer
            </a>
            <a href="{{ route('products.index') }}"
                class="nav-link {{ request()->routeIs('products.*') ? 'active' : '' }}">
                <i class="bi bi-box-seam me-2"></i> Produk
            </a>

            <div class="nav-label">Transaksi</div>
            <a href="{{ route('purchase-orders.index') }}"
                class="nav-link {{ request()->routeIs('purchase-orders.*') ? 'active' : '' }}">
                <i class="bi bi-cart-plus me-2"></i> Purchase Order
            </a>
            <a href="{{ route('sales-orders.index') }}"
                class="nav-link {{ request()->routeIs('sales-orders.*') ? 'active' : '' }}">
                <i class="bi bi-bag-check me-2"></i> Sales Order
            </a>
        </nav>
    </div>

    {{-- Main Content --}}
    <div class="main-content">
        {{-- Topbar --}}
        <div class="topbar d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-3">
                <button class="btn btn-sm btn-outline-secondary d-lg-none" onclick="toggleSidebar()">
                    <i class="bi bi-list fs-5"></i>
                </button>
                <h6 class="mb-0 fw-semibold text-muted">@yield('page-title', 'Dashboard')</h6>
            </div>
            <div class="dropdown">
                <a href="#" class="d-flex align-items-center text-decoration-none dropdown-toggle"
                    data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle me-2 fs-5"></i>
                    <span class="fw-semibold">{{ Auth::user()->name }}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="dropdown-item text-danger">
                                <i class="bi bi-box-arrow-right me-2"></i> Logout
                            </button>
                        </form>
                    </li>
                </ul>
            </div>
        </div>

        {{-- Page Content --}}
        <div class="page-content">
            @if (session('success'))
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="bi bi-check-circle me-2"></i>{{ session('success') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            @endif
            @if (session('error'))
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="bi bi-exclamation-circle me-2"></i>{{ session('error') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            @endif

            @yield('content')
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('show');
            document.getElementById('sidebarOverlay').classList.toggle('show');
        }
    </script>
    @yield('scripts')
</body>

</html>
