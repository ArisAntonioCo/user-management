@extends('layouts.app')

@section('page', 'users.index')

@section('content')
<x-page-header :breadcrumbs="[['label' => 'Users']]" />

<div class="page-body">
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
</div>
@endsection
