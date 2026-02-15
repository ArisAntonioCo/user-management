import api from '../../api/client';
import { showErrors, showSuccess, clearMessages } from '../../utils/ui';

export function init() {
    document.getElementById('forgot-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        const email = document.getElementById('email').value;

        try {
            const { data } = await api.post('/forgot-password', { email });
            showSuccess(data.message || 'Password reset link sent to your email.');
        } catch (error) {
            const data = error.response?.data;
            showErrors(data?.errors || data?.message || 'An unexpected error occurred. Please try again.');
        }
    });
}
