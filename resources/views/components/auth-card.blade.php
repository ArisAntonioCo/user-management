@props(['title', 'description' => null])

<div class="bg-white rounded-lg shadow p-8">
    <h2 class="text-2xl font-bold text-center mb-6">{{ $title }}</h2>

    @if ($description)
        <p class="text-sm text-gray-600 mb-4 text-center">{{ $description }}</p>
    @endif

    <div id="error-container"></div>

    {{ $slot }}

    @if (isset($footer))
        <div class="mt-4 text-center text-sm">
            {{ $footer }}
        </div>
    @endif
</div>
