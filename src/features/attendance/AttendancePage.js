import React, { useState, useEffect } from "react";
import { UserCheck, UserX, Users, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { api } from '../../shared/utils/api';

const AttendancePage = () => {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMember, setNewMember] = useState({ staffId: "", role: "Staff" });


  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [meetingsResponse, staffResponse] = await Promise.all([
          api.get('/meetings?limit=50'),
          api.get('/staff')
        ]);
        
        setMeetings(meetingsResponse.data || []);
        setStaff(staffResponse.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMeeting) {
      const fetchParticipants = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/meetings/${selectedMeeting._id}/members`);
          setParticipants(response.data || []);
        } catch (err) {
          console.error('Error fetching participants:', err);
          setError(err.message || 'Failed to load participants');
        } finally {
          setLoading(false);
        }
      };

      fetchParticipants();
    }
  }, [selectedMeeting]);

  const handleToggleAttendance = async (participantId) => {
    try {
      const participant = participants.find(p => p._id === participantId);
      if (!participant) return;

      const newStatus = !participant.isPresent;
      await api.put(`/meeting-members/${participantId}/attendance`, { isPresent: newStatus });
      
      setParticipants((prev) =>
        prev.map((p) =>
          p._id === participantId
            ? { ...p, isPresent: newStatus }
            : p
        )
      );
    } catch (err) {
      console.error('Error updating attendance:', err);
      alert(err.message || 'Failed to update attendance');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.staffId) {
      alert("Please select a staff member.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/meetings/${selectedMeeting._id}/members`, newMember);
      setParticipants((prev) => [response.data, ...prev]);
      setNewMember({ staffId: "", role: "Staff" });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding member:', err);
      alert(err.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (participantId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        setLoading(true);
        await api.delete(`/meeting-members/${participantId}`);
        setParticipants((prev) => prev.filter((p) => p._id !== participantId));
      } catch (err) {
        console.error('Error removing member:', err);
        alert(err.message || 'Failed to remove member');
      } finally {
        setLoading(false);
      }
    }
  };

  const stats = [
    { label: "Total Participants", value: participants.length, icon: Users, color: "blue" },
    { label: "Present", value: participants.filter((p) => p.isPresent).length, icon: UserCheck, color: "green" },
    { label: "Absent", value: participants.filter((p) => !p.isPresent).length, icon: UserX, color: "red" },
  ];

  const getStatusClass = (isPresent) => {
    return isPresent 
      ? "bg-green-100 text-green-700" 
      : "bg-red-100 text-red-700";
  };

  const getStatusText = (isPresent) => {
    return isPresent ? "Present" : "Absent";
  };

  if (loading && meetings.length === 0) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Attendance & Participants</h1>
        <p className="text-gray-600">Add meeting members, mark attendance, and view attendance summary.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className={`bg-white rounded-xl shadow p-6 border-l-4 border-${stat.color}-500`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <stat.icon size={32} className={`text-${stat.color}-500`} />
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Selection */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Meeting</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {meetings.map((meeting) => (
            <button
              key={meeting._id}
              onClick={() => setSelectedMeeting(meeting)}
              className={`p-4 rounded-lg border-2 text-left transition ${
                selectedMeeting?._id === meeting._id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="font-semibold text-gray-800">{meeting.meetingTitle}</div>
              <div className="text-sm text-gray-500">
                {meeting.meetingDate ? new Date(meeting.meetingDate).toLocaleDateString() : 'N/A'} • 
                {meeting.meetingTime ? new Date(meeting.meetingTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
              </div>
              <div className="text-xs text-gray-400 mt-2">{participants.length} members</div>
            </button>
          ))}
        </div>
      </div>

      {/* Participants List */}
      {selectedMeeting && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Participants - {selectedMeeting.meetingTitle}</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddModal(true)}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-sm font-semibold ${
                  loading 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                + Add Member
              </button>
              <button 
                onClick={() => setShowMarkModal(true)}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-sm font-semibold ${
                  loading 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Mark Attendance
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {participants.map((participant) => (
                  <tr key={participant._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-800">{participant.staffId?.staffName || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{participant.staffId?.emailAddress || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600">{participant.staffId?.role || participant.role || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusClass(participant.isPresent)}`}>
                        {getStatusText(participant.isPresent)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAttendance(participant._id)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm border transition ${participant.isPresent ? 'border-green-600 text-green-700 hover:bg-green-50' : 'border-blue-600 text-blue-700 hover:bg-blue-50'}`}
                          title="Toggle attendance"
                        >
                          {participant.isPresent ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                          {participant.isPresent ? 'Present' : 'Absent'}
                        </button>
                        <button
                          onClick={() => handleRemoveMember(participant._id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm border border-red-600 text-red-700 hover:bg-red-50 transition"
                          title="Remove from meeting"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Summary */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Attendance Summary</h2>
        <p className="text-gray-500">View complete attendance history across all meetings.</p>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Add Meeting Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Staff Member<span className="text-red-500">*</span>
                </label>
                <select
                  value={newMember.staffId}
                  onChange={(e) => setNewMember({ ...newMember, staffId: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a staff member</option>
                  {staff.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.staffName} ({member.emailAddress})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Staff</option>
                  <option>Convener</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto relative max-h-[80vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
              onClick={() => setShowMarkModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-lg font-bold mb-4 text-gray-800">Mark Attendance</h2>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-gray-800">{participant.staffId?.staffName || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{participant.staffId?.emailAddress || 'N/A'}</div>
                    <div className="text-xs text-gray-400">Role: {participant.staffId?.role || participant.role || 'N/A'}</div>
                  </div>
                  <button
                    onClick={() => handleToggleAttendance(participant._id)}
                    className={`px-4 py-2 rounded-md text-sm font-semibold ${
                      participant.isPresent
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {getStatusText(participant.isPresent)}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
                onClick={() => setShowMarkModal(false)}
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
