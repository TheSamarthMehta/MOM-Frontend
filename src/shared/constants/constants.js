// Configuration constants
const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8800/api',
  
  // File Upload Configuration
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', 
    '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', 
    '.png', '.gif', '.svg'
  ],
  
  // Pagination
  DEFAULT_PAGE_SIZE: 50,
  
  // UI Configuration
  DEBOUNCE_DELAY: 300,
  
  // Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Meetings
  MEETINGS: '/meetings',
  MEETING_TYPES: '/meeting-types',
  
  // Staff
  STAFF: '/staff',
  
  // Documents
  DOCUMENTS: '/meeting-documents',
  UPLOAD_DOCUMENT: '/upload/document',
  
  // Dashboard
  DASHBOARD: '/dashboard/overview'
};

// Helper functions
export const getApiUrl = (endpoint) => {
  return `${config.API_BASE_URL}${endpoint}`;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem(config.STORAGE_KEYS.TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getFileUploadUrl = (documentId) => {
  return getApiUrl(`${API_ENDPOINTS.UPLOAD_DOCUMENT}/${documentId}`);
};

export default config;
