@props(['href', 'icon', 'id' => null])

<li class="nav-item">
    <a href="{{ $href }}"
       @if ($id) id="{{ $id }}" @endif
       class="sidebar-link nav-link rounded d-flex align-items-center gap-2">
        <i class="bi bi-{{ $icon }}" style="font-size: 16px;"></i>
        <span>{{ $slot }}</span>
    </a>
</li>
