import axios from 'axios';

const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
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
