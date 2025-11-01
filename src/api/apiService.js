import { getApiUrl, getAuthHeaders, getFileUploadUrl, API_ENDPOINTS } from '../shared/constants/constants';

// Enhanced API service with centralized configuration
class ApiService {
  constructor() {
    this.baseURL = getApiUrl('');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = getApiUrl(endpoint);
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle different response types
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // HTTP Methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // File Upload Methods
  async uploadFile(documentId, file) {
    const url = getFileUploadUrl(documentId);
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    return response;
  }

  async downloadFile(documentId) {
    const url = getFileUploadUrl(documentId);
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('File download failed');
    }

    return response;
  }

  async viewFile(documentId) {
    const url = getFileUploadUrl(documentId);
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('File view failed');
    }

    return response;
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
