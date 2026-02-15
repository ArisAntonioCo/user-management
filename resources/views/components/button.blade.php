@props(['variant' => 'primary', 'type' => 'submit', 'tag' => 'button', 'href' => null])

@php
    $classes = match ($variant) {
        'primary' => 'btn btn-primary',
        'danger' => 'btn btn-danger',
        'secondary' => 'btn btn-outline-secondary',
    };
@endphp

@if ($tag === 'a')
    <a href="{{ $href }}" {{ $attributes->merge(['class' => $classes]) }}>{{ $slot }}</a>
@else
    <button type="{{ $type }}" {{ $attributes->merge(['class' => $classes]) }}>{{ $slot }}</button>
@endif
