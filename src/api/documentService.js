import { api } from '../shared/utils/api';
import apiService from './apiService';
import { getFileType } from '../shared/components/FileComponents';

// Document Service - Handles all document-related operations
export class DocumentService {
  // Fetch all documents for meetings
  static async fetchAllDocuments(meetings) {
    const allDocuments = [];
    
    for (const meeting of meetings) {
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
        console.warn(`Failed to fetch documents for meeting ${meeting._id}:`, err);
      }
    }
    
    return allDocuments;
  }

  // Delete a document
  static async deleteDocument(doc) {
    if (window.confirm(`Are you sure you want to delete "${doc.documentName}"?`)) {
      try {
        await api.delete(`/meeting-documents/${doc._id}`);
        return true; // Success
      } catch (err) {
        alert(err.message || 'Failed to delete document');
        return false; // Failed
      }
    }
    return false; // Cancelled
  }

  // View a document
  static async viewDocument(doc) {
    try {
      const response = await apiService.viewFile(doc._id);
      const blob = await response.blob();
      const fileURL = URL.createObjectURL(blob);
      window.open(fileURL, '_blank');
      return true;
    } catch (err) {
      alert(err.message || 'Failed to view document');
      return false;
    }
  }

  // Download a document
  static async downloadDocument(doc) {
    try {
      const response = await apiService.downloadFile(doc._id);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      alert(err.message || 'Failed to download document');
      return false;
    }
  }

  // Upload a document
  static async uploadDocument(selectedFile, uploadMeeting, meetings) {
    if (!selectedFile || !uploadMeeting) {
      alert("Please select a file and meeting.");
      return null;
    }

    try {
      const documentData = {
        documentName: selectedFile.name,
        documentType: getFileType(selectedFile.name),
        documentDescription: `Uploaded file: ${selectedFile.name}`,
        fileSize: selectedFile.size
      };
      
      const response = await api.post(`/meetings/${uploadMeeting}/documents`, documentData);
      await apiService.uploadFile(response.data._id, selectedFile);
      
      const newDoc = {
        ...response.data,
        meetingTitle: meetings.find(m => m._id === uploadMeeting)?.meetingTitle || 'Unknown Meeting',
        meetingId: uploadMeeting
      };
      
      return newDoc;
    } catch (err) {
      alert(err.message || 'Failed to upload document');
      return null;
    }
  }

  // Filter documents based on search and type
  static filterDocuments(documents, searchQuery, filterType) {
    return documents.filter((doc) => {
      const matchesSearch = doc.documentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            doc.meetingTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === "All" || doc.documentType === filterType;
      return matchesSearch && matchesFilter;
    });
  }
}

export default DocumentService;
