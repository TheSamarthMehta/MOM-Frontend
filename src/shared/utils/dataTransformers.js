import { DateUtils } from './commonUtils';

/**
 * Meeting Data Transformers
 * Centralized data transformation logic for meetings
 */
export const MeetingTransformer = {
  /**
   * Transform API meeting data to UI format
   */
  toUIFormat: (meeting) => {
    if (!meeting) return null;

    const meetingDate = meeting.meetingDate ? new Date(meeting.meetingDate) : null;
    const meetingTime = meeting.meetingTime ? new Date(meeting.meetingTime) : null;

    return {
      id: meeting._id || meeting.id,
      title: meeting.meetingTitle || 'Untitled Meeting',
      type: meeting.meetingTypeId?.meetingTypeName || 
            meeting.meetingTypeId?.typeName || 
            meeting.type || 
            'N/A',
      date: meetingDate ? meetingDate.toISOString().split('T')[0] : '',
      time: meetingTime ? meetingTime.toTimeString().slice(0, 5) : '',
      duration: meeting.duration || '',
      location: meeting.remarks || meeting.location || '',
      agenda: meeting.meetingDescription || meeting.agenda || '',
      status: meeting.status || 'Scheduled',
      meetingTypeId: meeting.meetingTypeId?._id || meeting.meetingTypeId || meeting.meetingTypeId,
      original: meeting, // Keep reference to original data
    };
  },

  /**
   * Transform UI meeting data to API format
   */
  toAPIFormat: (formData, meetingTypeId) => {
    const meetingDateTime = new Date(`${formData.date}T${formData.time}`);

    return {
      meetingDate: meetingDateTime.toISOString(),
      meetingTime: meetingDateTime.toISOString(),
      meetingTypeId,
      meetingTitle: formData.title,
      meetingDescription: formData.agenda || '',
      remarks: formData.location || '',
      status: formData.status || 'Scheduled',
    };
  },

  /**
   * Transform meeting for form initialization
   */
  toFormFormat: (meeting) => {
    if (!meeting) return null;

    return {
      title: meeting.title || '',
      type: meeting.type || '',
      date: meeting.date || '',
      time: meeting.time || '',
      duration: meeting.duration || '',
      location: meeting.location || '',
      agenda: meeting.agenda || '',
    };
  },

  /**
   * Transform array of meetings
   */
  transformMany: (meetings) => {
    if (!Array.isArray(meetings)) return [];
    return meetings.map(MeetingTransformer.toUIFormat).filter(Boolean);
  },
};

/**
 * Dashboard Data Transformers
 */
export const DashboardTransformer = {
  /**
   * Transform dashboard stats
   */
  transformStats: (overview) => {
    return {
      upcoming: overview?.upcoming || 0,
      completed: overview?.completed || 0,
      cancelled: overview?.cancelled || 0,
      pending: overview?.pending || 0,
    };
  },
};

/**
 * Staff Data Transformers
 */
export const StaffTransformer = {
  /**
   * Transform API staff data to UI format
   */
  toUIFormat: (staff) => {
    if (!staff) return null;

    return {
      id: staff._id || staff.id,
      staffName: staff.staffName || '',
      emailAddress: staff.emailAddress || '',
      mobileNo: staff.mobileNo || '',
      role: staff.role || 'Staff',
      department: staff.department || '',
      original: staff,
    };
  },

  /**
   * Transform UI staff data to API format
   */
  toAPIFormat: (formData) => {
    return {
      staffName: formData.staffName,
      emailAddress: formData.emailAddress,
      mobileNo: formData.mobileNo,
      role: formData.role,
      department: formData.department || '',
    };
  },

  /**
   * Transform array of staff
   */
  transformMany: (staffList) => {
    if (!Array.isArray(staffList)) return [];
    return staffList.map(StaffTransformer.toUIFormat).filter(Boolean);
  },
};

