import { isAuthenticated, getUser } from '../../services/auth';
import api from '../../api/client';
import { showErrors, showSuccess, escapeHtml } from '../../utils/ui';

let currentPage = 1;
let currentSearch = '';
let deleteUserId = null;
let deleteModal = null;
let searchTimeout = null;

export function init() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
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

    document.getElementById('users-table').addEventListener('input', function (e) {
        if (e.target.id === 'dt-search-input') {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = e.target.value.trim();
                loadUsers(1);
            }, 300);
        }
    });

    document.getElementById('pagination').addEventListener('click', function (e) {
        const pageBtn = e.target.closest('[data-page]');
        if (pageBtn) {
            loadUsers(parseInt(pageBtn.dataset.page));
        }
    });

    // Read initial state from URL params
    const params = new URLSearchParams(window.location.search);
    currentPage = parseInt(params.get('page')) || 1;
    currentSearch = params.get('search') || '';

    loadUsers(currentPage);
}

function updateUrl() {
    const params = new URLSearchParams();
    if (currentSearch) {
        params.set('search', currentSearch);
    }
    if (currentPage > 1) {
        params.set('page', currentPage);
    }
    const query = params.toString();
    const url = window.location.pathname + (query ? `?${query}` : '');
    window.history.replaceState(null, '', url);
}

async function loadUsers(page) {
    currentPage = page;
    updateUrl();

    try {
        const params = { page };
        if (currentSearch) {
            params.search = currentSearch;
        }

        const { data } = await api.get('/users', { params });
        const users = data.data;
        const meta = data.meta;
        const currentUser = getUser();

        const isAdmin = currentUser && currentUser.role === 'admin';

        const total = meta ? meta.total : users.length;

        let html = `
            <div class="d-flex align-items-center justify-content-between mb-3">
                <span style="font-size: 0.875rem; color: #6b7280;">Users (${total})</span>
                ${isAdmin ? '<a href="/users/create" class="btn btn-sm btn-primary">Create User</a>' : ''}
            </div>
            <div class="dt-container">
                <div class="dt-search">
                    <i class="bi bi-search dt-search-icon"></i>
                    <input type="text" id="dt-search-input" placeholder="Search users..." value="${escapeHtml(currentSearch)}" />
                </div>
                <div style="overflow-x: auto;">
                    <table class="dt-table">
                        <thead>
                            <tr class="dt-header">
                                <th><div class="dt-header-content"><span>Name</span></div></th>
                                <th><div class="dt-header-content"><span>Email</span></div></th>
                                <th><div class="dt-header-content"><span>Role</span></div></th>
                                <th><div class="dt-header-content"><span>Created</span></div></th>
                                ${currentUser && currentUser.role === 'admin' ? '<th><div class="dt-header-content"><span>Actions</span></div></th>' : ''}
                            </tr>
                        </thead>
                        <tbody>`;

        if (users.length === 0) {
            const colspan = currentUser && currentUser.role === 'admin' ? 5 : 4;
            html += `<tr class="dt-row"><td colspan="${colspan}" class="text-center dt-muted" style="padding: 2rem;">No users found.</td></tr>`;
        }

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

        // Restore focus to search input after re-render
        const searchInput = document.getElementById('dt-search-input');
        if (searchInput && currentSearch) {
            searchInput.focus();
            searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
        }

        if (meta && meta.last_page > 1) {
            let paginationHtml = '';
            for (let i = 1; i <= meta.last_page; i++) {
                paginationHtml += `<button data-page="${i}"
                    class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-outline-secondary'}">${i}</button>`;
            }
            document.getElementById('pagination').innerHTML = paginationHtml;
        } else {
            document.getElementById('pagination').innerHTML = '';
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
        await api.delete(`/users/${deleteUserId}`);
        deleteModal.hide();
        showSuccess('User deleted successfully.');
        loadUsers(currentPage);
    } catch (error) {
        deleteModal.hide();
        const data = error.response?.data;
        showErrors(data?.message || 'Failed to delete user.');
    }

    deleteUserId = null;
}
