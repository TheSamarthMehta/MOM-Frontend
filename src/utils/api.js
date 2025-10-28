import { getApiUrl, getAuthHeaders } from '../config/constants';

const fetchData = async (endpoint, method = 'GET', body = null) => {
    const url = getApiUrl(endpoint);
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
    };
    
    const options = {
        method,
        headers
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }
    
    return data;
};

export const api = {
    get: (endpoint) => fetchData(endpoint, 'GET'),
    post: (endpoint, body) => fetchData(endpoint, 'POST', body),
    put: (endpoint, body) => fetchData(endpoint, 'PUT', body),
    delete: (endpoint) => fetchData(endpoint, 'DELETE')
};

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    updateProfile: (profileData) => api.put('/auth/profile', profileData),
    changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
    verifyToken: () => api.get('/auth/verify')
};