@props(['title' => null])

<div class="bg-white rounded-lg shadow p-6">
    @if ($title)
        <h1 class="text-2xl font-bold mb-4">{{ $title }}</h1>
    @endif

    {{ $slot }}
</div>
