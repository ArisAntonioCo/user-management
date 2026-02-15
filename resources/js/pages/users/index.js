import { isAuthenticated, getUser } from '../../services/auth';
import { apiRequest } from '../../api/client';
import { showErrors, showSuccess, escapeHtml } from '../../utils/ui';

let currentPage = 1;
let deleteUserId = null;
let deleteModal = null;

export function init() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    const user = getUser();
    if (user && user.role === 'admin') {
        document.getElementById('create-btn').classList.remove('d-none');
    }

    deleteModal = new bootstrap.Modal(document.getElementById('delete-modal'));

    document.getElementById('delete-modal-confirm').addEventListener('click', confirmDelete);

    document.getElementById('users-table').addEventListener('click', function (e) {
        const deleteBtn = e.target.closest('[data-delete-user]');
        if (deleteBtn) {
            deleteUserId = parseInt(deleteBtn.dataset.deleteUser);
            deleteModal.show();
        }
    });

    document.getElementById('pagination').addEventListener('click', function (e) {
        const pageBtn = e.target.closest('[data-page]');
        if (pageBtn) {
            loadUsers(parseInt(pageBtn.dataset.page));
        }
    });

    loadUsers(1);
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
            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created</th>
                            ${currentUser && currentUser.role === 'admin' ? '<th>Actions</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>`;

        users.forEach(user => {
            html += `
                <tr>
                    <td>${user.id}</td>
                    <td>${escapeHtml(user.name)}</td>
                    <td class="text-muted">${escapeHtml(user.email)}</td>
                    <td>
                        <span class="badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}">${escapeHtml(user.role)}</span>
                    </td>
                    <td class="text-muted">${new Date(user.created_at).toLocaleDateString()}</td>`;

            if (currentUser && currentUser.role === 'admin') {
                html += `<td>
                    <a href="/users/${user.id}/edit" class="btn btn-sm btn-outline-primary me-1">Edit</a>`;
                if (user.id !== currentUser.id) {
                    html += `<button data-delete-user="${user.id}" class="btn btn-sm btn-outline-danger">Delete</button>`;
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
                paginationHtml += `<button data-page="${i}"
                    class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}">${i}</button>`;
            }
            document.getElementById('pagination').innerHTML = paginationHtml;
        }
    } catch (error) {
        document.getElementById('users-table').innerHTML = '<div class="alert alert-danger">Failed to load users.</div>';
    }
}

async function confirmDelete() {
    if (!deleteUserId) {
        return;
    }

    try {
        const response = await apiRequest(`/users/${deleteUserId}`, { method: 'DELETE' });

        if (response.status === 204 || response.ok) {
            deleteModal.hide();
            showSuccess('User deleted successfully.');
            loadUsers(currentPage);
        } else {
            const data = await response.json();
            deleteModal.hide();
            showErrors(data.message || 'Failed to delete user.');
        }
    } catch (error) {
        deleteModal.hide();
        showErrors('An unexpected error occurred.');
    }

    deleteUserId = null;
}
