import { isAuthenticated, getUser } from '../../services/auth';
import { apiRequest } from '../../api/client';
import { showErrors, showSuccess } from '../../utils/ui';

let currentPage = 1;
let deleteUserId = null;

export function init() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    const user = getUser();
    if (user && user.role === 'admin') {
        document.getElementById('create-btn').classList.remove('hidden');
    }

    loadUsers(1);

    window.openDeleteModal = openDeleteModal;
    window.closeDeleteModal = closeDeleteModal;
    window.confirmDelete = confirmDelete;
    window.loadUsers = loadUsers;
}

async function loadUsers(page) {
    currentPage = page;

    try {
        const response = await apiRequest(`/users?page=${page}`);
        const data = await response.json();
        const users = data.data;
        const meta = data.meta;
        const currentUser = getUser();

        let html = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                            ${currentUser && currentUser.role === 'admin' ? '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>' : ''}
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">`;

        users.forEach(user => {
            html += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${user.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${user.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 py-1 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}">${user.role}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(user.created_at).toLocaleDateString()}</td>`;

            if (currentUser && currentUser.role === 'admin') {
                html += `<td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <a href="/users/${user.id}/edit" class="text-blue-600 hover:underline">Edit</a>`;
                if (user.id !== currentUser.id) {
                    html += `<button onclick="openDeleteModal(${user.id})" class="text-red-600 hover:underline">Delete</button>`;
                }
                html += `</td>`;
            }

            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
        document.getElementById('users-table').innerHTML = html;

        if (meta && meta.last_page > 1) {
            let paginationHtml = '';
            for (let i = 1; i <= meta.last_page; i++) {
                paginationHtml += `<button onclick="loadUsers(${i})"
                    class="px-3 py-1 rounded ${i === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}">${i}</button>`;
            }
            document.getElementById('pagination').innerHTML = paginationHtml;
        }
    } catch (error) {
        document.getElementById('users-table').innerHTML = '<p class="text-red-500">Failed to load users.</p>';
    }
}

function openDeleteModal(userId) {
    deleteUserId = userId;
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeDeleteModal() {
    deleteUserId = null;
    const modal = document.getElementById('delete-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

async function confirmDelete() {
    if (!deleteUserId) {
        return;
    }

    try {
        const response = await apiRequest(`/users/${deleteUserId}`, { method: 'DELETE' });

        if (response.status === 204 || response.ok) {
            closeDeleteModal();
            showSuccess('User deleted successfully.');
            loadUsers(currentPage);
        } else {
            const data = await response.json();
            closeDeleteModal();
            showErrors(data.message || 'Failed to delete user.');
        }
    } catch (error) {
        closeDeleteModal();
        showErrors('An unexpected error occurred.');
    }
}
