import React, { useState, useEffect } from "react";
import { Upload, Download, Eye, Trash2, File, FileText, Image as ImageIcon, Search } from "lucide-react";
import { api } from '../utils/api';

const DocumentsManagerPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [documents, setDocuments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMeeting, setUploadMeeting] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const meetingsResponse = await api.get('/meetings?limit=50');
      setMeetings(meetingsResponse.data || []);
      
      const allDocuments = [];
      for (const meeting of meetingsResponse.data || []) {
        try {
          const docsResponse = await api.get(`/meetings/${meeting._id}/documents`);
          const meetingDocs = (docsResponse.data || []).map(doc => ({
            ...doc,
            meetingTitle: meeting.meetingTitle || 'Unknown Meeting',
            meetingId: meeting._id
          }));
          allDocuments.push(...meetingDocs);
        } catch (err) {
          // Skip failed document fetches
        }
      }
      setDocuments(allDocuments);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (extension === 'pdf') return 'PDF';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return 'Image';
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) return 'Document';
    if (['ppt', 'pptx'].includes(extension)) return 'Presentation';
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'Spreadsheet';
    return 'Other';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "PDF":
        return <FileText size={20} className="text-red-500" />;
      case "Image":
        return <ImageIcon size={20} className="text-green-500" />;
      case "Presentation":
        return <File size={20} className="text-orange-500" />;
      case "Spreadsheet":
        return <File size={20} className="text-green-600" />;
      default:
        return <File size={20} className="text-blue-500" />;
    }
  };

  const handleDelete = async (doc) => {
    if (window.confirm(`Are you sure you want to delete "${doc.documentName}"?`)) {
      try {
        await api.delete(`/meeting-documents/${doc._id}`);
        setDocuments((prev) => prev.filter((d) => d._id !== doc._id));
      } catch (err) {
        alert(err.message || 'Failed to delete document');
      }
    }
  };

  const handleView = async (doc) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8800/api'}/upload/document/${doc._id}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('View failed');
      }

      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (err) {
      alert(err.message || 'Failed to view document');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8800/api'}/upload/document/${doc._id}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || 'Failed to download document');
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadMeeting) {
      alert("Please select a file and meeting.");
      return;
    }

    try {
      setLoading(true);
      
      const documentData = {
        documentName: selectedFile.name,
        documentType: getFileType(selectedFile.name),
        documentDescription: `Uploaded file: ${selectedFile.name}`,
        fileSize: selectedFile.size
      };
      
      const response = await api.post(`/meetings/${uploadMeeting}/documents`, documentData);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const token = localStorage.getItem('token');
      const uploadResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8800/api'}/upload/document/${response.data._id}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }
      
      const newDoc = {
        ...response.data,
        meetingTitle: meetings.find(m => m._id === uploadMeeting)?.meetingTitle || 'Unknown Meeting',
        meetingId: uploadMeeting
      };
      setDocuments((prev) => [newDoc, ...prev]);
      
      setSelectedFile(null);
      setUploadMeeting("");
      setShowUploadModal(false);
    } catch (err) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.documentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.meetingTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "All" || doc.documentType === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading && documents.length === 0) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Documents Management</h1>
        <p className="text-gray-600">Upload meeting documents, view document list, download/view, and delete/replace documents.</p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Meeting Documents</h2>
        <div 
          onClick={() => setShowUploadModal(true)}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition cursor-pointer hover:border-blue-400"
        >
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 mb-2">Click to upload documents</p>
          <p className="text-sm text-gray-500">Supports: PDF, DOCX, PPTX, XLSX, Images (Max 10MB)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Document List View</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All</option>
              <option>PDF</option>
              <option>Document</option>
              <option>Presentation</option>
              <option>Spreadsheet</option>
              <option>Image</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Document</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Type</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Size</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Meeting</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Uploaded By</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDocs.map((doc) => (
                <tr key={doc._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(doc.documentType)}
                      <span className="text-gray-800 font-medium">{doc.documentName || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{doc.documentType || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{doc.fileSize ? formatFileSize(doc.fileSize) : 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{doc.meetingTitle || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{doc.uploadedBy || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleView(doc)}
                        className="text-blue-600 hover:text-blue-800" 
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="text-green-600 hover:text-green-800" 
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc)}
                        className="text-red-600 hover:text-red-800" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDocs.length === 0 && (
          <div className="text-center py-8 text-gray-500">No documents found.</div>
        )}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
              onClick={() => setShowUploadModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Upload Document</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select File<span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.svg"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
                {selectedFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>File:</strong> {selectedFile.name}</p>
                    <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
                    <p><strong>Type:</strong> {getFileType(selectedFile.name)}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting<span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadMeeting}
                  onChange={(e) => setUploadMeeting(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a meeting</option>
                  {meetings.map((meeting) => (
                    <option key={meeting._id} value={meeting._id}>
                      {meeting.meetingTitle} - {meeting.meetingDate ? new Date(meeting.meetingDate).toLocaleDateString() : 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setShowUploadModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-md font-semibold ${
                    loading 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsManagerPage;