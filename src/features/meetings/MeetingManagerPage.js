import React, { useState, useEffect } from "react";
import { api } from '../../shared/utils';
import MeetingService from '../../api/meetingService';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  Modal, 
  PageHeader, 
  DataTable, 
  FormInput, 
  FormSelect, 
  FormTextArea, 
  FormButton,
  ActionIcons 
} from '../../shared/components';

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
                const created = await api.post('/meeting-types', { 
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
        await api.put(`/meetings/${editingMeeting.id}`, payload);
      } else {
        await api.post('/meetings', payload);
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
        await api.delete(`/meetings/${id}`);
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
    return <LoadingSpinner text="Loading meetings..." fullScreen />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchData} />;
  }

  const createButton = (
    <button 
      onClick={openCreateModal}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
    >
      <ActionIcons.Add size={20} className="text-white" />
      Create Meeting
    </button>
  );

  const tableColumns = [
    {
      key: 'title',
      header: 'Title',
      render: (value, meeting) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            {meeting.agenda && (
              <div className="text-xs text-gray-500 truncate max-w-xs">{meeting.agenda}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      render: (value) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    {
      key: 'date',
      header: 'Date',
      render: (value) => <span className="text-sm text-gray-600">{value}</span>
    },
    {
      key: 'time',
      header: 'Time',
      render: (value) => <span className="text-sm text-gray-600">{value}</span>
    },
    {
      key: 'location',
      header: 'Location',
      render: (value) => <span className="text-sm text-gray-600">{value || 'N/A'}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'Completed' ? 'bg-green-100 text-green-800' :
          value === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
          value === 'Cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, meeting) => (
        <div className="flex items-center gap-2">
          <ActionIcons.Edit onClick={() => openEditModal(meeting)} />
          <ActionIcons.Delete onClick={() => handleDelete(meeting.id)} />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader 
        title="Meeting Manager"
        subtitle="Create and manage your meetings"
        actionButton={createButton}
      />

      <DataTable
        columns={tableColumns}
        data={meetings}
        emptyMessage="No meetings found"
        emptyIcon={
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingMeeting ? 'Edit Meeting' : 'Create Meeting'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter meeting title"
            required
          />
          
          <FormSelect
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={meetingTypes.map(type => ({
              value: type.meetingTypeName,
              label: type.meetingTypeName
            }))}
            placeholder="Select type"
            required
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            
            <FormInput
              label="Time"
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </div>
          
          <FormInput
            label="Duration (minutes)"
            type="number"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="e.g., 60"
          />
          
          <FormInput
            label="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Meeting location"
          />
          
          <FormTextArea
            label="Agenda"
            value={form.agenda}
            onChange={(e) => setForm({ ...form, agenda: e.target.value })}
            placeholder="Meeting agenda"
            rows={4}
          />
          
          <div className="flex gap-3 pt-4">
            <FormButton
              type="submit"
              className="flex-1"
            >
              {editingMeeting ? 'Update Meeting' : 'Create Meeting'}
            </FormButton>
            <FormButton
              type="button"
              variant="secondary"
              onClick={closeModal}
              className="flex-1"
            >
              Cancel
            </FormButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MeetingManagerPage;
