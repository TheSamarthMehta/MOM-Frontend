import React from 'react';
import { Edit3, Trash2, Eye, Download, Plus, Search, RefreshCw } from 'lucide-react';

export const ActionIcons = {
  Edit: ({ size = 18, className = '', onClick, title = 'Edit' }) => (
    <button
      onClick={onClick}
      className={`text-green-600 hover:text-green-800 transition-colors duration-200 ${className}`}
      title={title}
    >
      <Edit3 size={size} />
    </button>
  ),

  Delete: ({ size = 18, className = '', onClick, title = 'Delete' }) => (
    <button
      onClick={onClick}
      className={`text-red-600 hover:text-red-800 transition-colors duration-200 ${className}`}
      title={title}
    >
      <Trash2 size={size} />
    </button>
  ),

  View: ({ size = 18, className = '', onClick, title = 'View' }) => (
    <button
      onClick={onClick}
      className={`text-blue-600 hover:text-blue-800 transition-colors duration-200 ${className}`}
      title={title}
    >
      <Eye size={size} />
    </button>
  ),

  Download: ({ size = 18, className = '', onClick, title = 'Download' }) => (
    <button
      onClick={onClick}
      className={`text-green-600 hover:text-green-800 transition-colors duration-200 ${className}`}
      title={title}
    >
      <Download size={size} />
    </button>
  ),

  Add: ({ size = 18, className = '', onClick, title = 'Add' }) => (
    <button
      onClick={onClick}
      className={`text-blue-600 hover:text-blue-800 transition-colors duration-200 ${className}`}
      title={title}
    >
      <Plus size={size} />
    </button>
  ),

  Search: ({ size = 18, className = '', onClick, title = 'Search' }) => (
    <button
      onClick={onClick}
      className={`text-gray-600 hover:text-gray-800 transition-colors duration-200 ${className}`}
      title={title}
    >
      <Search size={size} />
    </button>
  ),

  Refresh: ({ size = 18, className = '', onClick, title = 'Refresh' }) => (
    <button
      onClick={onClick}
      className={`text-blue-600 hover:text-blue-800 transition-colors duration-200 ${className}`}
      title={title}
    >
      <RefreshCw size={size} />
    </button>
  )
};

export const ActionGroups = {
  EditDelete: ({ onEdit, onDelete, editTitle = 'Edit', deleteTitle = 'Delete', className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <ActionIcons.Edit onClick={onEdit} title={editTitle} />
      <ActionIcons.Delete onClick={onDelete} title={deleteTitle} />
    </div>
  ),

  ViewDownloadDelete: ({ onView, onDownload, onDelete, className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <ActionIcons.View onClick={onView} title="View" />
      <ActionIcons.Download onClick={onDownload} title="Download" />
      <ActionIcons.Delete onClick={onDelete} title="Delete" />
    </div>
  ),

  ViewDownload: ({ onView, onDownload, className = '' }) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <ActionIcons.View onClick={onView} title="View" />
      <ActionIcons.Download onClick={onDownload} title="Download" />
    </div>
  )
};

export const IconButton = ({ 
  icon, 
  text, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white'
  };

  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : '';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} 
        ${variantClasses[variant]} 
        ${disabledClasses}
        rounded-lg font-medium transition-colors duration-200 
        flex items-center gap-2
        ${className}
      `}
    >
      {icon}
      {text}
    </button>
  );
};

export default ActionIcons;
