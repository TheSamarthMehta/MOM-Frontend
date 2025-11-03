const config = {
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8800/api',
  
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  ALLOWED_FILE_TYPES: [
    '.pdf', '.doc', '.docx', '.ppt', '.pptx', 
    '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', 
    '.png', '.gif', '.svg'
  ],
  
  DEFAULT_PAGE_SIZE: 50,
  
  DEBOUNCE_DELAY: 300,
  
  STORAGE_KEYS: {
    TOKEN: 'token',
    USER: 'user',
    THEME: 'theme'
  }
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  MEETINGS: '/meetings',
  MEETING_TYPES: '/meeting-types',
  
  STAFF: '/staff',
  
  DOCUMENTS: '/meeting-documents',
  UPLOAD_DOCUMENT: '/upload/document',
  
  DASHBOARD: '/dashboard/overview'
};

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
