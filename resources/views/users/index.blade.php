@extends('layouts.app')

@section('page', 'users.index')

@section('content')
<x-card>
    <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="card-title fw-bold fs-4 mb-0">Users</h5>
        <x-button tag="a" href="{{ route('users.create') }}" id="create-btn" class="d-none">Create User</x-button>
    </div>

    <div id="error-container"></div>

    <x-modal
        id="delete-modal"
        title="Confirm Delete"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
    />

    <div id="users-table">
        <p class="text-muted">Loading...</p>
    </div>

    <nav id="pagination" class="d-flex justify-content-center gap-2 mt-3"></nav>
</x-card>
@endsection
