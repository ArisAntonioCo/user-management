@props(['label', 'id', 'options' => [], 'wrapperId' => null])

<div @if ($wrapperId) id="{{ $wrapperId }}" @endif>
    <label for="{{ $id }}" class="block text-sm font-medium text-gray-700">{{ $label }}</label>
    <select
        id="{{ $id }}"
        name="{{ $id }}"
        class="mt-1 block w-full rounded border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2"
    >
        @foreach ($options as $value => $text)
            <option value="{{ $value }}">{{ $text }}</option>
        @endforeach
    </select>
</div>
