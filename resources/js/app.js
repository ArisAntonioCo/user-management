import './bootstrap';
import { isAuthenticated, getUser, removeToken } from './services/auth';
import { apiRequest } from './api/client';
import { showLayout } from './utils/ui';

import * as loginPage from './pages/auth/login';
import * as registerPage from './pages/auth/register';
import * as forgotPasswordPage from './pages/auth/forgot-password';
import * as resetPasswordPage from './pages/auth/reset-password';
import * as dashboardPage from './pages/dashboard';
import * as usersIndexPage from './pages/users/index';
import * as usersCreatePage from './pages/users/create';
import * as usersEditPage from './pages/users/edit';

const pages = {
    'auth.login': loginPage,
    'auth.register': registerPage,
    'auth.forgot-password': forgotPasswordPage,
    'auth.reset-password': resetPasswordPage,
    'dashboard': dashboardPage,
    'users.index': usersIndexPage,
    'users.create': usersCreatePage,
    'users.edit': usersEditPage,
};

function toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isHidden = sidebar.style.transform === 'translateX(-100%)';
    sidebar.style.transform = isHidden ? 'translateX(0)' : 'translateX(-100%)';
    overlay.classList.toggle('d-none');
}

document.addEventListener('DOMContentLoaded', function () {
    showLayout();

    const page = document.body.dataset.page;
    if (page && pages[page]) {
        pages[page].init();
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            try {
                await apiRequest('/logout', { method: 'POST' });
            } catch (e) {
                // Ignore errors
            }
            removeToken();
            window.location.href = '/login';
        });
    }

    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    const sidebarOverlay = document.getElementById('sidebar-overlay');
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }
});
