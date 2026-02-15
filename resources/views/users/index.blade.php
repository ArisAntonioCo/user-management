@extends('layouts.app')

@section('page', 'users.index')

@section('content')
<div class="bg-white rounded-lg shadow p-6">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Users</h1>
        <a href="{{ route('users.create') }}" id="create-btn"
            class="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition hidden">
            Create User
        </a>
    </div>

    <div id="error-container"></div>

    {{-- Delete Confirmation Modal --}}
    <div id="delete-modal" class="fixed inset-0 bg-black/50 items-center justify-center z-50 hidden">
        <div class="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 class="text-lg font-bold mb-2">Confirm Delete</h3>
            <p class="text-gray-600 mb-4">Are you sure you want to delete this user? This action cannot be undone.</p>
            <div class="flex justify-end space-x-3">
                <button onclick="closeDeleteModal()" class="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button onclick="confirmDelete()" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>

    <div id="users-table">
        <p class="text-gray-500">Loading...</p>
    </div>

    <div id="pagination" class="mt-4 flex justify-center space-x-2"></div>
</div>
@endsection
