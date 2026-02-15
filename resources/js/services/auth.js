export function getToken() {
    return localStorage.getItem('auth_token');
}

export function setToken(token) {
    localStorage.setItem('auth_token', token);
}

export function removeToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
}

export function getUser() {
    try {
        const user = localStorage.getItem('auth_user');
        return user ? JSON.parse(user) : null;
    } catch {
        localStorage.removeItem('auth_user');
        return null;
    }
}

export function setUser(user) {
    localStorage.setItem('auth_user', JSON.stringify(user));
}

export function isAuthenticated() {
    return !!getToken();
}
