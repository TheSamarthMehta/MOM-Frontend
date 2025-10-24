import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function - handles user authentication
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.login(credentials);
      
      // Store token and user info in localStorage for persistence
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setToken(response.data.token);
      setUser(response.data.user);
      
      return response.data;
    } catch (err) {
      console.error('Login error:', err);
      // Extract specific error message from backend response
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Register function - creates new user account
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Attempting registration with data:', userData);
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      
      // Store token and user info after successful registration
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setToken(response.data.token);
      setUser(response.data.user);
      
      return response.data;
    } catch (err) {
      console.error('Registration error details:', err);
      console.error('Error message:', err.message);
      console.error('Error response:', err.response);
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear state
      setToken(null);
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.updateProfile(profileData);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      
      return response.data;
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authAPI.changePassword(passwordData);
      return response.data;
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.message || 'Password change failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!(token && user);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
