import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');

    if (
        token &&
        config.url &&
        !config.url.includes('/auth/login') &&
        !config.url.includes('/auth/register')
    ) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
