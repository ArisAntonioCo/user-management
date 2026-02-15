@extends('layouts.app')

@section('page', 'auth.login')

@section('content')
<div class="flex items-center justify-center min-h-[80vh]">
    <div class="w-full max-w-md">
        <div class="bg-white rounded-lg shadow p-8">
            <h2 class="text-2xl font-bold text-center mb-6">Login</h2>

            <div id="error-container"></div>

            <form id="login-form" class="space-y-4">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" name="email" required
                        class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border">
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" id="password" name="password" required
                        class="mt-1 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border">
                </div>

                <button type="submit"
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                    Login
                </button>
            </form>

            <div class="mt-4 text-center text-sm space-y-2">
                <p><a href="{{ route('password.request') }}" class="text-blue-600 hover:underline">Forgot your password?</a></p>
                <p>Don't have an account? <a href="{{ route('register') }}" class="text-blue-600 hover:underline">Register</a></p>
            </div>
        </div>
    </div>
</div>
@endsection
