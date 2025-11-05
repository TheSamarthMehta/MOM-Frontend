/**
 * Validation Utilities
 * Centralized validation functions for forms
 */

export const validators = {
  required: (message = 'This field is required') => (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
    return null;
  },

  email: (message = 'Please enter a valid email address') => (value) => {
    if (!value) return null; // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message;
    }
    return null;
  },

  phone: (message = 'Please enter a valid phone number') => (value) => {
    if (!value) return null; // Optional field
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ''))) {
      return message;
    }
    return null;
  },

  minLength: (min, message) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max, message) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return message || `Must be no more than ${max} characters`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (!value) return null;
    if (!regex.test(value)) {
      return message || 'Invalid format';
    }
    return null;
  },

  date: (message = 'Please enter a valid date') => (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return message;
    }
    return null;
  },

  time: (message = 'Please enter a valid time') => (value) => {
    if (!value) return null;
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return message;
    }
    return null;
  },

  url: (message = 'Please enter a valid URL') => (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  },
};

/**
 * Combine multiple validators
 */
export const combine = (...validators) => (value, allValues) => {
  for (const validator of validators) {
    const error = validator(value, allValues);
    if (error) return error;
  }
  return null;
};

/**
 * Common validation schemas
 */
export const schemas = {
  meeting: {
    title: validators.required('Meeting title is required'),
    type: validators.required('Meeting type is required'),
    date: combine(
      validators.required('Date is required'),
      validators.date('Please enter a valid date')
    ),
    time: combine(
      validators.required('Time is required'),
      validators.time('Please enter a valid time')
    ),
  },

  staff: {
    staffName: validators.required('Name is required'),
    emailAddress: combine(
      validators.required('Email is required'),
      validators.email('Please enter a valid email address')
    ),
    mobileNo: combine(
      validators.required('Mobile number is required'),
      validators.pattern(/^\d{10}$/, 'Mobile number must be 10 digits')
    ),
    role: validators.required('Role is required'),
  },
};

