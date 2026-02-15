@extends('layouts.app')

@section('page', 'auth.register')

@section('content')
<x-auth-card title="Register">
    <form id="register-form" class="space-y-4">
        <x-form-input label="Name" id="name" :required="true" />
        <x-form-input label="Email" type="email" id="email" :required="true" />
        <x-form-input label="Password" type="password" id="password" :required="true" minlength="8" />
        <x-form-input label="Confirm Password" type="password" id="password_confirmation" :required="true" />
        <x-button class="w-full">Register</x-button>
    </form>

    <x-slot:footer>
        <p>Already have an account? <a href="{{ route('login') }}" class="text-blue-600 hover:underline">Login</a></p>
    </x-slot:footer>
</x-auth-card>
@endsection
