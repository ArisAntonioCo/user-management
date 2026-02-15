@extends('layouts.app')

@section('page', 'users.edit')

@push('body-attrs')
data-user-id="{{ $userId }}"
@endpush

@section('content')
<div class="row justify-content-center">
    <div class="col-lg-6">
        <x-card>
            <h5 class="card-title fw-bold fs-4 mb-3">Edit User</h5>

            <div id="error-container"></div>

            <form id="edit-user-form">
                <x-form-input label="Name" id="name" :required="true" />
                <x-form-input label="Email" type="email" id="email" :required="true" />
                <x-form-input label="Password (leave blank to keep current)" type="password" id="password" minlength="8" />
                <x-form-input label="Confirm Password" type="password" id="password_confirmation" />
                <x-form-select label="Role" id="role" :options="['user' => 'User', 'admin' => 'Admin']" wrapperId="role-field" />

                <div class="d-flex justify-content-between">
                    <x-button tag="a" href="{{ route('users.index') }}" variant="secondary">Cancel</x-button>
                    <x-button>Update User</x-button>
                </div>
            </form>
        </x-card>
    </div>
</div>
@endsection
