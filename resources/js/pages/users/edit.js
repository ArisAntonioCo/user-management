import { isAuthenticated, getUser, setUser } from '../../services/auth';
import api from '../../api/client';
import { showErrors, showSuccess, showLayout, clearMessages } from '../../utils/ui';

export async function init() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    const userId = document.body.dataset.userId;
    if (!userId) {
        showErrors('User ID not found.');
        return;
    }

    try {
        const { data: result } = await api.get(`/users/${userId}`);
        const user = result.data || result;

        document.getElementById('name').value = user.name;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;

        const currentUser = getUser();
        if (!currentUser || currentUser.role !== 'admin') {
            document.getElementById('role-field').classList.add('hidden');
        }
    } catch (error) {
        showErrors('Failed to load user data.');
    }

    document.getElementById('edit-user-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
        };

        const password = document.getElementById('password').value;
        if (password) {
            data.password = password;
            data.password_confirmation = document.getElementById('password_confirmation').value;
        }

        const currentUser = getUser();
        if (currentUser && currentUser.role === 'admin') {
            data.role = document.getElementById('role').value;
        }

        try {
            const { data: result } = await api.put(`/users/${userId}`, data);
            showSuccess('User updated successfully.');
            if (currentUser && currentUser.id === parseInt(userId)) {
                setUser(result.user.data || result.user);
                showLayout();
            }
        } catch (error) {
            const result = error.response?.data;
            showErrors(result?.errors || result?.message || 'An unexpected error occurred. Please try again.');
        }
    });
}
