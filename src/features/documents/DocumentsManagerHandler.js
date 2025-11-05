import { useState, useEffect } from 'react';
import { api } from '../../shared/utils/api';
import DocumentService from '../../api/documentService';

export const useDocumentsManager = () => {
  const [documents, setDocuments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMeeting, setUploadMeeting] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

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
      // Error handling is done in DocumentService
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    documents,
    meetings,
    loading,
    error,
    selectedFile,
    uploadMeeting,
    showUploadModal,
    
    // Setters
    setSelectedFile,
    setUploadMeeting,
    setShowUploadModal,
    
    // Handlers
    fetchData,
    handleDelete,
    handleView,
    handleDownload,
    handleUpload
  };
};

export default useDocumentsManager;
