@props(['variant' => 'primary', 'type' => 'submit', 'tag' => 'button', 'href' => null])

@php
    $classes = match ($variant) {
        'primary' => 'bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition',
        'danger' => 'bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition',
        'secondary' => 'px-4 py-2 border rounded hover:bg-gray-50 transition',
    };
@endphp

@if ($tag === 'a')
    <a href="{{ $href }}" {{ $attributes->merge(['class' => $classes]) }}>{{ $slot }}</a>
@else
    <button type="{{ $type }}" {{ $attributes->merge(['class' => $classes]) }}>{{ $slot }}</button>
@endif
