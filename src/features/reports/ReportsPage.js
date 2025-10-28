import React, { useState, useEffect } from "react";
import { FileText, TrendingUp, XCircle, Download, Calendar } from "lucide-react";
import { api } from '../../shared/utils';

const ReportsPage = () => {
  const [reportType, setReportType] = useState("summary");
  const [dateRange, setDateRange] = useState({ from: "2025-10-01", to: "2025-10-19" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [summaryData, setSummaryData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [cancelledMeetings, setCancelledMeetings] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);

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
          await handleExport();
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
      const summary = meetings.map(meeting => ({
        meeting: meeting.meetingTitle,
        date: meeting.meetingDate ? new Date(meeting.meetingDate).toLocaleDateString() : 'N/A',
        participants: meeting.participants?.length || 0,
        duration: meeting.meetingDuration || 'N/A',
        status: meeting.meetingStatus || 'Scheduled'
      }));
      
      setSummaryData(summary);
    } catch (err) {
      console.error('Error generating summary report:', err);
      throw err;
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

  const handleExport = async () => {
    try {
      alert('Export functionality would be implemented with backend export APIs.\nThis would generate and download Excel/PDF files.');
    } catch (err) {
      console.error('Error exporting data:', err);
      throw err;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h1>
        <p className="text-gray-600">Meeting summary report, attendance report meeting-wise, cancelled meeting report, and export to Excel/PDF.</p>
      </div>

      {/* Report Type Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((card) => (
          <button
            key={card.type}
            onClick={() => setReportType(card.type)}
            className={`p-6 rounded-xl shadow text-left transition ${
              reportType === card.type
                ? `bg-${card.color}-500 text-white`
                : "bg-white hover:shadow-lg"
            }`}
          >
            <card.icon size={32} className={reportType === card.type ? "text-white" : `text-${card.color}-500`} />
            <h3 className={`font-semibold mt-4 ${reportType === card.type ? "text-white" : "text-gray-800"}`}>
              {card.title ? card.title : '-'}
            </h3>
            <p className={`text-sm mt-2 ${reportType === card.type ? "text-white/90" : "text-gray-600"}`}>
              {card.description}
            </p>
          </button>
        ))}
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-gray-600" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={generateReport}
            disabled={loading}
            className={`px-4 py-2 rounded-md font-semibold ml-auto ${
              loading 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
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
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No meetings found for the selected date range
                      </td>
                    </tr>
                  ) : (
                    summaryData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">{row.meeting}</td>
                        <td className="px-4 py-3 text-gray-600">{row.date}</td>
                        <td className="px-4 py-3 text-gray-600">{row.participants}</td>
                        <td className="px-4 py-3 text-gray-600">{row.duration}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            row.status === "Completed" ? "bg-green-100 text-green-700" : 
                            row.status === "Cancelled" ? "bg-red-100 text-red-700" : 
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
              <p className="text-sm text-gray-600 mb-4">Download report data in Excel format (.xlsx)</p>
              <button 
                onClick={() => alert('Exporting to Excel...\n(This would download an Excel file in a real application)')}
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
                onClick={() => alert('Exporting to PDF...\n(This would download a PDF file in a real application)')}
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
