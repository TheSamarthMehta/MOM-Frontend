import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiCall();
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'An error occurred';
      setError(errorMessage);

      if (options.onError) {
        options.onError(err);
      } else if (options.showError !== false && process.env.NODE_ENV === 'development') {
        console.error('API Error:', errorMessage);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback(async (endpoint, options = {}) => {
    return execute(() => api.get(endpoint), options);
  }, [execute]);

  const post = useCallback(async (endpoint, data, options = {}) => {
    return execute(() => api.post(endpoint, data), options);
  }, [execute]);

  const put = useCallback(async (endpoint, data, options = {}) => {
    return execute(() => api.put(endpoint, data), options);
  }, [execute]);

  const del = useCallback(async (endpoint, options = {}) => {
    return execute(() => api.delete(endpoint), options);
  }, [execute]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    execute,
    clearError,
  };
};

