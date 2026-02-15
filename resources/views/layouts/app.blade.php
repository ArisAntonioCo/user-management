<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'User Management') }}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body data-page="@yield('page')" @stack('body-attrs')>
    {{-- Sidebar (hidden by default, shown by JS for authenticated pages) --}}
    <nav id="app-sidebar" class="d-none d-flex flex-column bg-white border-end position-fixed top-0 start-0 vh-100" style="width: 250px; z-index: 1030;">
        <div class="d-flex align-items-center px-3 border-bottom" style="height: 56px;">
            <a href="{{ route('dashboard') }}" class="fw-bold text-dark text-decoration-none fs-5">User Management</a>
        </div>

        <ul class="nav flex-column p-3 flex-grow-1">
            <li class="nav-item">
                <a href="{{ route('dashboard') }}" id="nav-link-dashboard" class="nav-link rounded d-flex align-items-center gap-2">
                    <i class="bi bi-house-door"></i> Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a href="{{ route('users.index') }}" id="nav-link-users" class="nav-link rounded d-flex align-items-center gap-2">
                    <i class="bi bi-people"></i> Users
                </a>
            </li>
        </ul>

        <div class="border-top p-3">
            <div class="d-flex align-items-center gap-2">
                <div id="nav-user-avatar" class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style="width: 36px; height: 36px; font-size: 14px;"></div>
                <div class="flex-grow-1 overflow-hidden">
                    <div id="nav-user-name" class="fw-medium small text-truncate"></div>
                    <div id="nav-user-role" class="text-muted text-capitalize" style="font-size: 12px;"></div>
                </div>
                <button id="logout-btn" class="btn btn-sm btn-outline-danger" title="Logout">
                    <i class="bi bi-box-arrow-right"></i>
                </button>
            </div>
        </div>
    </nav>

    {{-- Mobile Toggle --}}
    <button id="sidebar-toggle" class="btn btn-light shadow-sm position-fixed d-none" style="top: 10px; left: 10px; z-index: 1040;">
        <i class="bi bi-list"></i>
    </button>

    {{-- Mobile Overlay --}}
    <div id="sidebar-overlay" class="position-fixed top-0 start-0 w-100 vh-100 d-none" style="background: rgba(0,0,0,0.5); z-index: 1020;"></div>

    {{-- Single content area — JS controls the styling --}}
    <main id="main-content">
        @yield('content')
    </main>

</body>
</html>
