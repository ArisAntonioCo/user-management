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
    <nav id="app-sidebar" class="d-none app-sidebar">
        <div class="app-sidebar-header">
            <a href="{{ route('dashboard') }}">User Management</a>
        </div>

        <ul class="nav flex-column app-sidebar-nav">
            <x-sidebar-link href="{{ route('dashboard') }}" icon="house-door" id="nav-link-dashboard">Dashboard</x-sidebar-link>
            <x-sidebar-link href="{{ route('users.index') }}" icon="people" id="nav-link-users">Users</x-sidebar-link>
        </ul>

        <div class="app-sidebar-footer">
            <div class="app-sidebar-user">
                <div id="nav-user-avatar" class="app-sidebar-avatar"></div>
                <div class="app-sidebar-user-info">
                    <div id="nav-user-name" class="app-sidebar-user-name"></div>
                    <div id="nav-user-role" class="app-sidebar-user-role"></div>
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

    {{-- Main content area — JS controls the shell structure --}}
    <main id="main-content">
        @yield('content')
    </main>

</body>
</html>
