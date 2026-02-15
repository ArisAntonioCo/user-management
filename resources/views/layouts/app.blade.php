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
    {{-- Navigation --}}
    <nav id="app-nav" class="bg-white shadow hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center space-x-8">
                    <a href="{{ route('dashboard') }}" class="text-xl font-bold text-gray-800">User Management</a>
                    <a href="{{ route('dashboard') }}" class="text-gray-600 hover:text-gray-900">Dashboard</a>
                    <a href="{{ route('users.index') }}" class="text-gray-600 hover:text-gray-900">Users</a>
                </div>
                <div class="flex items-center space-x-4">
                    <span id="nav-user-name" class="text-sm text-gray-600"></span>
                    <button onclick="handleLogout()" class="text-sm text-red-600 hover:text-red-800">Logout</button>
                </div>
            </div>
        </div>
    </nav>

    {{-- Main Content --}}
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        @yield('content')
    </main>
</body>
</html>
