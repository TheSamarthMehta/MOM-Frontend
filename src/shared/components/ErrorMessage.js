import React from 'react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  title = 'Error Loading Data',
  className = '',
  showIcon = true 
}) => {
  if (!error) return null;

  return (
    <div className={`min-h-screen bg-gray-50 p-6 ${className}`}>
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center">
          {showIcon && (
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div>
            <h3 className="text-lg font-semibold text-red-800">{title}</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
