@props(['title', 'description' => null])

<div class="card shadow-sm">
    <div class="card-body p-4">
        <h4 class="card-title fw-bold text-center mb-4">{{ $title }}</h4>

        @if ($description)
            <p class="text-muted text-center small mb-3">{{ $description }}</p>
        @endif

        <div id="error-container"></div>

        {{ $slot }}

        @if (isset($footer))
            <div class="mt-3 text-center small">
                {{ $footer }}
            </div>
        @endif
    </div>
</div>
