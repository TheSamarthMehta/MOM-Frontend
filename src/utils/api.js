// Simple API helper functions
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8800/api';

// Get token from localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// Simple fetch function
const fetchData = async (endpoint, method = 'GET', body = null) => {
    const url = `${API_URL}${endpoint}`;
    const token = getToken();
    
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
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

// Export simple functions
export const api = {
    get: (endpoint) => fetchData(endpoint, 'GET'),
    post: (endpoint, body) => fetchData(endpoint, 'POST', body),
    put: (endpoint, body) => fetchData(endpoint, 'PUT', body),
    delete: (endpoint) => fetchData(endpoint, 'DELETE')
};
