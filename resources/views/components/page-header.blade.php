@props(['breadcrumbs' => []])

<header class="d-flex align-items-center justify-content-between" style="height: 48px; padding: 0 1rem;">
    @if (count($breadcrumbs) > 0)
        <nav class="d-flex align-items-center" style="font-size: 0.875rem;">
            @foreach ($breadcrumbs as $i => $crumb)
                @if ($i > 0)
                    <span class="breadcrumb-separator">/</span>
                @endif

                @if ($i === count($breadcrumbs) - 1)
                    <span class="fw-medium text-dark">{{ $crumb['label'] }}</span>
                @else
                    <a href="{{ $crumb['url'] }}" class="text-muted text-decoration-none">{{ $crumb['label'] }}</a>
                @endif
            @endforeach
        </nav>
    @else
        <div></div>
    @endif

    @if (isset($actions))
        <div class="d-flex align-items-center gap-2">
            {{ $actions }}
        </div>
    @endif
</header>
