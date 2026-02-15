@extends('layouts.app')

@section('page', 'auth.reset-password')

@section('content')
<x-auth-card title="Reset Password">
    <form id="reset-form" class="space-y-4">
        <input type="hidden" id="token" value="{{ $token ?? '' }}">
        <x-form-input label="Email" type="email" id="email" :required="true" :value="$email ?? ''" />
        <x-form-input label="New Password" type="password" id="password" :required="true" minlength="8" />
        <x-form-input label="Confirm Password" type="password" id="password_confirmation" :required="true" />
        <x-button class="w-full">Reset Password</x-button>
    </form>
</x-auth-card>
@endsection
