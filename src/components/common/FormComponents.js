import React from 'react';

const FormInput = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const FormSelect = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option',
  required = false,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const FormTextArea = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  rows = 4,
  required = false,
  error,
  className = '',
  ...props 
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const FormButton = ({ 
  type = 'button', 
  variant = 'primary', 
  children, 
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'px-6 py-3 rounded-lg font-medium transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white'
  };

  const disabledClasses = disabled || loading 
    ? 'opacity-50 cursor-not-allowed' 
    : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export { FormInput, FormSelect, FormTextArea, FormButton };
