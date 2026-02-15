@extends('layouts.app')

@section('page', 'auth.forgot-password')

@section('content')
<x-auth-card title="Forgot Password" description="Enter your email address and we'll send you a password reset link.">
    <form id="forgot-form" class="space-y-4">
        <x-form-input label="Email" type="email" id="email" :required="true" />
        <x-button class="w-full">Send Reset Link</x-button>
    </form>

    <x-slot:footer>
        <p><a href="{{ route('login') }}" class="text-blue-600 hover:underline">Back to Login</a></p>
    </x-slot:footer>
</x-auth-card>
@endsection
