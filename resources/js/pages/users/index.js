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
            <div class="dt-container">
                <div class="dt-search">
                    <i class="bi bi-search dt-search-icon"></i>
                    <input type="text" id="dt-search-input" placeholder="Search users..." />
                </div>
                <div style="overflow-x: auto;">
                    <table class="dt-table">
                        <thead>
                            <tr class="dt-header">
                                <th><div class="dt-header-content"><span>Name</span><i class="bi bi-arrow-down-up dt-sort-icon"></i></div></th>
                                <th><div class="dt-header-content"><span>Email</span><i class="bi bi-arrow-down-up dt-sort-icon"></i></div></th>
                                <th><div class="dt-header-content"><span>Role</span></div></th>
                                <th><div class="dt-header-content"><span>Created</span><i class="bi bi-arrow-down-up dt-sort-icon"></i></div></th>
                                ${currentUser && currentUser.role === 'admin' ? '<th><div class="dt-header-content"><span>Actions</span></div></th>' : ''}
                            </tr>
                        </thead>
                        <tbody>`;

        users.forEach(user => {
            const initials = escapeHtml(user.name).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            html += `
                <tr class="dt-row">
                    <td>
                        <div class="dt-name-cell">
                            <div class="dt-avatar">${initials}</div>
                            <span class="dt-name">${escapeHtml(user.name)}</span>
                        </div>
                    </td>
                    <td class="dt-muted">${escapeHtml(user.email)}</td>
                    <td>
                        <span class="badge ${user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}">${escapeHtml(user.role)}</span>
                    </td>
                    <td class="dt-muted">${new Date(user.created_at).toLocaleDateString()}</td>`;

            if (currentUser && currentUser.role === 'admin') {
                html += `<td>
                    <a href="/users/${user.id}/edit" class="dt-action-btn dt-action-btn-edit me-1">Edit</a>`;
                if (user.id !== currentUser.id) {
                    html += `<button data-delete-user="${user.id}" class="dt-action-btn dt-action-btn-delete">Delete</button>`;
                }
                html += `</td>`;
            }

            html += `</tr>`;
        });

        html += `</tbody></table></div></div>`;
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
