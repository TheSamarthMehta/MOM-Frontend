import { getApiUrl, getAuthHeaders } from '../constants/constants';
import { getErrorMessage } from './errorHandler';

const fetchData = async (endpoint, method = 'GET', body = null, options = {}) => {
    const url = getApiUrl(endpoint);
    const headers = {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
        ...options.headers,
    };
    
    const config = {
        method,
        headers,
    };
    
    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);
        
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }
        
        if (!response.ok) {
            const errorMessage = data?.message || data || `HTTP error! status: ${response.status}`;
            const error = new Error(errorMessage);
            error.status = response.status;
            error.response = { data, status: response.status };
            throw error;
        }
        
        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            throw new Error('Network error. Please check your connection.');
        }
        throw error;
    }
};

export const api = {
    get: (endpoint, options = {}) => fetchData(endpoint, 'GET', null, options),
    post: (endpoint, body, options = {}) => fetchData(endpoint, 'POST', body, options),
    put: (endpoint, body, options = {}) => fetchData(endpoint, 'PUT', body, options),
    delete: (endpoint, options = {}) => fetchData(endpoint, 'DELETE', null, options),
};

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    updateProfile: (profileData) => api.put('/auth/profile', profileData),
    changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
    logout: () => api.post('/auth/logout'),
    refreshToken: () => api.post('/auth/refresh'),
    verifyToken: () => api.get('/auth/verify'),
};