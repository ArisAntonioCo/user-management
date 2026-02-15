import { isAuthenticated } from '../../services/auth';
import api from '../../api/client';
import { showErrors, clearMessages } from '../../utils/ui';

export function init() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    document.getElementById('create-user-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            password_confirmation: document.getElementById('password_confirmation').value,
            role: document.getElementById('role').value,
        };

        try {
            await api.post('/users', data);
            window.location.href = '/users';
        } catch (error) {
            const result = error.response?.data;
            showErrors(result?.errors || result?.message || 'An unexpected error occurred. Please try again.');
        }
    });
}
