@props(['title' => null])

<div class="card">
    <div class="card-body">
        @if ($title)
            <h5 class="card-title fw-bold fs-4 mb-3">{{ $title }}</h5>
        @endif

        {{ $slot }}
    </div>
</div>
