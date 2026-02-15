import { isAuthenticated, setUser } from '../services/auth';
import { apiRequest } from '../api/client';
import { showLayout, escapeHtml } from '../utils/ui';

export async function init() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await apiRequest('/user');
        const data = await response.json();
        const user = data.data || data;

        setUser(user);
        showLayout();

        document.getElementById('dashboard-content').innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center" style="min-height: calc(100vh - 200px);">
                <h1 style="font-size: 2rem; font-weight: 600; margin-bottom: 1rem;">Welcome back, ${escapeHtml(user.name)}</h1>
                <div class="d-flex gap-2 mb-3">
                    <span class="badge bg-secondary">${escapeHtml(user.email)}</span>
                    <span class="badge bg-primary text-capitalize">${escapeHtml(user.role)}</span>
                </div>
                <a href="/users" class="btn btn-sm btn-dark">${user.role === 'admin' ? 'Manage Users' : 'Show Users'}</a>
            </div>
        `;
    } catch (error) {
        document.getElementById('dashboard-content').innerHTML =
            '<div class="alert alert-danger">Failed to load dashboard data.</div>';
    }
}
