@props(['id', 'title', 'message', 'confirmText' => 'Confirm', 'confirmAction', 'cancelAction'])

<div id="{{ $id }}" class="fixed inset-0 bg-black/50 items-center justify-center z-50 hidden">
    <div class="bg-white rounded-lg p-6 max-w-sm mx-auto">
        <h3 class="text-lg font-bold mb-2">{{ $title }}</h3>
        <p class="text-gray-600 mb-4">{{ $message }}</p>
        <div class="flex justify-end gap-3">
            <x-button variant="secondary" type="button" onclick="{{ $cancelAction }}">Cancel</x-button>
            <x-button variant="danger" type="button" onclick="{{ $confirmAction }}">{{ $confirmText }}</x-button>
        </div>
    </div>
</div>
