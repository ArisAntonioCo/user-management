@props(['title' => null])

<div {{ $attributes->merge(['class' => 'border rounded bg-white']) }}>
    <div class="p-3">
        @if ($title)
            <h5 class="fw-medium fs-5 mb-3">{{ $title }}</h5>
        @endif

        {{ $slot }}
    </div>
</div>
