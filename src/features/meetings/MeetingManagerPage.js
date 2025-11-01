import React, { useEffect, useState } from "react";
import { useMeetings } from "./hooks/useMeetings";
import { useForm } from "../../shared/hooks/useForm";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import ErrorMessage from "../../shared/components/ErrorMessage";
import Modal from "../../shared/components/Modal";
import PageHeader from "../../shared/components/PageHeader";
import DataTable from "../../shared/components/DataTable";
import { FormInput, FormSelect, FormTextArea, FormButton } from "../../shared/components/FormComponents";
import { ActionIcons } from "../../shared/components/ActionIcons";
import { StatusBadge } from "../../shared/components/StatusBadge";
import { MeetingTransformer } from "../../shared/utils/dataTransformers";
import { schemas } from "../../shared/utils/validators";
import { MEETING_STATUS } from "../../shared/constants/enums";
import { notify } from "../../shared/utils/notifications";

const MeetingManagerPage = () => {
  const {
    meetingTypes,
    loading: apiLoading,
    error: apiError,
    fetchAll,
    saveMeeting,
    deleteMeeting,
    modal,
  } = useMeetings();

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form management
  const initialFormValues = {
    title: "",
    type: meetingTypes[0]?.meetingTypeName || "",
    date: "",
    time: "",
    duration: "",
    location: "",
    agenda: "",
  };

  const form = useForm(
    initialFormValues,
    async (values) => {
      try {
        await saveMeeting(values, modal.data);
        await loadData();
        modal.close();
        notify.success(modal.data ? 'Meeting updated successfully' : 'Meeting created successfully');
      } catch (err) {
        notify.error(err.message || 'Failed to save meeting');
      }
    },
    schemas.meeting
  );

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const { meetings: fetchedMeetings } = await fetchAll();
      setMeetings(fetchedMeetings || []);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load meetings:', err);
      }
      notify.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update form when meeting types change
  useEffect(() => {
    if (meetingTypes.length > 0 && !form.values.type) {
      form.setValue('type', meetingTypes[0].meetingTypeName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingTypes]);

  // Handlers
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteMeeting(id);
        await loadData();
        notify.success('Meeting deleted successfully');
      } catch (err) {
        notify.error(err.message || 'Failed to delete meeting');
      }
    }
  };

  const openCreateModal = () => {
    form.reset(initialFormValues);
    modal.open(null);
  };

  const openEditModal = (meeting) => {
    const formData = MeetingTransformer.toFormFormat(meeting);
    form.reset(formData);
    modal.open(meeting);
  };

  const handleModalClose = () => {
    modal.close();
    form.reset(initialFormValues);
  };

  if (loading || apiLoading) {
    return <LoadingSpinner text="Loading meetings..." fullScreen />;
  }

  if (apiError) {
    return <ErrorMessage error={apiError} onRetry={loadData} />;
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
      render: (value) => <StatusBadge status={value || MEETING_STATUS.SCHEDULED} />
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
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        title={modal.data ? 'Edit Meeting' : 'Create Meeting'}
        size="lg"
      >
        <form onSubmit={form.handleSubmit} className="space-y-6">
          <FormInput
            label="Title"
            value={form.values.title}
            onChange={(e) => form.handleChange('title', e.target.value)}
            onBlur={() => form.handleBlur('title')}
            placeholder="Enter meeting title"
            required
            error={form.touched.title && form.errors.title}
          />
          
          <FormSelect
            label="Type"
            value={form.values.type}
            onChange={(e) => form.handleChange('type', e.target.value)}
            onBlur={() => form.handleBlur('type')}
            options={meetingTypes.map(type => ({
              value: type.meetingTypeName,
              label: type.meetingTypeName
            }))}
            placeholder="Select type"
            required
            error={form.touched.type && form.errors.type}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date"
              type="date"
              value={form.values.date}
              onChange={(e) => form.handleChange('date', e.target.value)}
              onBlur={() => form.handleBlur('date')}
              required
              error={form.touched.date && form.errors.date}
            />
            
            <FormInput
              label="Time"
              type="time"
              value={form.values.time}
              onChange={(e) => form.handleChange('time', e.target.value)}
              onBlur={() => form.handleBlur('time')}
              required
              error={form.touched.time && form.errors.time}
            />
          </div>
          
          <FormInput
            label="Duration (minutes)"
            type="number"
            value={form.values.duration}
            onChange={(e) => form.handleChange('duration', e.target.value)}
            placeholder="e.g., 60"
          />
          
          <FormInput
            label="Location"
            value={form.values.location}
            onChange={(e) => form.handleChange('location', e.target.value)}
            placeholder="Meeting location"
          />
          
          <FormTextArea
            label="Agenda"
            value={form.values.agenda}
            onChange={(e) => form.handleChange('agenda', e.target.value)}
            placeholder="Meeting agenda"
            rows={4}
          />

          {form.errors._submit && (
            <div className="text-red-600 text-sm">{form.errors._submit}</div>
          )}
          
          <div className="flex gap-3 pt-4">
            <FormButton
              type="submit"
              className="flex-1"
              loading={form.isSubmitting}
            >
              {modal.data ? 'Update Meeting' : 'Create Meeting'}
            </FormButton>
            <FormButton
              type="button"
              variant="secondary"
              onClick={handleModalClose}
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
