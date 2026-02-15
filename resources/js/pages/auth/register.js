import { isAuthenticated, setToken, setUser } from '../../services/auth';
import { publicRequest } from '../../api/client';
import { showErrors, clearMessages } from '../../utils/ui';

export function init() {
    if (isAuthenticated()) {
        window.location.href = '/dashboard';
        return;
    }

    document.getElementById('register-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            password_confirmation: document.getElementById('password_confirmation').value,
        };

        try {
            const response = await publicRequest('/register', data);
            const result = await response.json();

            if (response.ok) {
                setToken(result.token);
                setUser(result.user.data || result.user);
                window.location.href = '/dashboard';
            } else {
                showErrors(result.errors || result.message);
            }
        } catch (error) {
            showErrors('An unexpected error occurred. Please try again.');
        }
    });
}
