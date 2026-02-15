@extends('layouts.app')

@section('page', 'dashboard')

@section('content')
<x-page-header :breadcrumbs="[['label' => 'Dashboard']]" />

<div class="p-3">
    <div id="dashboard-content">
        <p class="text-muted">Loading...</p>
    </div>
</div>
@endsection
