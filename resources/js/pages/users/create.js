import { isAuthenticated } from '../../services/auth';
import { apiRequest } from '../../api/client';
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
            const response = await apiRequest('/users', {
                method: 'POST',
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                window.location.href = '/users';
            } else {
                showErrors(result.errors || result.message);
            }
        } catch (error) {
            showErrors('An unexpected error occurred. Please try again.');
        }
    });
}
