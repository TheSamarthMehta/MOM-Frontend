import React, { useState, useEffect } from "react";
import { Upload, Download, Eye, Trash2, File, FileText, Image as ImageIcon, Search } from "lucide-react";
import { API_BASE_URL } from '../utils/const';

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
  const [dragActive, setDragActive] = useState(false);


  // Get token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API request helper
  const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      if (!response.ok) {
        const error = new Error(data.message || `HTTP ${response.status}`);
        error.response = { status: response.status, data };
        throw error;
      }
      
      return data;
    } catch (error) {
      if (error.response?.data?.message) {
        const apiError = new Error(error.response.data.message);
        apiError.response = error.response;
        throw apiError;
      }
      throw error;
    }
  };

  // Fetch meetings and documents on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching meetings...');
        const meetingsResponse = await apiRequest('/meetings?limit=50');
        console.log('Meetings response:', meetingsResponse);
        const rawMeetings = meetingsResponse.data || [];
        setMeetings(rawMeetings);
        
        // Skip document fetching if no meetings exist
        if (rawMeetings.length === 0) {
          console.log('No meetings found, skipping document fetch');
          setDocuments([]);
          setLoading(false);
          return;
        }
        
        // For now, we'll fetch documents for all meetings
        // In a real app, you might want to show documents for a specific meeting
        const allDocuments = [];
        for (const meeting of rawMeetings) {
          try {
            // Use the actual MongoDB _id from the backend
            const meetingId = meeting._id || meeting.id;
            if (!meetingId) {
              console.warn('Meeting has no ID:', meeting);
              continue;
            }
            
            console.log(`Fetching documents for meeting ${meetingId}...`);
            const docsResponse = await apiRequest(`/meetings/${meetingId}/documents`);
            console.log(`Documents response for meeting ${meetingId}:`, docsResponse);
            const meetingDocs = (docsResponse.data || []).map(doc => ({
              ...doc,
              meetingTitle: meeting.meetingTitle || 'Unknown Meeting',
              meetingId: meetingId
            }));
            allDocuments.push(...meetingDocs);
          } catch (err) {
            console.error(`Failed to fetch documents for meeting ${meeting._id || meeting.id}:`, err);
            console.error('Error details:', {
              message: err.message,
              response: err.response,
              status: err.response?.status
            });
            // Continue to next meeting instead of failing completely
          }
        }
        console.log('Total documents loaded:', allDocuments.length);
        setDocuments(allDocuments);
      } catch (err) {
        console.error('Error fetching data:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          status: err.response?.status
        });
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        setLoading(true);
        await apiRequest(`/meeting-documents/${doc._id}`, {
          method: 'DELETE'
        });
        setDocuments((prev) => prev.filter((d) => d._id !== doc._id));
      } catch (err) {
        console.error('Error deleting document:', err);
        alert(err.message || 'Failed to delete document');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleView = async (doc) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/upload/document/${doc._id}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
    } catch (err) {
      console.error('Error viewing document:', err);
      alert(err.message || 'Failed to view document');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/upload/document/${doc._id}`, {
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
      console.error('Error downloading document:', err);
      alert(err.message || 'Failed to download document');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setShowUploadModal(true);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    if (!uploadMeeting) {
      alert("Please select a meeting.");
      return;
    }

    try {
      setLoading(true);
      
      // First create the document record
      const documentData = {
        documentName: selectedFile.name,
        documentType: getFileType(selectedFile.name),
        documentDescription: `Uploaded file: ${selectedFile.name}`,
        fileSize: selectedFile.size
      };
      
      const response = await apiRequest(`/meetings/${uploadMeeting}/documents`, {
        method: 'POST',
        body: JSON.stringify(documentData)
      });
      
      // Then upload the actual file
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const token = getAuthToken();
      const uploadResponse = await fetch(`${API_BASE_URL}/upload/document/${response.data._id}`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      // Add the document to the list
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
      console.error('Error uploading document:', err);
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

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload Meeting Documents</h2>
        <div 
          onClick={() => setShowUploadModal(true)}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <Upload size={48} className={`mx-auto mb-4 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-gray-600 mb-2">
            {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500">Supports: PDF, DOCX, PPTX, XLSX, Images (Max 10MB)</p>
        </div>
      </div>

      {/* Document List */}
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



      {/* Upload Modal */}
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
