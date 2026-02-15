import { isAuthenticated, setUser } from '../services/auth';
import { apiRequest } from '../api/client';
import { showNav } from '../utils/ui';

export async function init() {
    if (!isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    try {
        const response = await apiRequest('/user');
        const data = await response.json();
        const user = data.data || data;

        setUser(user);
        showNav();

        document.getElementById('dashboard-content').innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-blue-50 rounded-lg p-6">
                    <h3 class="text-sm font-medium text-blue-600 uppercase">Welcome</h3>
                    <p class="text-2xl font-bold text-gray-800 mt-2">${user.name}</p>
                </div>
                <div class="bg-green-50 rounded-lg p-6">
                    <h3 class="text-sm font-medium text-green-600 uppercase">Email</h3>
                    <p class="text-lg text-gray-800 mt-2">${user.email}</p>
                </div>
                <div class="bg-purple-50 rounded-lg p-6">
                    <h3 class="text-sm font-medium text-purple-600 uppercase">Role</h3>
                    <p class="text-lg text-gray-800 mt-2 capitalize">${user.role}</p>
                </div>
            </div>
            <div class="mt-6">
                <a href="/users" class="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
                    Manage Users
                </a>
            </div>
        `;
    } catch (error) {
        document.getElementById('dashboard-content').innerHTML =
            '<p class="text-red-500">Failed to load dashboard data.</p>';
    }
}
