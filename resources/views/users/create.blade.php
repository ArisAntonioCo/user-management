@extends('layouts.app')

@section('page', 'users.create')

@section('content')
<x-page-header :breadcrumbs="[['label' => 'Users', 'url' => route('users.index')], ['label' => 'Create User']]" />

<div class="page-body">
    <div class="row justify-content-center">
        <div class="col-lg-6">
            <x-card>
                <div id="error-container"></div>

                <form id="create-user-form">
                    <x-form-input label="Name" id="name" :required="true" />
                    <x-form-input label="Email" type="email" id="email" :required="true" />
                    <x-form-input label="Password" type="password" id="password" :required="true" minlength="8" />
                    <x-form-input label="Confirm Password" type="password" id="password_confirmation" :required="true" />
                    <x-form-select label="Role" id="role" :options="['user' => 'User', 'admin' => 'Admin']" />

                    <div class="d-flex justify-content-between">
                        <x-button tag="a" href="{{ route('users.index') }}" variant="secondary">Cancel</x-button>
                        <x-button>Create User</x-button>
                    </div>
                </form>
            </x-card>
        </div>
    </div>
</div>
@endsection
