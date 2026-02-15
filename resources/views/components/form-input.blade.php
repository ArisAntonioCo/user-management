@props(['label', 'type' => 'text', 'id', 'required' => false, 'value' => null, 'minlength' => null])

<div class="mb-3">
    <label for="{{ $id }}" class="form-label">{{ $label }}</label>
    <input
        type="{{ $type }}"
        id="{{ $id }}"
        name="{{ $id }}"
        class="form-control"
        {{ $required ? 'required' : '' }}
        {{ $minlength ? "minlength=$minlength" : '' }}
        @if ($value) value="{{ $value }}" @endif
    >
</div>
