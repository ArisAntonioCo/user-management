@extends('layouts.app')

@section('page', 'auth.login')

@section('content')
<div style="width: 100%; max-width: 420px;" class="px-3">
    <x-auth-card title="Welcome back" description="Sign in to your account to continue.">
        <form id="login-form">
            <x-form-input label="Email" type="email" id="email" :required="true" />
            <x-form-input label="Password" type="password" id="password" :required="true" />
            <x-button class="w-100">Sign in</x-button>
        </form>

        <x-slot:footer>
            <p class="mb-1"><a href="{{ route('password.request') }}">Forgot your password?</a></p>
            <p class="mb-0">Don't have an account? <a href="{{ route('register') }}">Register</a></p>
        </x-slot:footer>
    </x-auth-card>
</div>
@endsection
