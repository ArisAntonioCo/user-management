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

export function showLayout() {
    const page = document.body.dataset.page;
    const guestPages = ['auth.login', 'auth.register', 'auth.forgot-password', 'auth.reset-password'];

    if (guestPages.includes(page)) {
        document.getElementById('guest-layout').classList.remove('hidden');
        return;
    }

    if (isAuthenticated()) {
        const layout = document.getElementById('app-layout');
        layout.classList.remove('hidden');

        const user = getUser();
        if (user) {
            const nameEl = document.getElementById('nav-user-name');
            const roleEl = document.getElementById('nav-user-role');
            const avatarEl = document.getElementById('nav-user-avatar');

            if (nameEl) nameEl.textContent = user.name;
            if (roleEl) roleEl.textContent = user.role;
            if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
        }

        // Show mobile toggle
        document.getElementById('sidebar-toggle').classList.remove('hidden');

        // Highlight active sidebar link
        highlightActiveLink(page);
    }
}

function highlightActiveLink(page) {
    const activeClasses = ['bg-blue-50', 'text-blue-700'];
    const inactiveClasses = ['text-gray-600', 'hover:bg-gray-50', 'hover:text-gray-900'];

    let activeLinkId = null;
    if (page === 'dashboard') {
        activeLinkId = 'nav-link-dashboard';
    } else if (page && page.startsWith('users')) {
        activeLinkId = 'nav-link-users';
    }

    if (activeLinkId) {
        const link = document.getElementById(activeLinkId);
        if (link) {
            inactiveClasses.forEach(cls => link.classList.remove(cls));
            activeClasses.forEach(cls => link.classList.add(cls));
        }
    }
}
