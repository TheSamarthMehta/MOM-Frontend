// Utility Functions - Common operations used across services

// Form validation utilities
export const FormValidator = {
  // Validate email
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone number
  validatePhone: (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Validate required fields
  validateRequired: (fields) => {
    const errors = {};
    Object.keys(fields).forEach(key => {
      if (!fields[key] || fields[key].toString().trim() === '') {
        errors[key] = `${key} is required`;
      }
    });
    return errors;
  }
};

// File utilities
export const FileUtils = {
  // Validate file size
  validateFileSize: (file, maxSize = 10 * 1024 * 1024) => {
    return file.size <= maxSize;
  },

  // Validate file type
  validateFileType: (file, allowedTypes = []) => {
    const extension = file.name.split('.').pop().toLowerCase();
    return allowedTypes.includes(`.${extension}`);
  },

  // Get file extension
  getFileExtension: (filename) => {
    return filename.split('.').pop().toLowerCase();
  }
};

// Date utilities
export const DateUtils = {
  // Format date for display
  formatDate: (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  },

  // Format time for display
  formatTime: (time) => {
    if (!time) return 'N/A';
    return new Date(time).toTimeString().slice(0, 5);
  },

  // Format date and time
  formatDateTime: (dateTime) => {
    if (!dateTime) return 'N/A';
    const date = new Date(dateTime);
    return `${date.toLocaleDateString()} ${date.toTimeString().slice(0, 5)}`;
  },

  // Get current date in YYYY-MM-DD format
  getCurrentDate: () => {
    return new Date().toISOString().split('T')[0];
  },

  // Get current time in HH:MM format
  getCurrentTime: () => {
    return new Date().toTimeString().slice(0, 5);
  }
};

// String utilities
export const StringUtils = {
  // Capitalize first letter
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Truncate text
  truncate: (str, length = 50) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  },

  // Generate initials
  generateInitials: (name) => {
    if (!name) return '';
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
  }
};

// Local storage utilities
export const StorageUtils = {
  // Get item from localStorage
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from localStorage:', error);
      return null;
    }
  },

  // Set item in localStorage
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Error setting item in localStorage:', error);
      return false;
    }
  },

  // Remove item from localStorage
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing item from localStorage:', error);
      return false;
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Error handling utilities
export const ErrorUtils = {
  // Get user-friendly error message
  getErrorMessage: (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return 'An unexpected error occurred';
  },

  // Log error with context
  logError: (error, context = '') => {
    console.error(`Error ${context}:`, error);
  }
};

// Export all utilities
export default {
  FormValidator,
  FileUtils,
  DateUtils,
  StringUtils,
  StorageUtils,
  ErrorUtils
};
