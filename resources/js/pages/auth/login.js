import { isAuthenticated, setToken, setUser } from '../../services/auth';
import api from '../../api/client';
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
            const { data } = await api.post('/login', { email, password });
            setToken(data.token);
            setUser(data.user.data || data.user);
            window.location.href = '/dashboard';
        } catch (error) {
            const data = error.response?.data;
            showErrors(data?.errors || data?.message || 'An unexpected error occurred. Please try again.');
        }
    });
}
