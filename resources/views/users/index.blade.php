@extends('layouts.app')

@section('page', 'users.index')

@section('content')
<x-card>
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Users</h1>
        <x-button tag="a" href="{{ route('users.create') }}" id="create-btn" class="hidden">Create User</x-button>
    </div>

    <div id="error-container"></div>

    <x-modal
        id="delete-modal"
        title="Confirm Delete"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        confirmAction="confirmDelete()"
        cancelAction="closeDeleteModal()"
    />

    <div id="users-table">
        <p class="text-gray-500">Loading...</p>
    </div>

    <div id="pagination" class="mt-4 flex justify-center gap-2"></div>
</x-card>
@endsection
