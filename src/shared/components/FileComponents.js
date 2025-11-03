import React from 'react';
import { File, FileText, Image as ImageIcon } from 'lucide-react';
import config from '../constants/constants';
import { ActionIcons } from './ActionIcons';

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

export const FileActions = ({ 
  onView, 
  onDownload, 
  onDelete, 
  className = '' 
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {onView && <ActionIcons.View onClick={onView} />}
      {onDownload && <ActionIcons.Download onClick={onDownload} />}
      {onDelete && <ActionIcons.Delete onClick={onDelete} />}
    </div>
  );
};
