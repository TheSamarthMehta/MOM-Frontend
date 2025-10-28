import { api } from '../shared/utils/api';

// Meeting Service - Handles all meeting-related operations
export class MeetingService {
  // Fetch meetings with types
  static async fetchMeetingsAndTypes() {
    try {
      const [meetingsResponse, typesResponse] = await Promise.all([
        api.get('/meetings?limit=50'),
        api.get('/meeting-types')
      ]);
      
      const transformedMeetings = (meetingsResponse.data || []).map(meeting => {
        const meetingDate = meeting.meetingDate ? new Date(meeting.meetingDate) : null;
        const meetingTime = meeting.meetingTime ? new Date(meeting.meetingTime) : null;
        
        return {
          id: meeting._id || meeting.id,
          title: meeting.meetingTitle,
          type: meeting.meetingTypeId?.meetingTypeName || meeting.meetingTypeId?.typeName || meeting.type || 'N/A',
          date: meetingDate ? meetingDate.toISOString().split('T')[0] : '',
          time: meetingTime ? meetingTime.toTimeString().slice(0, 5) : '',
          duration: meeting.duration || '',
          location: meeting.remarks || meeting.location || '',
          agenda: meeting.meetingDescription || meeting.agenda || '',
          status: meeting.status || 'Scheduled',
          meetingTypeId: meeting.meetingTypeId?._id || meeting.meetingTypeId
        };
      });
      
      return {
        meetings: transformedMeetings,
        meetingTypes: typesResponse.data || []
      };
    } catch (err) {
      console.error('Error fetching meetings:', err);
      throw new Error('Failed to load meeting data');
    }
  }

  // Create or update meeting
  static async saveMeeting(form, editingMeeting, meetingTypes) {
    try {
      // Ensure meetingTypeId exists
      let meetingTypeId = null;
      
      if (editingMeeting && editingMeeting.meetingTypeId) {
        meetingTypeId = editingMeeting.meetingTypeId;
      } else if (form.type) {
        const existing = meetingTypes.find((t) => 
          t.typeName === form.type || 
          t.meetingTypeName === form.type || 
          t.type === form.type
        );
        
        if (existing) {
          meetingTypeId = existing.id || existing._id;
        } else if (form.type) {
          // Create a new meeting type on the fly
          try {
            const created = await api.post('/meeting-types', { 
              meetingTypeName: form.type, 
              remarks: '' 
            });
            const newType = created.data || created;
            meetingTypeId = newType._id || newType.id;
          } catch (err) {
            console.error('Failed to create meeting type:', err);
            throw new Error('Failed to create meeting type: ' + err.message);
          }
        }
      }

      if (!meetingTypeId) {
        throw new Error('Meeting type is required');
      }

      // Combine date and time into proper Date objects for backend
      const meetingDateTime = new Date(`${form.date}T${form.time}`);

      const payload = {
        meetingDate: meetingDateTime.toISOString(),
        meetingTime: meetingDateTime.toISOString(),
        meetingTypeId,
        meetingTitle: form.title,
        meetingDescription: form.agenda || '',
        remarks: form.location || '',
        status: editingMeeting?.status || 'Scheduled'
      };

      if (editingMeeting) {
        await api.put(`/meetings/${editingMeeting.id}`, payload);
      } else {
        await api.post('/meetings', payload);
      }
      
      return true;
    } catch (err) {
      console.error('Save meeting error:', err);
      alert('Failed to save meeting: ' + err.message);
      return false;
    }
  }

  // Delete meeting
  static async deleteMeeting(id) {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await api.delete(`/meetings/${id}`);
        return true;
      } catch (err) {
        alert('Failed to delete meeting');
        return false;
      }
    }
    return false;
  }

  // Get status badge class
  static getStatusClass(status) {
    switch (status) {
      case 'Completed': return 'badge badge-success';
      case 'Scheduled': return 'badge badge-info';
      case 'Cancelled': return 'badge badge-danger';
      default: return 'badge';
    }
  }

  // Transform meeting for form
  static transformMeetingForForm(meeting) {
    return {
      title: meeting.title,
      type: meeting.type,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration || "",
      location: meeting.location || "",
      agenda: meeting.agenda || "",
    };
  }

  // Get default form values
  static getDefaultForm(meetingTypes) {
    return {
      title: "",
      type: meetingTypes[0]?.meetingTypeName || "",
      date: "",
      time: "",
      duration: "",
      location: "",
      agenda: "",
    };
  }
}

export default MeetingService;
