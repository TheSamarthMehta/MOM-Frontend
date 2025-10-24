// Base URL for all API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8800/api';

// Get token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Main function to handle all API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Debug logs - helpful during development
  console.log('Making API request to:', url);
  console.log('Request options:', options);
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Parse response based on content type
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    console.log('Response data:', data);
    
    // Handle errors
    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}`);
      error.response = { status: response.status, data };
      throw error;
    }
    
    return data;
  } catch (error) {
    // Log error details for debugging
    console.error('API request failed:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      url: url,
      options: options
    });
    
    // Extract and throw the actual error message from backend
    if (error.response?.data?.message) {
      const apiError = new Error(error.response.data.message);
      apiError.response = error.response;
      throw apiError;
    }
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  // User login
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // User registration
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // User logout
  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  // Get user profile
  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  // Update user profile
  updateProfile: async (userData) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
};

// Meeting Management APIs
export const meetingAPI = {
  // Fetch all meetings with optional filters
  getAllMeetings: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/meetings?${queryParams}`);
  },

  // Get details of a specific meeting
  getMeetingById: async (id) => {
    return apiRequest(`/meetings/${id}`);
  },

  // Create a new meeting
  createMeeting: async (meetingData) => {
    return apiRequest('/meetings', {
      method: 'POST',
      body: JSON.stringify(meetingData),
    });
  },

  // Update existing meeting
  updateMeeting: async (id, meetingData) => {
    return apiRequest(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meetingData),
    });
  },

  // Cancel a meeting
  cancelMeeting: async (id, cancellationReason) => {
    return apiRequest(`/meetings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    });
  },

  // Delete a meeting permanently
  deleteMeeting: async (id) => {
    return apiRequest(`/meetings/${id}`, {
      method: 'DELETE',
    });
  },

  // Get meeting statistics
  getMeetingStats: async () => {
    return apiRequest('/meetings/stats');
  },

  // Get upcoming meetings
  getUpcomingMeetings: async (limit = 5) => {
    return apiRequest(`/meetings/upcoming?limit=${limit}`);
  },
};

// Meeting Member API
export const meetingMemberAPI = {
  // Get all members for a meeting
  getMeetingMembers: async (meetingId) => {
    return apiRequest(`/meetings/${meetingId}/members`);
  },

  // Get single meeting member
  getMeetingMemberById: async (id) => {
    return apiRequest(`/meeting-members/${id}`);
  },

  // Add member to meeting
  addMeetingMember: async (meetingId, memberData) => {
    return apiRequest(`/meetings/${meetingId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  // Add multiple members to meeting
  addMultipleMeetingMembers: async (meetingId, staffIds) => {
    return apiRequest(`/meetings/${meetingId}/members/bulk`, {
      method: 'POST',
      body: JSON.stringify({ staffIds }),
    });
  },

  // Update meeting member
  updateMeetingMember: async (id, memberData) => {
    return apiRequest(`/meeting-members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  },

  // Mark attendance
  markAttendance: async (id, isPresent) => {
    return apiRequest(`/meeting-members/${id}/attendance`, {
      method: 'PUT',
      body: JSON.stringify({ isPresent }),
    });
  },

  // Remove member from meeting
  removeMeetingMember: async (id) => {
    return apiRequest(`/meeting-members/${id}`, {
      method: 'DELETE',
    });
  },

  // Get meeting attendance statistics
  getMeetingAttendance: async (meetingId) => {
    return apiRequest(`/meetings/${meetingId}/attendance`);
  },
};

// Meeting Document API
export const meetingDocumentAPI = {
  // Get all documents for a meeting
  getMeetingDocuments: async (meetingId) => {
    return apiRequest(`/meetings/${meetingId}/documents`);
  },

  // Get single document by ID
  getDocumentById: async (id) => {
    return apiRequest(`/meeting-documents/${id}`);
  },

  // Add document to meeting
  addMeetingDocument: async (meetingId, documentData) => {
    return apiRequest(`/meetings/${meetingId}/documents`, {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  },

  // Update document
  updateMeetingDocument: async (id, documentData) => {
    return apiRequest(`/meeting-documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(documentData),
    });
  },

  // Reorder documents
  reorderDocuments: async (meetingId, documentOrder) => {
    return apiRequest(`/meetings/${meetingId}/documents/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ documentOrder }),
    });
  },

  // Delete document
  deleteMeetingDocument: async (id) => {
    return apiRequest(`/meeting-documents/${id}`, {
      method: 'DELETE',
    });
  },

  // Get document statistics for a meeting
  getDocumentStats: async (meetingId) => {
    return apiRequest(`/meetings/${meetingId}/documents/stats`);
  },
};

// Staff API
export const staffAPI = {
  // Get all staff members
  getAllStaff: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/staff?${queryParams}`);
  },

  // Get single staff member by ID
  getStaffById: async (id) => {
    return apiRequest(`/staff/${id}`);
  },

  // Create new staff member
  createStaff: async (staffData) => {
    return apiRequest('/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  // Update staff member
  updateStaff: async (id, staffData) => {
    return apiRequest(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  },

  // Delete staff member
  deleteStaff: async (id) => {
    return apiRequest(`/staff/${id}`, {
      method: 'DELETE',
    });
  },

  // Get staff member's meeting history
  getStaffMeetings: async (id) => {
    return apiRequest(`/staff/${id}/meetings`);
  },
};

// Meeting Type API
export const meetingTypeAPI = {
  // Get all meeting types
  getAllMeetingTypes: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/meeting-types?${queryParams}`);
  },

  // Get single meeting type by ID
  getMeetingTypeById: async (id) => {
    return apiRequest(`/meeting-types/${id}`);
  },

  // Create new meeting type
  createMeetingType: async (meetingTypeData) => {
    return apiRequest('/meeting-types', {
      method: 'POST',
      body: JSON.stringify(meetingTypeData),
    });
  },

  // Update meeting type
  updateMeetingType: async (id, meetingTypeData) => {
    return apiRequest(`/meeting-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meetingTypeData),
    });
  },

  // Delete meeting type
  deleteMeetingType: async (id) => {
    return apiRequest(`/meeting-types/${id}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    return apiRequest('/dashboard/overview');
  },

  // Get dashboard analytics
  getDashboardAnalytics: async () => {
    return apiRequest('/dashboard/analytics');
  },

  // Get staff performance
  getStaffPerformance: async () => {
    return apiRequest('/dashboard/staff-performance');
  },

  // Get meeting type analytics
  getMeetingTypeAnalytics: async () => {
    return apiRequest('/dashboard/meeting-types');
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    return apiRequest(`/dashboard/recent-activity?limit=${limit}`);
  },

  // Get upcoming meetings for dashboard
  getUpcomingMeetings: async (limit = 5) => {
    return apiRequest(`/dashboard/upcoming-meetings?limit=${limit}`);
  },
};

// File Upload API (for document uploads)
export const fileUploadAPI = {
  // Upload file for a document
  uploadFile: async (file, documentId) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/document/${documentId}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  },

  // Download file
  downloadFile: async (documentId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/document/${documentId}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },

  // Delete file
  deleteFile: async (documentId) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/document/${documentId}`, {
      method: 'DELETE',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Delete failed');
    }

    return response.json();
  },
};

// Export all APIs as a single object for convenience
export default {
  auth: authAPI,
  meetings: meetingAPI,
  meetingMembers: meetingMemberAPI,
  meetingDocuments: meetingDocumentAPI,
  staff: staffAPI,
  meetingTypes: meetingTypeAPI,
  dashboard: dashboardAPI,
  fileUpload: fileUploadAPI,
};
