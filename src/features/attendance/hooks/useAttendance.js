import { useState, useCallback, useEffect } from 'react';
import { useApi } from '../../../shared/hooks/useApi';
import { useModal } from '../../../shared/hooks/useModal';
import { api } from '../../../shared/utils/api';
import { handleApiError } from '../../../shared/utils/errorHandler';

export const useAttendance = () => {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [newMember, setNewMember] = useState({ staffId: "", role: "Staff" });
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const apiHook = useApi();
  const modal = useModal();

  const fetchData = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError(null);
      
      const [meetingsResponse, staffResponse] = await Promise.all([
        api.get('/meetings?limit=50'),
        api.get('/staff')
      ]);
      
      setMeetings(meetingsResponse.data || []);
      setStaff(staffResponse.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(handleApiError(err) || 'Failed to load data');
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const fetchParticipants = useCallback(async () => {
    if (!selectedMeeting) return;

    try {
      const response = await apiHook.get(`/meetings/${selectedMeeting._id}/members`);
      setParticipants(response.data || []);
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError(handleApiError(err) || 'Failed to load participants');
    }
  }, [selectedMeeting, apiHook]);

  // Fetch meetings and staff on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch participants when meeting is selected
  useEffect(() => {
    if (selectedMeeting) {
      fetchParticipants();
    }
  }, [selectedMeeting, fetchParticipants]);

  const handleToggleAttendance = useCallback(async (participantId) => {
    try {
      const participant = participants.find(p => p._id === participantId);
      if (!participant) return;

      const newStatus = !participant.isPresent;
      await apiHook.put(`/meeting-members/${participantId}/attendance`, { isPresent: newStatus });
      
      setParticipants((prev) =>
        prev.map((p) =>
          p._id === participantId
            ? { ...p, isPresent: newStatus }
            : p
        )
      );
    } catch (err) {
      console.error('Error updating attendance:', err);
      const errorMessage = handleApiError(err) || 'Failed to update attendance';
      alert(errorMessage);
    }
  }, [participants, apiHook]);

  const handleAddMember = useCallback(async (e) => {
    e.preventDefault();
    if (!newMember.staffId) {
      alert("Please select a staff member.");
      return;
    }

    if (!selectedMeeting) {
      alert("Please select a meeting first.");
      return;
    }

    try {
      const response = await apiHook.post(`/meetings/${selectedMeeting._id}/members`, newMember);
      setParticipants((prev) => [response.data, ...prev]);
      setNewMember({ staffId: "", role: "Staff" });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding member:', err);
      const errorMessage = handleApiError(err) || 'Failed to add member';
      alert(errorMessage);
    }
  }, [newMember, selectedMeeting, apiHook]);

  const handleRemoveMember = useCallback(async (participantId) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await apiHook.delete(`/meeting-members/${participantId}`);
        setParticipants((prev) => prev.filter((p) => p._id !== participantId));
      } catch (err) {
        console.error('Error removing member:', err);
        const errorMessage = handleApiError(err) || 'Failed to remove member';
        alert(errorMessage);
      }
    }
  }, [apiHook]);

  return {
    selectedMeeting,
    showAddModal,
    showMarkModal,
    participants,
    meetings,
    staff,
    loading: apiHook.loading || initialLoading,
    error: error || apiHook.error,
    newMember,
    setSelectedMeeting,
    setShowAddModal,
    setShowMarkModal,
    setNewMember,
    fetchData,
    fetchParticipants,
    handleToggleAttendance,
    handleAddMember,
    handleRemoveMember,
    modal,
  };
};

export default useAttendance;

