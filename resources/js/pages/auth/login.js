import { isAuthenticated, setToken, setUser } from '../../services/auth';
import { publicRequest } from '../../api/client';
import { showErrors, clearMessages } from '../../utils/ui';

export function init() {
    if (isAuthenticated()) {
        window.location.href = '/dashboard';
        return;
    }

    document.getElementById('login-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await publicRequest('/login', { email, password });
            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
                setUser(data.user.data || data.user);
                window.location.href = '/dashboard';
            } else {
                showErrors(data.errors || data.message);
            }
        } catch (error) {
            showErrors('An unexpected error occurred. Please try again.');
        }
    });
}
