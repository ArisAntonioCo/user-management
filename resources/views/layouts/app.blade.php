<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'User Management') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-100 min-h-screen" data-page="@yield('page')" @stack('body-attrs')>
    {{-- Sidebar Layout (shown when authenticated) --}}
    <div id="app-layout" class="hidden">
        {{-- Sidebar --}}
        <aside id="app-sidebar" class="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-30 -translate-x-full lg:translate-x-0 transition-transform">
            {{-- Logo --}}
            <div class="flex items-center h-16 px-6 border-b border-gray-200">
                <a href="{{ route('dashboard') }}" class="text-lg font-bold text-gray-800">User Management</a>
            </div>

            {{-- Navigation Links --}}
            <nav class="flex-1 px-4 py-6 flex flex-col gap-1">
                <a href="{{ route('dashboard') }}" id="nav-link-dashboard"
                    class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                    Dashboard
                </a>
                <a href="{{ route('users.index') }}" id="nav-link-users"
                    class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    Users
                </a>
            </nav>

            {{-- User Info & Logout --}}
            <div class="border-t border-gray-200 px-4 py-4">
                <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-600 text-sm font-bold" id="nav-user-avatar"></div>
                    <div class="flex-1 min-w-0">
                        <p id="nav-user-name" class="text-sm font-medium text-gray-800 truncate"></p>
                        <p id="nav-user-role" class="text-xs text-gray-500 capitalize"></p>
                    </div>
                    <button onclick="handleLogout()" class="text-gray-400 hover:text-red-600 transition" title="Logout">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                    </button>
                </div>
            </div>
        </aside>

        {{-- Mobile Sidebar Toggle --}}
        <button id="sidebar-toggle" class="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-md lg:hidden hidden" onclick="toggleSidebar()">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
        </button>

        {{-- Mobile Overlay --}}
        <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-20 hidden lg:hidden" onclick="toggleSidebar()"></div>

        {{-- Main Content Area --}}
        <main class="lg:ml-64 min-h-screen">
            <div class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                @yield('content')
            </div>
        </main>
    </div>

    {{-- Guest Layout (login, register, etc.) --}}
    <main id="guest-layout" class="hidden">
        <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="w-full max-w-md">
                @yield('content')
            </div>
        </div>
    </main>

    <script>
        function toggleSidebar() {
            const sidebar = document.getElementById('app-sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        }
    </script>
</body>
</html>
