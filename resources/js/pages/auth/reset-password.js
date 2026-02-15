import api from '../../api/client';
import { showErrors, showSuccess, clearMessages } from '../../utils/ui';

export function init() {
    document.getElementById('reset-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        try {
            await api.post('/reset-password', {
                token: document.getElementById('token').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                password_confirmation: document.getElementById('password_confirmation').value,
            });

            showSuccess('Password reset successfully. Redirecting to login...');
            setTimeout(() => window.location.href = '/login', 2000);
        } catch (error) {
            const data = error.response?.data;
            showErrors(data?.errors || data?.message || 'An unexpected error occurred. Please try again.');
        }
    });
}
