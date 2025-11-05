import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from './AuthContext';
import { api } from '../../shared/utils/api';

const SignupPage = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState("Staff");
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    const { setUser, setToken } = useAuth();
    const navigate = useNavigate();

    const validateField = (name, value) => {
        switch (name) {
            case 'firstName':
                if (!value.trim()) {
                    return 'Please fill the first name field';
                }
                return '';
            case 'lastName':
                if (!value.trim()) {
                    return 'Please fill the last name field';
                }
                return '';
            case 'email':
                if (!value.trim()) {
                    return 'Please fill the email field';
                }
                if (!/\S+@\S+\.\S+/.test(value)) {
                    return 'Please enter a valid email address';
                }
                return '';
            case 'mobileNo':
                if (!value.trim()) {
                    return 'Please fill the mobile number field';
                }
                if (value.length !== 10) {
                    return 'Mobile number must be 10 digits';
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
            case 'confirmPassword':
                if (!value.trim()) {
                    return 'Please fill the confirm password field';
                }
                if (value !== password) {
                    return 'Passwords do not match';
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
        let value;
        switch (field) {
            case 'firstName': value = firstName; break;
            case 'lastName': value = lastName; break;
            case 'email': value = email; break;
            case 'mobileNo': value = mobileNo; break;
            case 'password': value = password; break;
            case 'confirmPassword': value = confirmPassword; break;
            case 'role': value = role; break;
            default: value = '';
        }
        const error = validateField(field, value);
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    };

    const handleFieldChange = (field, value) => {
        switch (field) {
            case 'firstName':
                setFirstName(value);
                break;
            case 'lastName':
                setLastName(value);
                break;
            case 'email':
                setEmail(value);
                break;
            case 'mobileNo':
                if (/^\d*$/.test(value) && value.length <= 10) {
                    setMobileNo(value);
                }
                break;
            case 'password':
                setPassword(value);
                // Also revalidate confirm password if it's been touched
                if (touched.confirmPassword) {
                    const confirmError = validateField('confirmPassword', confirmPassword);
                    setFieldErrors(prev => ({ ...prev, confirmPassword: confirmError }));
                }
                break;
            case 'confirmPassword':
                setConfirmPassword(value);
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



    const handleSignup = async (e) => {
        e.preventDefault();
        setError(null);
        setPasswordError('');
        
        // Mark all fields as touched
        setTouched({
            firstName: true,
            lastName: true,
            email: true,
            mobileNo: true,
            password: true,
            confirmPassword: true,
            role: true
        });
        
        // Validate all fields
        const errors = {
            firstName: validateField('firstName', firstName),
            lastName: validateField('lastName', lastName),
            email: validateField('email', email),
            mobileNo: validateField('mobileNo', mobileNo),
            password: validateField('password', password),
            confirmPassword: validateField('confirmPassword', confirmPassword),
            role: validateField('role', role)
        };
        
        setFieldErrors(errors);
        
        // Check if there are any errors
        if (Object.values(errors).some(error => error !== '')) {
            return;
        }
        
        setLoading(true);

        try {
            const userData = {
                firstName,
                lastName,
                email,
                mobileNo,
                password,
                role: role
            };

            const response = await api.post('/auth/register', userData);
            
            // Store token and user info in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            setToken(response.data.token);
            setUser(response.data.user);
            
            navigate("/dashboard");
        } catch (err) {
            console.error('Signup error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join the MOM Portal community</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSignup} className="space-y-6">
                        {/* Error Messages */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Registration Failed</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {passwordError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
                                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Password Error</h3>
                                    <p className="text-sm text-red-700 mt-1">{passwordError}</p>
                                </div>
                            </div>
                        )}

                        {/* Name Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    placeholder="Enter first name"
                                    value={firstName}
                                    onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                    onBlur={() => handleBlur('firstName')}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white ${
                                        touched.firstName && fieldErrors.firstName 
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                                    }`}
                                />
                                {touched.firstName && fieldErrors.firstName && (
                                    <div className="mt-2 bg-red-50 border border-red-300 rounded-lg p-2 flex items-start space-x-2">
                                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-700">{fieldErrors.firstName}</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    placeholder="Enter last name"
                                    value={lastName}
                                    onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                    onBlur={() => handleBlur('lastName')}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white ${
                                        touched.lastName && fieldErrors.lastName 
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                                    }`}
                                />
                                {touched.lastName && fieldErrors.lastName && (
                                    <div className="mt-2 bg-red-50 border border-red-300 rounded-lg p-2 flex items-start space-x-2">
                                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-700">{fieldErrors.lastName}</p>
                                    </div>
                                )}
                            </div>
                        </div>

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
                                            : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
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

                        {/* Mobile Field */}
                        <div>
                            <label htmlFor="mobile" className="block text-sm font-semibold text-gray-700 mb-2">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="mobile"
                                    type="tel"
                                    placeholder="Enter 10-digit mobile number"
                                    value={mobileNo}
                                    onChange={(e) => handleFieldChange('mobileNo', e.target.value)}
                                    onBlur={() => handleBlur('mobileNo')}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white ${
                                        touched.mobileNo && fieldErrors.mobileNo 
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                                    }`}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                            </div>
                            {touched.mobileNo && fieldErrors.mobileNo && (
                                <div className="mt-2 bg-red-50 border border-red-300 rounded-lg p-2 flex items-start space-x-2">
                                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-700">{fieldErrors.mobileNo}</p>
                                </div>
                            )}
                        </div>

                        {/* Password Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create password"
                                        value={password}
                                        onChange={(e) => handleFieldChange('password', e.target.value)}
                                        onBlur={() => handleBlur('password')}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white pr-12 ${
                                            touched.password && fieldErrors.password 
                                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                                : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
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
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                                    onBlur={() => handleBlur('confirmPassword')}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 bg-gray-50 focus:bg-white ${
                                        touched.confirmPassword && fieldErrors.confirmPassword 
                                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
                                    }`}
                                />
                                {touched.confirmPassword && fieldErrors.confirmPassword && (
                                    <div className="mt-2 bg-red-50 border border-red-300 rounded-lg p-2 flex items-start space-x-2">
                                        <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-700">{fieldErrors.confirmPassword}</p>
                                    </div>
                                )}
                            </div>
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
                                        : 'border-gray-300 focus:ring-green-500 focus:border-transparent'
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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating Account...
                                </div>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        {/* Sign In Link */}
                        <div className="text-center pt-4">
                            <p className="text-gray-600">
                                Already have an account?{' '}
                                <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-200">
                                    Sign in here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default SignupPage;