@props(['label', 'id', 'options' => [], 'wrapperId' => null])

<div class="mb-3" @if ($wrapperId) id="{{ $wrapperId }}" @endif>
    <label for="{{ $id }}" class="form-label">{{ $label }}</label>
    <select id="{{ $id }}" name="{{ $id }}" class="form-select">
        @foreach ($options as $value => $text)
            <option value="{{ $value }}">{{ $text }}</option>
        @endforeach
    </select>
</div>
