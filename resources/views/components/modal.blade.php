@props(['id', 'title', 'message', 'confirmText' => 'Confirm'])

<div id="{{ $id }}" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title fw-bold">{{ $title }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p class="text-muted">{{ $message }}</p>
            </div>
            <div class="modal-footer">
                <x-button variant="secondary" type="button" data-bs-dismiss="modal">Cancel</x-button>
                <x-button variant="danger" type="button" id="{{ $id }}-confirm">{{ $confirmText }}</x-button>
            </div>
        </div>
    </div>
</div>
