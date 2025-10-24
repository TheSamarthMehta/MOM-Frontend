import React, { useState, useEffect } from "react";
import { meetingAPI, meetingTypeAPI } from '../api';

const MeetingManagerPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [meetingTypes, setMeetingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [form, setForm] = useState({
    title: "",
    type: "",
    date: "",
    time: "",
    duration: "",
    location: "",
    agenda: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meetingsResponse, typesResponse] = await Promise.all([
        meetingAPI.getAllMeetings({ limit: 50 }),
        meetingTypeAPI.getAllMeetingTypes()
      ]);
      
      // Transform backend data to frontend format
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
      
      setMeetings(transformedMeetings);
      setMeetingTypes(typesResponse.data || []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Map local form fields to backend expected payload
      const buildPayload = async () => {
        // Ensure meetingTypeId exists: if form.type matches an existing typeName, use its id
        let meetingTypeId = null;
        
        // If editing, try to use the existing meetingTypeId first
        if (editingMeeting && editingMeeting.meetingTypeId) {
          meetingTypeId = editingMeeting.meetingTypeId;
        }
        
        // Otherwise find or create the meeting type
        if (!meetingTypeId) {
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
              const created = await meetingTypeAPI.createMeetingType({ 
                meetingTypeName: form.type, 
                remarks: '' 
              });
              const newType = created.data || created;
              meetingTypeId = newType._id || newType.id;
              // update local list so UI reflects new type
              setMeetingTypes((prev) => [...prev, newType]);
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

        return {
          meetingDate: meetingDateTime.toISOString(),
          meetingTime: meetingDateTime.toISOString(),
          meetingTypeId,
          meetingTitle: form.title,
          meetingDescription: form.agenda || '',
          remarks: form.location || '',
          status: editingMeeting?.status || 'Scheduled'
        };
      };

      const payload = await buildPayload();
      console.log('Submitting payload:', payload);

      if (editingMeeting) {
        await meetingAPI.updateMeeting(editingMeeting.id, payload);
      } else {
        await meetingAPI.createMeeting(payload);
      }
      fetchData();
      closeModal();
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to save meeting: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await meetingAPI.deleteMeeting(id);
        fetchData();
      } catch (err) {
        alert('Failed to delete meeting');
      }
    }
  };

  const openCreateModal = () => {
    setEditingMeeting(null);
    setForm({
      title: "",
      type: meetingTypes[0]?.meetingTypeName || "",
      date: "",
      time: "",
      duration: "",
      location: "",
      agenda: "",
    });
    setShowModal(true);
  };

  const openEditModal = (meeting) => {
    setEditingMeeting(meeting);
    setForm({
      title: meeting.title,
      type: meeting.type,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration || "",
      location: meeting.location || "",
      agenda: meeting.agenda || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMeeting(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge badge-success';
      case 'Scheduled': return 'badge badge-info';
      case 'Cancelled': return 'badge badge-danger';
      default: return 'badge';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-24 mb-8"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Error Loading Meeting Data</h3>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Meeting Manager</h1>
            <p className="text-gray-600 mt-2">Create and manage your meetings</p>
          </div>
          <button 
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Meeting
          </button>
        </div>
      </div>

      {/* Meetings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {meetings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
            <p className="text-gray-500 mb-6">Create your first meeting to get started!</p>
            <button 
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Create Meeting
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {meetings.map((meeting) => (
                  <tr key={meeting.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{meeting.title}</div>
                          {meeting.agenda && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">{meeting.agenda}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {meeting.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{meeting.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{meeting.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{meeting.location || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        meeting.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        meeting.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        meeting.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {meeting.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openEditModal(meeting)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(meeting.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingMeeting ? 'Edit Meeting' : 'Create Meeting'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter meeting title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                >
                  <option value="">Select type</option>
                  {meetingTypes.map((type) => (
                    <option key={type._id || type.id} value={type.meetingTypeName}>
                      {type.meetingTypeName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., 60"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Meeting location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agenda</label>
                <textarea
                  value={form.agenda}
                  onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Meeting agenda"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  {editingMeeting ? 'Update Meeting' : 'Create Meeting'}
                </button>
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingManagerPage;
