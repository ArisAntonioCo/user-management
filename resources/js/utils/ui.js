import { isAuthenticated, getUser } from '../services/auth';

export function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

export function showErrors(errors, containerId = 'error-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    if (typeof errors === 'string') {
        container.innerHTML = `<div class="alert alert-danger">${escapeHtml(errors)}</div>`;
    } else if (typeof errors === 'object') {
        const messages = Object.values(errors).flat().map(m => escapeHtml(m)).join('<br>');
        container.innerHTML = `<div class="alert alert-danger">${messages}</div>`;
    }
}

export function showSuccess(message, containerId = 'error-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    container.innerHTML = `<div class="alert alert-success">${escapeHtml(message)}</div>`;
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
        // Authenticated layout: app shell with floating card
        const sidebar = document.getElementById('app-sidebar');
        sidebar.classList.remove('d-none');

        // Wrap main in the app-shell structure
        document.body.classList.add('app-shell');

        // Create the inset wrapper around main
        const inset = document.createElement('div');
        inset.className = 'app-inset';
        mainContent.parentNode.insertBefore(inset, mainContent);
        inset.appendChild(mainContent);
        mainContent.classList.add('app-main');

        // Show mobile toggle on small screens
        const toggle = document.getElementById('sidebar-toggle');
        if (toggle && window.innerWidth < 768) {
            toggle.classList.remove('d-none');
        }

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
            link.classList.add('active');
        }
    }
}
