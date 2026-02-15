import { isAuthenticated, getUser, setUser } from '../../services/auth';
import { apiRequest } from '../../api/client';
import { showErrors, showSuccess, showNav, clearMessages } from '../../utils/ui';

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
        const response = await apiRequest(`/users/${userId}`);
        const result = await response.json();
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
            const response = await apiRequest(`/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                showSuccess('User updated successfully.');
                if (currentUser && currentUser.id === parseInt(userId)) {
                    setUser(result.user);
                    showNav();
                }
            } else {
                showErrors(result.errors || result.message);
            }
        } catch (error) {
            showErrors('An unexpected error occurred. Please try again.');
        }
    });
}
