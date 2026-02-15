import { isAuthenticated, setUser } from '../services/auth';
import api from '../api/client';
import { showLayout, escapeHtml } from '../utils/ui';

export async function init() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    try {
        const { data } = await api.get('/user');
        const user = data.data || data;

        setUser(user);
        showLayout();

        const buttonLabel = user.role === 'admin' ? 'Manage Users' : 'Show Users';

        document.getElementById('dashboard-content').innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center flex-grow-1">
                <h1 class="mb-3" style="font-size: 2rem; font-weight: 600;">Welcome back, ${escapeHtml(user.name)}</h1>
                <div class="d-flex gap-2 mb-3">
                    <span class="badge bg-secondary">${escapeHtml(user.email)}</span>
                    <span class="badge bg-primary text-capitalize">${escapeHtml(user.role)}</span>
                </div>
                <a href="/users" class="btn btn-sm btn-dark">${buttonLabel}</a>
            </div>
        `;
    } catch (error) {
        document.getElementById('dashboard-content').innerHTML =
            '<div class="alert alert-danger">Failed to load dashboard data.</div>';
    }
}
