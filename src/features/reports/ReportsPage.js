import React, { useState, useEffect } from "react";
import { FileText, TrendingUp, XCircle, Download, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from '../../shared/utils/api';
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

const ReportsPage = () => {
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

  const reportCards = [
    { title: "Meeting Summary Report", icon: FileText, description: "Overview of all meetings with key metrics", type: "summary", color: "blue" },
    { title: "Attendance Report", icon: TrendingUp, description: "Meeting-wise attendance analysis", type: "attendance", color: "green" },
    { title: "Cancelled Meeting Report", icon: XCircle, description: "List of all cancelled meetings", type: "cancelled", color: "red" },
    { title: "Export Reports", icon: Download, description: "Export data to Excel or PDF", type: "export", color: "purple" },
  ];

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/dashboard/overview');
        setDashboardStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const navigateWeek = (direction) => {
    setWeekOffset(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  const goToCurrentWeek = () => {
    setWeekOffset(0);
  };

  const generateReport = async () => {
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
      setError(err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const generateSummaryReport = async () => {
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
  };

  const loadSelectedMeetingAttendance = async () => {
    if (!selectedMeetingId) return;
    try {
      setLoading(true);
      const membersResponse = await api.get(`/meetings/${selectedMeetingId}/members`);
      setSelectedMeetingMembers(membersResponse.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load meeting attendance');
    } finally {
      setLoading(false);
    }
  };

  const generateAttendanceReport = async () => {
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
  };

  const generateCancelledReport = async () => {
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
  };

  const handleExportExcel = () => {
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
  };

  const handleExportPdf = () => {
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
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Meeting summary report, attendance report meeting-wise, cancelled meeting report, and export to Excel/PDF.</p>
      </div>

      {/* Report Type Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card) => {
          const colorClasses = {
            blue: {
              bg: 'bg-blue-500',
              text: 'text-blue-500',
              hover: 'hover:border-blue-500'
            },
            green: {
              bg: 'bg-green-500',
              text: 'text-green-500',
              hover: 'hover:border-green-500'
            },
            red: {
              bg: 'bg-red-500',
              text: 'text-red-500',
              hover: 'hover:border-red-500'
            },
            purple: {
              bg: 'bg-purple-500',
              text: 'text-purple-500',
              hover: 'hover:border-purple-500'
            }
          };
          const colors = colorClasses[card.color] || colorClasses.blue;
          
          return (
            <button
              key={card.type}
              onClick={() => setReportType(card.type)}
              className={`p-6 rounded-xl shadow text-left transition ${
                reportType === card.type
                  ? `${colors.bg} text-white`
                  : `bg-white hover:shadow-lg ${colors.hover}`
              }`}
            >
              <card.icon size={32} className={reportType === card.type ? "text-white" : colors.text} />
              <h3 className={`font-semibold mt-4 ${reportType === card.type ? "text-white" : "text-gray-800"}`}>
                {card.title ? card.title : '-'}
              </h3>
              <p className={`text-sm mt-2 ${reportType === card.type ? "text-white/90" : "text-gray-600"}`}>
                {card.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex flex-col gap-4">
          {/* Week Navigation */}
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Week Navigation:</span>
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Previous Week"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <button
              onClick={goToCurrentWeek}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                weekOffset === 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Current Week
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Next Week"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
            <span className="text-sm text-gray-600 ml-2">
              {weekOffset === 0 ? 'This Week' : weekOffset < 0 ? `${Math.abs(weekOffset)} Week${Math.abs(weekOffset) > 1 ? 's' : ''} Ago` : `Next ${weekOffset} Week${weekOffset > 1 ? 's' : ''}`}
            </span>
          </div>

          {/* Date Range Display */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => {
                  const newFrom = e.target.value;
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
                }}
                className="px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => {
                  const newTo = e.target.value;
                  setDateRange({ ...dateRange, to: newTo });
                }}
                className="px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={generateReport}
              disabled={loading || !dateRange.from || !dateRange.to}
              className={`px-4 py-2 rounded-md font-semibold ml-auto ${
                loading || !dateRange.from || !dateRange.to
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Meeting Summary Report */}
      {reportType === "summary" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Meeting Summary Report</h2>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading summary data...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700 w-12">Select</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Meeting</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Participants</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Duration</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summaryData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No meetings found for the selected date range
                      </td>
                    </tr>
                  ) : (
                    summaryData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input type="radio" name="selectedMeeting" checked={selectedMeetingId === row._id} onChange={() => setSelectedMeetingId(row._id)} />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{row.meeting}</td>
                        <td className="px-4 py-3 text-gray-600">{row.date}</td>
                        <td className="px-4 py-3 text-gray-600">{row.participants}</td>
                        <td className="px-4 py-3 text-gray-600">{row.duration}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${row.status === "Completed" ? "bg-green-100 text-green-700" : row.status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <button onClick={loadSelectedMeetingAttendance} disabled={!selectedMeetingId || loading} className={`px-4 py-2 rounded-md font-semibold ${!selectedMeetingId || loading ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {loading ? 'Loading...' : 'Generate Meeting Report'}
                </button>
              </div>

              {selectedMeetingId && (
                <div className="mt-8">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Attendance Details</h3>
                  {selectedMeetingMembers.length === 0 ? (
                    <div className="text-gray-500 text-sm">No members found for this meeting or not loaded yet.</div>
                  ) : (
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">Name</th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">Email</th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">Role</th>
                          <th className="px-4 py-2 text-left text-gray-700 font-semibold">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedMeetingMembers.map((m) => (
                          <tr key={m._id} className="hover:bg-gray-50">
                            <td className="px-4 py-2">{m.staffId?.staffName || 'N/A'}</td>
                            <td className="px-4 py-2 text-gray-600">{m.staffId?.emailAddress || 'N/A'}</td>
                            <td className="px-4 py-2 text-gray-600">{m.role || m.staffId?.role || 'N/A'}</td>
                            <td className="px-4 py-2"><span className={`px-2 py-1 rounded text-xs font-semibold ${m.isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.isPresent ? 'Present' : 'Absent'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Attendance Report */}
      {reportType === "attendance" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendance Report Meeting Wise</h2>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Calculating attendance data...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Participant</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Total Meetings</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Attended</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Absent</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No attendance data found for the selected date range
                      </td>
                    </tr>
                  ) : (
                    attendanceData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                        <td className="px-4 py-3 text-gray-600">{row.totalMeetings}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">{row.attended}</td>
                        <td className="px-4 py-3 text-red-600 font-semibold">{row.absent}</td>
                        <td className="px-4 py-3 text-gray-800 font-semibold">{row.percentage}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cancelled Meetings Report */}
      {reportType === "cancelled" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cancelled Meeting Report</h2>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading cancelled meetings...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Meeting</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Scheduled Date</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Reason</th>
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">Cancelled By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cancelledMeetings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        No cancelled meetings found for the selected date range
                      </td>
                    </tr>
                  ) : (
                    cancelledMeetings.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{row.meeting}</td>
                        <td className="px-4 py-3 text-gray-600">{row.scheduledDate}</td>
                        <td className="px-4 py-3 text-gray-600">{row.reason}</td>
                        <td className="px-4 py-3 text-gray-600">{row.cancelledBy}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Export Section */}
      {reportType === "export" && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Export to Excel / PDF</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition">
              <Download size={48} className="mx-auto text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Export to Excel</h3>
              <p className="text-sm text-gray-600 mb-4">Download report data in Excel format (.xlsx)</p>.
              <button 
                onClick={handleExportExcel}
                className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                Download Excel
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition">
              <Download size={48} className="mx-auto text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-800 mb-2">Export to PDF</h3>
              <p className="text-sm text-gray-600 mb-4">Download report data in PDF format</p>
              <button 
                onClick={handleExportPdf}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;