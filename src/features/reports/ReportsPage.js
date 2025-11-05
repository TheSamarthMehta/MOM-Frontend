import React from "react";
import { FileText, TrendingUp, XCircle, Download, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useReports } from './hooks/useReports';

const ReportsPage = () => {
  const {
    reportType,
    dateRange,
    weekOffset,
    loading,
    error,
    summaryData,
    selectedMeetingId,
    selectedMeetingMembers,
    attendanceData,
    cancelledMeetings,
    setReportType,
    setSelectedMeetingId,
    navigateWeek,
    goToCurrentWeek,
    handleDateRangeChange,
    generateReport,
    loadSelectedMeetingAttendance,
    handleExportExcel,
    handleExportPdf,
  } = useReports();

  const reportCards = [
    { title: "Meeting Summary Report", icon: FileText, description: "Overview of all meetings with key metrics", type: "summary", color: "blue" },
    { title: "Attendance Report", icon: TrendingUp, description: "Meeting-wise attendance analysis", type: "attendance", color: "green" },
    { title: "Cancelled Meeting Report", icon: XCircle, description: "List of all cancelled meetings", type: "cancelled", color: "red" },
    { title: "Export Reports", icon: Download, description: "Export data to Excel or PDF", type: "export", color: "purple" },
  ];

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
                onChange={(e) => handleDateRangeChange(e.target.value, null)}
                className="px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => handleDateRangeChange(null, e.target.value)}
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