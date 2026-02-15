@extends('layouts.app')

@section('page', 'dashboard')

@section('content')
<x-page-header :breadcrumbs="[['label' => 'Dashboard']]" />

<div class="page-body">
    <div id="dashboard-content" class="d-flex flex-column flex-grow-1">
        <p class="text-muted">Loading...</p>
    </div>
</div>
@endsection
