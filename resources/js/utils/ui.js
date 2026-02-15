import { isAuthenticated, getUser } from '../services/auth';

export function showErrors(errors, containerId = 'error-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    if (typeof errors === 'string') {
        container.innerHTML = `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">${errors}</div>`;
    } else if (typeof errors === 'object') {
        const messages = Object.values(errors).flat().join('<br>');
        container.innerHTML = `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">${messages}</div>`;
    }
}

export function showSuccess(message, containerId = 'error-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    container.innerHTML = `<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">${message}</div>`;
}

export function clearMessages(containerId = 'error-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
    }
}

export function showNav() {
    const nav = document.getElementById('app-nav');
    const userName = document.getElementById('nav-user-name');

    if (nav && isAuthenticated()) {
        nav.classList.remove('hidden');
        const user = getUser();
        if (user && userName) {
            userName.textContent = user.name;
        }
    }
}
