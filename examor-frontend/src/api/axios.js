import axios from 'axios';

const resolveApiBase = () => {
    const configuredBase = String(process.env.REACT_APP_API_BASE_URL || '').trim();
    if (configuredBase) return configuredBase;

    if (typeof window !== 'undefined') {
        const hostname = String(window.location.hostname || '').toLowerCase();
        if (/^examor-(frontend|platform)(-[a-z0-9-]+)?\.vercel\.app$/.test(hostname)) {
            return 'https://examor-backend.vercel.app';
        }
    }

    return 'http://localhost:5000';
};

const apiBase = resolveApiBase();
const normalizedBase = apiBase.replace(/\/$/, '');

const API = axios.create({
    baseURL: `${normalizedBase}/api`
});

// بيبعت الـ Token تلقائي مع كل request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
