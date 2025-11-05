import { useState, useCallback, useEffect } from 'react';
import { useApi } from '../../../shared/hooks/useApi';
import { api } from '../../../shared/utils/api';
import { handleApiError } from '../../../shared/utils/errorHandler';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Helper function to get week start (Monday) and end (Sunday) dates
const getWeekDates = (offset = 0) => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Adjust to get Monday
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + daysToMonday + (offset * 7));
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Sunday (6 days after Monday)
  weekEnd.setHours(23, 59, 59, 999);
  
  return {
    from: weekStart.toISOString().split('T')[0],
    to: weekEnd.toISOString().split('T')[0]
  };
};

export const useReports = () => {
  const [reportType, setReportType] = useState("summary");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = previous week, etc.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [summaryData, setSummaryData] = useState([]);
  const [meetingsRaw, setMeetingsRaw] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [selectedMeetingMembers, setSelectedMeetingMembers] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [cancelledMeetings, setCancelledMeetings] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

  const apiHook = useApi();

  // Initialize with current week on mount
  useEffect(() => {
    const currentWeek = getWeekDates(0);
    setDateRange(currentWeek);
  }, []);

  // Update date range when week offset changes
  useEffect(() => {
    const weekDates = getWeekDates(weekOffset);
    setDateRange(weekDates);
  }, [weekOffset]);

  // Fetch dashboard stats on mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/dashboard/overview');
        setDashboardStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(handleApiError(err) || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const navigateWeek = useCallback((direction) => {
    setWeekOffset(prev => direction === 'next' ? prev + 1 : prev - 1);
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setWeekOffset(0);
  }, []);

  const handleDateRangeChange = useCallback((newFrom, newTo) => {
    if (newFrom) {
      const fromDate = new Date(newFrom);
      // Set end date to 6 days after start (week range)
      const toDate = new Date(fromDate);
      toDate.setDate(fromDate.getDate() + 6);
      setDateRange({ 
        from: newFrom, 
        to: toDate.toISOString().split('T')[0]
      });
      // Recalculate week offset if user manually changes date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      fromDate.setHours(0, 0, 0, 0);
      const diffTime = fromDate - today;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      setWeekOffset(diffWeeks);
    } else if (newTo) {
      setDateRange((prev) => ({ ...prev, to: newTo }));
    }
  }, []);

  const generateSummaryReport = useCallback(async () => {
    try {
      const response = await api.get(`/meetings?limit=100&startDate=${dateRange.from}&endDate=${dateRange.to}`);
      const meetings = response.data || [];
      setMeetingsRaw(meetings);
      const summary = meetings.map(meeting => ({
        _id: meeting._id,
        meeting: meeting.meetingTitle,
        date: meeting.meetingDate ? new Date(meeting.meetingDate).toLocaleDateString() : 'N/A',
        participants: meeting.participants?.length || meeting.memberCount || 0,
        duration: meeting.meetingDuration || 'N/A',
        status: meeting.meetingStatus || 'Scheduled'
      }));
      
      setSummaryData(summary);
    } catch (err) {
      console.error('Error generating summary report:', err);
      throw err;
    }
  }, [dateRange]);

  const loadSelectedMeetingAttendance = useCallback(async () => {
    if (!selectedMeetingId) return;
    try {
      setLoading(true);
      const membersResponse = await apiHook.get(`/meetings/${selectedMeetingId}/members`);
      setSelectedMeetingMembers(membersResponse.data || []);
    } catch (err) {
      console.error('Error loading meeting attendance:', err);
      setError(handleApiError(err) || 'Failed to load meeting attendance');
    } finally {
      setLoading(false);
    }
  }, [selectedMeetingId, apiHook]);

  const generateAttendanceReport = useCallback(async () => {
    try {
      const meetingsResponse = await api.get(`/meetings?limit=100&startDate=${dateRange.from}&endDate=${dateRange.to}`);
      
      const meetings = meetingsResponse.data || [];
      const staffResponse = await api.get('/staff');
      const staff = staffResponse.data || [];
      
      const attendanceStats = await Promise.all(
        staff.map(async (member) => {
          let totalMeetings = 0;
          let attended = 0;
          
          for (const meeting of meetings) {
            try {
              const membersResponse = await api.get(`/meetings/${meeting._id}/members`);
              const members = membersResponse.data || [];
              const memberInMeeting = members.find(m => m.staffId?._id === member._id);
              
              if (memberInMeeting) {
                totalMeetings++;
                if (memberInMeeting.isPresent) {
                  attended++;
                }
              }
            } catch (err) {
              console.error(`Error fetching members for meeting ${meeting._id}:`, err);
            }
          }
          
          const percentage = totalMeetings > 0 ? Math.round((attended / totalMeetings) * 100) : 0;
          
          return {
            name: member.staffName,
            totalMeetings,
            attended,
            absent: totalMeetings - attended,
            percentage: `${percentage}%`
          };
        })
      );
      
      setAttendanceData(attendanceStats.filter(stat => stat.totalMeetings > 0));
    } catch (err) {
      console.error('Error generating attendance report:', err);
      throw err;
    }
  }, [dateRange]);

  const generateCancelledReport = useCallback(async () => {
    try {
      const response = await api.get(`/meetings?limit=100&startDate=${dateRange.from}&endDate=${dateRange.to}`);
      
      const meetings = response.data || [];
      const cancelled = meetings
        .filter(meeting => meeting.meetingStatus === 'Cancelled')
        .map(meeting => ({
          meeting: meeting.meetingTitle,
          scheduledDate: meeting.meetingDate ? new Date(meeting.meetingDate).toLocaleDateString() : 'N/A',
          reason: meeting.cancellationReason || 'No reason provided',
          cancelledBy: meeting.cancelledBy || 'Unknown'
        }));
      
      setCancelledMeetings(cancelled);
    } catch (err) {
      console.error('Error generating cancelled report:', err);
      throw err;
    }
  }, [dateRange]);

  const generateReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      switch (reportType) {
        case "summary":
          await generateSummaryReport();
          break;
        case "attendance":
          await generateAttendanceReport();
          break;
        case "cancelled":
          await generateCancelledReport();
          break;
        case "export":
          // No need to do anything here, the export buttons will handle it
          break;
        default:
          break;
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(handleApiError(err) || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  }, [reportType, generateSummaryReport, generateAttendanceReport, generateCancelledReport]);

  const handleExportExcel = useCallback(() => {
    let data = [];
    let sheetName = 'Report';
    let fileName = 'report.xlsx';

    switch (reportType) {
      case 'summary':
        data = summaryData;
        sheetName = 'Meeting Summary';
        fileName = 'meeting_summary_report.xlsx';
        break;
      case 'attendance':
        data = attendanceData;
        sheetName = 'Attendance Report';
        fileName = 'attendance_report.xlsx';
        break;
      case 'cancelled':
        data = cancelledMeetings;
        sheetName = 'Cancelled Meetings';
        fileName = 'cancelled_meetings_report.xlsx';
        break;
      default:
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
  }, [reportType, summaryData, attendanceData, cancelledMeetings]);

  const handleExportPdf = useCallback(() => {
    let columns = [];
    let data = [];
    let title = 'Report';

    switch (reportType) {
      case 'summary':
        title = 'Meeting Summary Report';
        columns = [
          { title: 'Meeting', dataKey: 'meeting' },
          { title: 'Date', dataKey: 'date' },
          { title: 'Participants', dataKey: 'participants' },
          { title: 'Duration', dataKey: 'duration' },
          { title: 'Status', dataKey: 'status' },
        ];
        data = summaryData;
        break;
      case 'attendance':
        title = 'Attendance Report';
        columns = [
          { title: 'Participant', dataKey: 'name' },
          { title: 'Total Meetings', dataKey: 'totalMeetings' },
          { title: 'Attended', dataKey: 'attended' },
          { title: 'Absent', dataKey: 'absent' },
          { title: 'Percentage', dataKey: 'percentage' },
        ];
        data = attendanceData;
        break;
      case 'cancelled':
        title = 'Cancelled Meeting Report';
        columns = [
          { title: 'Meeting', dataKey: 'meeting' },
          { title: 'Scheduled Date', dataKey: 'scheduledDate' },
          { title: 'Reason', dataKey: 'reason' },
          { title: 'Cancelled By', dataKey: 'cancelledBy' },
        ];
        data = cancelledMeetings;
        break;
      default:
        return;
    }

    const doc = new jsPDF();
    doc.text(title, 14, 16);
    doc.autoTable({
      head: [columns.map(c => c.title)],
      body: data.map(row => columns.map(c => row[c.dataKey])),
      startY: 20,
    });
    doc.save('report.pdf');
  }, [reportType, summaryData, attendanceData, cancelledMeetings]);

  return {
    reportType,
    dateRange,
    weekOffset,
    loading,
    error,
    summaryData,
    meetingsRaw,
    selectedMeetingId,
    selectedMeetingMembers,
    attendanceData,
    cancelledMeetings,
    dashboardStats,
    setReportType,
    setSelectedMeetingId,
    navigateWeek,
    goToCurrentWeek,
    handleDateRangeChange,
    generateReport,
    loadSelectedMeetingAttendance,
    handleExportExcel,
    handleExportPdf,
  };
};

export default useReports;

