@props(['label', 'type' => 'text', 'id', 'required' => false, 'value' => null, 'minlength' => null])

<div>
    <label for="{{ $id }}" class="block text-sm font-medium text-gray-700">{{ $label }}</label>
    <input
        type="{{ $type }}"
        id="{{ $id }}"
        name="{{ $id }}"
        {{ $required ? 'required' : '' }}
        {{ $minlength ? "minlength=$minlength" : '' }}
        @if ($value) value="{{ $value }}" @endif
        {{ $attributes->merge(['class' => 'mt-1 block w-full rounded border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2']) }}
    >
</div>
