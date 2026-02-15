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

window.handleLogout = async function () {
    try {
        await apiRequest('/logout', { method: 'POST' });
    } catch (e) {
        // Ignore errors
    }
    removeToken();
    window.location.href = '/login';
};

document.addEventListener('DOMContentLoaded', function () {
    showLayout();

    const page = document.body.dataset.page;
    if (page && pages[page]) {
        pages[page].init();
    }
});
