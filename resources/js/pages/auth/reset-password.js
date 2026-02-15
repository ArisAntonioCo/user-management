import { publicRequest } from '../../api/client';
import { showErrors, showSuccess, clearMessages } from '../../utils/ui';

export function init() {
    document.getElementById('reset-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        const data = {
            token: document.getElementById('token').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            password_confirmation: document.getElementById('password_confirmation').value,
        };

        try {
            const response = await publicRequest('/reset-password', data);
            const result = await response.json();

            if (response.ok) {
                showSuccess('Password reset successfully. Redirecting to login...');
                setTimeout(() => window.location.href = '/login', 2000);
            } else {
                showErrors(result.errors || result.message);
            }
        } catch (error) {
            showErrors('An unexpected error occurred. Please try again.');
        }
    });
}
