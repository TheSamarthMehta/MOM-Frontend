import { useState, useCallback, useEffect } from 'react';
import { useApi } from '../../../shared/hooks/useApi';
import { useModal } from '../../../shared/hooks/useModal';
import { api } from '../../../shared/utils/api';
import { handleApiError } from '../../../shared/utils/errorHandler';
import DocumentService from '../../../api/documentService';

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadMeeting, setUploadMeeting] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const apiHook = useApi();
  const modal = useModal();

  const fetchData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);
      
      const meetingsResponse = await api.get('/meetings?limit=50');
      setMeetings(meetingsResponse.data || []);
      
      const allDocuments = await DocumentService.fetchAllDocuments(meetingsResponse.data || []);
      setDocuments(allDocuments);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(handleApiError(err) || 'Failed to load data');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(async (doc) => {
    try {
      const success = await DocumentService.deleteDocument(doc);
      if (success) {
        setDocuments((prev) => prev.filter((d) => d._id !== doc._id));
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      const errorMessage = handleApiError(err) || 'Failed to delete document';
      alert(errorMessage);
    }
  }, []);

  const handleView = useCallback(async (doc) => {
    try {
      await DocumentService.viewDocument(doc);
    } catch (err) {
      console.error('Error viewing document:', err);
      const errorMessage = handleApiError(err) || 'Failed to view document';
      alert(errorMessage);
    }
  }, []);

  const handleDownload = useCallback(async (doc) => {
    try {
      await DocumentService.downloadDocument(doc);
    } catch (err) {
      console.error('Error downloading document:', err);
      const errorMessage = handleApiError(err) || 'Failed to download document';
      alert(errorMessage);
    }
  }, []);

  const handleUpload = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      const newDoc = await DocumentService.uploadDocument(selectedFile, uploadMeeting, meetings);
      
      if (newDoc) {
        setDocuments((prev) => [newDoc, ...prev]);
        setSelectedFile(null);
        setUploadMeeting("");
        setShowUploadModal(false);
      }
    } catch (err) {
      console.error('Error uploading document:', err);
      const errorMessage = handleApiError(err) || 'Failed to upload document';
      alert(errorMessage);
    }
  }, [selectedFile, uploadMeeting, meetings]);

  return {
    documents,
    meetings,
    loading: apiHook.loading || initialLoading,
    error: error || apiHook.error,
    selectedFile,
    uploadMeeting,
    showUploadModal,
    setSelectedFile,
    setUploadMeeting,
    setShowUploadModal,
    fetchData,
    handleDelete,
    handleView,
    handleDownload,
    handleUpload,
    modal,
  };
};

export default useDocuments;

