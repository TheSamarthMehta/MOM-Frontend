import { api } from '../shared/utils/api';

export class DashboardService {
  static async fetchDashboardData() {
    try {
      const [dashboardResponse, meetingsResponse] = await Promise.all([
        api.get('/dashboard/overview'),
        api.get('/meetings?limit=10')
      ]);
      
      const stats = dashboardResponse.data?.overview || {
        upcoming: 1,
        completed: 1,
        cancelled: 1,
        pending: 1
      };
      
      const transformedMeetings = (meetingsResponse.data || []).map(meeting => {
        const meetingDate = meeting.meetingDate ? new Date(meeting.meetingDate) : null;
        const meetingTime = meeting.meetingTime ? new Date(meeting.meetingTime) : null;
        
        return {
          id: meeting._id || meeting.id,
          title: meeting.meetingTitle || 'Untitled Meeting',
          type: meeting.meetingTypeId?.meetingTypeName || meeting.meetingTypeId?.typeName || 'N/A',
          date: meetingDate ? meetingDate.toISOString().split('T')[0] : 'N/A',
          time: meetingTime ? meetingTime.toTimeString().slice(0, 5) : 'N/A',
          status: meeting.status || 'Scheduled'
        };
      });
      
      return {
        stats,
        meetings: transformedMeetings
      };
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      throw new Error(err.message || 'Failed to load dashboard data');
    }
  }

  static getStatusBadge(status) {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
    switch (status) {
      case 'Completed':
        return `${baseClasses} bg-success-100 text-success-800`;
      case 'Upcoming':
        return `${baseClasses} bg-primary-100 text-primary-800`;
      case 'Cancelled':
        return `${baseClasses} bg-danger-100 text-danger-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  }
}

export default DashboardService;
