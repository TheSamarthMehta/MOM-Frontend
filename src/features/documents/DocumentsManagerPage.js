import React, { useState, useEffect } from "react";
import { Upload, Search } from "lucide-react";
import { api } from '../../shared/utils/api';
import DocumentService from '../../api/documentService';
import LoadingSpinner from '../../shared/components/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import Modal from '../../shared/components/Modal';
import PageHeader from '../../shared/components/PageHeader';
import DataTable from '../../shared/components/DataTable';
import { FormInput, FormSelect, FormButton } from '../../shared/components/FormComponents';
import { formatFileSize, getFileType, getFileIcon, FileUpload, FileActions } from '../../shared/components/FileComponents';
import { ActionIcons } from '../../shared/components/ActionIcons';

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
      
      const allDocuments = await DocumentService.fetchAllDocuments(meetingsResponse.data || []);
      setDocuments(allDocuments);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (doc) => {
    const success = await DocumentService.deleteDocument(doc);
    if (success) {
      setDocuments((prev) => prev.filter((d) => d._id !== doc._id));
    }
  };

  const handleView = async (doc) => {
    await DocumentService.viewDocument(doc);
  };

  const handleDownload = async (doc) => {
    await DocumentService.downloadDocument(doc);
  };


  const handleUpload = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const newDoc = await DocumentService.uploadDocument(selectedFile, uploadMeeting, meetings);
      
      if (newDoc) {
        setDocuments((prev) => [newDoc, ...prev]);
        setSelectedFile(null);
        setUploadMeeting("");
        setShowUploadModal(false);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = DocumentService.filterDocuments(documents, searchQuery, filterType);

  if (loading && documents.length === 0) {
    return <LoadingSpinner text="Loading documents..." fullScreen />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={() => window.location.reload()} />;
  }

  const uploadButton = (
    <button 
      onClick={() => setShowUploadModal(true)}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
    >
      <ActionIcons.Add size={20} className="text-white" />
      Upload Document
    </button>
  );

  const tableColumns = [
    {
      key: 'documentName',
      header: 'Document',
      render: (value, doc) => (
        <div className="flex items-center gap-2">
          {getFileIcon(doc.documentType)}
          <span className="text-gray-800 font-medium">{value || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'documentType',
      header: 'Type',
      render: (value) => <span className="text-gray-600">{value || 'N/A'}</span>
    },
    {
      key: 'fileSize',
      header: 'Size',
      render: (value) => <span className="text-gray-600">{value ? formatFileSize(value) : 'N/A'}</span>
    },
    {
      key: 'meetingTitle',
      header: 'Meeting',
      render: (value) => <span className="text-gray-600">{value || 'N/A'}</span>
    },
    {
      key: 'uploadedBy',
      header: 'Uploaded By',
      render: (value) => <span className="text-gray-600">{value || 'N/A'}</span>
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (value) => <span className="text-gray-600">{value ? new Date(value).toLocaleDateString() : 'N/A'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, doc) => (
        <FileActions
          onView={() => handleView(doc)}
          onDownload={() => handleDownload(doc)}
          onDelete={() => handleDelete(doc)}
        />
      )
    }
  ];

  return (
    <div className="p-8 space-y-6">
      <PageHeader 
        title="Documents Management"
        subtitle="Upload meeting documents, view document list, download/view, and delete/replace documents."
        actionButton={uploadButton}
      />

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Document List View</h2>
        
        <div className="flex gap-2 mb-4">
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

        <DataTable
          columns={tableColumns}
          data={filteredDocs}
          emptyMessage="No documents found."
          emptyIcon={
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        size="md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <FileUpload
            onFileSelect={setSelectedFile}
            className="mb-4"
          />
          
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p><strong>File:</strong> {selectedFile.name}</p>
              <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
              <p><strong>Type:</strong> {getFileType(selectedFile.name)}</p>
            </div>
          )}

          <FormSelect
            label="Meeting"
            value={uploadMeeting}
            onChange={(e) => setUploadMeeting(e.target.value)}
            options={meetings.map(meeting => ({
              value: meeting._id,
              label: `${meeting.meetingTitle} - ${meeting.meetingDate ? new Date(meeting.meetingDate).toLocaleDateString() : 'N/A'}`
            }))}
            placeholder="Select a meeting"
            required
          />

          <div className="flex justify-end gap-2 pt-4">
            <FormButton
              type="button"
              variant="secondary"
              onClick={() => setShowUploadModal(false)}
            >
              Cancel
            </FormButton>
            <FormButton
              type="submit"
              loading={loading}
              disabled={loading}
            >
              Upload
            </FormButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DocumentsManagerPage;