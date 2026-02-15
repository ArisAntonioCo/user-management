import { publicRequest } from '../../api/client';
import { showErrors, showSuccess, clearMessages } from '../../utils/ui';

export function init() {
    document.getElementById('forgot-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        const email = document.getElementById('email').value;

        try {
            const response = await publicRequest('/forgot-password', { email });
            const data = await response.json();

            if (response.ok) {
                showSuccess(data.message || 'Password reset link sent to your email.');
            } else {
                showErrors(data.errors || data.message);
            }
        } catch (error) {
            showErrors('An unexpected error occurred. Please try again.');
        }
    });
}
