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
            <div class="row g-3">
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="text-primary text-uppercase small fw-semibold">Welcome</h6>
                            <p class="fs-4 fw-bold mb-0">${escapeHtml(user.name)}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="text-success text-uppercase small fw-semibold">Email</h6>
                            <p class="fs-5 mb-0">${escapeHtml(user.email)}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="text-purple text-uppercase small fw-semibold">Role</h6>
                            <p class="fs-5 mb-0 text-capitalize">${escapeHtml(user.role)}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-4">
                <a href="/users" class="btn btn-primary">Manage Users</a>
            </div>
        `;
    } catch (error) {
        document.getElementById('dashboard-content').innerHTML =
            '<div class="alert alert-danger">Failed to load dashboard data.</div>';
    }
}
