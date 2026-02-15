@extends('layouts.app')

@section('page', 'auth.login')

@section('content')
<x-auth-card title="Login">
    <form id="login-form" class="space-y-4">
        <x-form-input label="Email" type="email" id="email" :required="true" />
        <x-form-input label="Password" type="password" id="password" :required="true" />
        <x-button class="w-full">Login</x-button>
    </form>

    <x-slot:footer>
        <div class="space-y-2">
            <p><a href="{{ route('password.request') }}" class="text-blue-600 hover:underline">Forgot your password?</a></p>
            <p>Don't have an account? <a href="{{ route('register') }}" class="text-blue-600 hover:underline">Register</a></p>
        </div>
    </x-slot:footer>
</x-auth-card>
@endsection
