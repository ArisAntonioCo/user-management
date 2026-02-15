@extends('layouts.app')

@section('page', 'users.create')

@section('content')
<div class="max-w-lg mx-auto">
    <x-card>
        <h2 class="text-2xl font-bold mb-6">Create User</h2>

        <div id="error-container"></div>

        <form id="create-user-form" class="space-y-4">
            <x-form-input label="Name" id="name" :required="true" />
            <x-form-input label="Email" type="email" id="email" :required="true" />
            <x-form-input label="Password" type="password" id="password" :required="true" minlength="8" />
            <x-form-input label="Confirm Password" type="password" id="password_confirmation" :required="true" />
            <x-form-select label="Role" id="role" :options="['user' => 'User', 'admin' => 'Admin']" />

            <div class="flex justify-between">
                <x-button tag="a" href="{{ route('users.index') }}" variant="secondary">Cancel</x-button>
                <x-button>Create User</x-button>
            </div>
        </form>
    </x-card>
</div>
@endsection
