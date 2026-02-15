import { isAuthenticated, setToken, setUser } from '../../services/auth';
import api from '../../api/client';
import { showErrors, clearMessages } from '../../utils/ui';

export function init() {
    if (isAuthenticated()) {
        window.location.href = '/dashboard';
        return;
    }

    document.getElementById('register-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        try {
            const { data } = await api.post('/register', {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                password_confirmation: document.getElementById('password_confirmation').value,
            });

            setToken(data.token);
            setUser(data.user.data || data.user);
            window.location.href = '/dashboard';
        } catch (error) {
            const data = error.response?.data;
            showErrors(data?.errors || data?.message || 'An unexpected error occurred. Please try again.');
        }
    });
}
