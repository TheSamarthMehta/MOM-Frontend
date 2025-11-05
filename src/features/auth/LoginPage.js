import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { api } from '../../shared/utils/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Admin');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    const { setUser, setToken } = useAuth();
    const navigate = useNavigate();
    
    const validateField = (name, value) => {
        switch (name) {
            case 'email':
                if (!value.trim()) {
                    return 'Please fill the email field';
                }
                if (!/\S+@\S+\.\S+/.test(value)) {
                    return 'Please enter a valid email address';
                }
                return '';
            case 'password':
                if (!value.trim()) {
                    return 'Please fill the password field';
                }
                if (value.length < 6) {
                    return 'Password must be at least 6 characters';
                }
                return '';
            case 'role':
                if (!value) {
                    return 'Please select a role';
                }
                return '';
            default:
                return '';
        }
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        const error = validateField(field, eval(field));
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleFieldChange = (field, value) => {
        switch (field) {
            case 'email':
                setEmail(value);
                break;
            case 'password':
                setPassword(value);
                break;
            case 'role':
                setRole(value);
                break;
        }
        
        if (touched[field]) {
            const error = validateField(field, value);
            setFieldErrors(prev => ({ ...prev, [field]: error }));
        }
    };
    
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        
        // Mark all fields as touched
        setTouched({ email: true, password: true, role: true });
        
        // Validate all fields
        const errors = {
            email: validateField('email', email),
            password: validateField('password', password),
            role: validateField('role', role)
        };
        
        setFieldErrors(errors);
        
        // Check if there are any errors
        if (Object.values(errors).some(error => error !== '')) {
            return;
        }
        
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password, role });
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setToken(response.data.token);
            setUser(response.data.user);
            
            navigate("/dashboard");
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your MOM Portal account</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email Address <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white ${
                                        touched.email && fieldErrors.email 
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                    }`}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                            </div>
                            {touched.email && fieldErrors.email && (
                                <div className="mt-2 bg-red-50 border border-red-300 rounded-lg p-2 flex items-start space-x-2">
                                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-700">{fieldErrors.email}</p>
                                </div>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => handleFieldChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white pr-12 ${
                                        touched.password && fieldErrors.password 
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {touched.password && fieldErrors.password && (
                                <div className="mt-2 bg-red-50 border border-red-300 rounded-lg p-2 flex items-start space-x-2">
                                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-700">{fieldErrors.password}</p>
                                </div>
                            )}
                        </div>

                        {/* Role Field */}
                        <div>
                            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="role"
                                value={role}
                                onChange={(e) => handleFieldChange('role', e.target.value)}
                                onBlur={() => handleBlur('role')}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white ${
                                    touched.role && fieldErrors.role 
                                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                }`}
                            >
                                <option value="Admin">Admin</option>
                                <option value="Convener">Convener</option>
                                <option value="Staff">Staff</option>
                            </select>
                            {touched.role && fieldErrors.role && (
                                <div className="mt-2 bg-red-50 border border-red-300 rounded-lg p-2 flex items-start space-x-2">
                                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-700">{fieldErrors.role}</p>
                                </div>
                            )}
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </button>

                        {/* Sign Up Link */}
                        <div className="text-center pt-4">
                            <p className="text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200">
                                    Create one here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}

export default LoginPage;

