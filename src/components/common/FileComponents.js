import React from 'react';
import { File, FileText, Image as ImageIcon } from 'lucide-react';
import config from '../../config/constants';

// File utility functions
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  if (extension === 'pdf') return 'PDF';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return 'Image';
  if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'Document';
  if (['ppt', 'pptx'].includes(extension)) return 'Presentation';
  if (['xls', 'xlsx', 'csv'].includes(extension)) return 'Spreadsheet';
  return 'Other';
};

export const getFileIcon = (type, size = 20) => {
  switch (type) {
    case "PDF":
      return <FileText size={size} className="text-red-500" />;
    case "Image":
      return <ImageIcon size={size} className="text-green-500" />;
    case "Presentation":
      return <File size={size} className="text-orange-500" />;
    case "Spreadsheet":
      return <File size={size} className="text-green-600" />;
    default:
      return <File size={size} className="text-blue-500" />;
  }
};

// File upload component
export const FileUpload = ({ 
  onFileSelect, 
  accept = config.ALLOWED_FILE_TYPES.join(','),
  maxSize = config.MAX_FILE_SIZE,
  className = ''
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > maxSize) {
        alert(`File size must be less than ${formatFileSize(maxSize)}`);
        return;
      }
      onFileSelect(file);
    }
  };

  return (
    <div className={className}>
      <input
        type="file"
        onChange={handleFileChange}
        accept={accept}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
  );
};

// File actions component
export const FileActions = ({ 
  onView, 
  onDownload, 
  onDelete, 
  className = '' 
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {onView && (
        <button 
          onClick={onView}
          className="text-blue-600 hover:text-blue-800 transition-colors duration-200" 
          title="View"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      )}
      {onDownload && (
        <button 
          onClick={onDownload}
          className="text-green-600 hover:text-green-800 transition-colors duration-200" 
          title="Download"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      )}
      {onDelete && (
        <button 
          onClick={onDelete}
          className="text-red-600 hover:text-red-800 transition-colors duration-200" 
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
};
