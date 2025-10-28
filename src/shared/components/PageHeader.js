import React from 'react';

const PageHeader = ({ 
  title, 
  subtitle, 
  actionButton, 
  className = '' 
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-2">{subtitle}</p>
          )}
        </div>
        {actionButton && (
          <div>
            {actionButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
