import { isAuthenticated, getUser } from '../services/auth';

export function showErrors(errors, containerId = 'error-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    if (typeof errors === 'string') {
        container.innerHTML = `<div class="alert alert-danger">${errors}</div>`;
    } else if (typeof errors === 'object') {
        const messages = Object.values(errors).flat().join('<br>');
        container.innerHTML = `<div class="alert alert-danger">${messages}</div>`;
    }
}

export function showSuccess(message, containerId = 'error-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    container.innerHTML = `<div class="alert alert-success">${message}</div>`;
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
    const mainContent = document.getElementById('main-content');

    if (guestPages.includes(page)) {
        // Guest layout: centered card
        mainContent.classList.add('min-vh-100', 'd-flex', 'align-items-center', 'justify-content-center', 'py-5');
        return;
    }

    if (isAuthenticated()) {
        // Authenticated layout: show sidebar, offset content
        const sidebar = document.getElementById('app-sidebar');
        sidebar.classList.remove('d-none');
        mainContent.style.marginLeft = '250px';
        mainContent.classList.add('py-4', 'px-4');

        const user = getUser();
        if (user) {
            const nameEl = document.getElementById('nav-user-name');
            const roleEl = document.getElementById('nav-user-role');
            const avatarEl = document.getElementById('nav-user-avatar');

            if (nameEl) nameEl.textContent = user.name;
            if (roleEl) roleEl.textContent = user.role;
            if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
        }

        highlightActiveLink(page);
    }
}

function highlightActiveLink(page) {
    let activeLinkId = null;
    if (page === 'dashboard') {
        activeLinkId = 'nav-link-dashboard';
    } else if (page && page.startsWith('users')) {
        activeLinkId = 'nav-link-users';
    }

    if (activeLinkId) {
        const link = document.getElementById(activeLinkId);
        if (link) {
            link.classList.add('active', 'bg-primary', 'text-white');
        }
    }
}
