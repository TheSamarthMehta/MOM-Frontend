/**
 * Centralized Error Handling
 * Provides consistent error handling across the application
 */

export class AppError extends Error {
  constructor(message, statusCode = null, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

/**
 * Extract user-friendly error message from error object
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof AppError) {
    return error.message;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

/**
 * Extract error status code
 */
export const getErrorStatusCode = (error) => {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error?.response?.status) {
    return error.response.status;
  }

  return null;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  return error.message === 'Failed to fetch' || 
         error.message?.includes('Network') ||
         !navigator.onLine;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error) => {
  const statusCode = getErrorStatusCode(error);
  return statusCode === 401 || statusCode === 403;
};

/**
 * Handle API error with appropriate action
 */
export const handleApiError = (error, options = {}) => {
  const message = getErrorMessage(error);
  const statusCode = getErrorStatusCode(error);

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      message,
      statusCode,
      error,
    });
  }

  // Handle authentication errors
  if (isAuthError(error) && options.onAuthError) {
    options.onAuthError(error);
    return;
  }

  // Handle network errors
  if (isNetworkError(error) && options.onNetworkError) {
    options.onNetworkError(error);
    return;
  }

  // Default error handler
  if (options.onError) {
    options.onError(message, error);
  }

  return message;
};

