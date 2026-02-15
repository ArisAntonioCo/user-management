@extends('layouts.app')

@section('page', 'auth.forgot-password')

@section('content')
<div style="width: 100%; max-width: 420px;" class="px-3">
    <x-auth-card title="Forgot Password" description="Enter your email address and we'll send you a password reset link.">
        <form id="forgot-form">
            <x-form-input label="Email" type="email" id="email" :required="true" />
            <x-button class="w-100">Send Reset Link</x-button>
        </form>

        <x-slot:footer>
            <p class="mb-0"><a href="{{ route('login') }}">Back to Login</a></p>
        </x-slot:footer>
    </x-auth-card>
</div>
@endsection
