import { getToken, removeToken } from '../services/auth';

const API_BASE = '/api/v1';

export async function apiRequest(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        removeToken();
        window.location.href = '/login';
        throw new Error('Unauthenticated');
    }

    return response;
}

export async function publicRequest(url, data = {}) {
    return fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
}
