import { useState } from 'react';

// Error handling utilities
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Extract error message from different error formats
  let message = 'An unexpected error occurred';
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (data && data.message) {
      message = data.message;
    } else if (data && data.error) {
      message = data.error;
    } else {
      switch (status) {
        case 400:
          message = 'Bad request. Please check your input.';
          break;
        case 401:
          message = 'Unauthorized. Please log in again.';
          break;
        case 403:
          message = 'Access denied. You don\'t have permission to perform this action.';
          break;
        case 404:
          message = 'Resource not found.';
          break;
        case 409:
          message = 'Conflict. The resource already exists.';
          break;
        case 422:
          message = 'Validation error. Please check your input.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        default:
          message = `Server error (${status}). Please try again.`;
      }
    }
  } else if (error.request) {
    // Network error
    message = 'Network error. Please check your connection and try again.';
  } else if (error.message) {
    // Other error
    message = error.message;
  }
  
  return message;
};

// Custom React hooks for state management

// Loading states hook
export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = useState(initialState);
  
  const withLoading = async (asyncFunction) => {
    try {
      setLoading(true);
      return await asyncFunction();
    } finally {
      setLoading(false);
    }
  };
  
  return { loading, setLoading, withLoading };
};

// Error state hook
export const useErrorState = () => {
  const [error, setError] = useState(null);
  
  const clearError = () => setError(null);
  const setApiError = (err) => setError(handleApiError(err));
  
  return { error, setError, clearError, setApiError };
};

// Success state hook
export const useSuccessState = () => {
  const [success, setSuccess] = useState(null);
  
  const clearSuccess = () => setSuccess(null);
  const showSuccess = (message) => {
    setSuccess(message);
    // Auto-clear after 5 seconds
    setTimeout(() => setSuccess(null), 5000);
  };
  
  return { success, setSuccess, clearSuccess, showSuccess };
};

// Combined async state hook
export const useAsyncState = () => {
  const loadingState = useLoadingState();
  const errorState = useErrorState();
  const successState = useSuccessState();
  
  const executeAsync = async (asyncFunction, successMessage = null) => {
    try {
      errorState.clearError();
      const result = await loadingState.withLoading(asyncFunction);
      if (successMessage) {
        successState.showSuccess(successMessage);
      }
      return result;
    } catch (err) {
      errorState.setApiError(err);
      throw err;
    }
  };
  
  return {
    ...loadingState,
    ...errorState,
    ...successState,
    executeAsync,
  };
};

// Toast notification utility
export const showToast = (message, type = 'info') => {
  // This would integrate with a toast library like react-hot-toast
  // For now, we'll use a simple alert
  if (type === 'error') {
    console.error('Toast Error:', message);
  } else if (type === 'success') {
    console.log('Toast Success:', message);
  } else {
    console.log('Toast Info:', message);
  }
};

// Form validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

// Form validation helper
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    fieldRules.forEach(rule => {
      if (rule.required && !validateRequired(value)) {
        errors[field] = rule.message || `${field} is required`;
        return;
      }
      
      if (value && rule.type === 'email' && !validateEmail(value)) {
        errors[field] = rule.message || 'Invalid email format';
        return;
      }
      
      if (value && rule.type === 'password' && !validatePassword(value)) {
        errors[field] = rule.message || 'Password must be at least 6 characters';
        return;
      }
      
      if (value && rule.type === 'phone' && !validatePhone(value)) {
        errors[field] = rule.message || 'Invalid phone number';
        return;
      }
      
      if (value && rule.minLength && value.length < rule.minLength) {
        errors[field] = rule.message || `Minimum length is ${rule.minLength}`;
        return;
      }
      
      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors[field] = rule.message || `Maximum length is ${rule.maxLength}`;
        return;
      }
    });
  });
  
  return errors;
};

// Date utilities
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString();
};

export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString();
};

export const formatTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export default {
  handleApiError,
  useLoadingState,
  useErrorState,
  useSuccessState,
  useAsyncState,
  showToast,
  validateEmail,
  validatePassword,
  validatePhone,
  validateRequired,
  validateForm,
  formatDate,
  formatDateTime,
  formatTime,
  formatFileSize,
  getFileExtension,
  debounce,
  throttle,
};
