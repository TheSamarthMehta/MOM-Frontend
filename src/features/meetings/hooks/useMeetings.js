import { useState, useCallback } from 'react';
import { useApi, useModal } from '../../../shared/hooks';
import { api } from '../../../shared/utils';
import { MeetingTransformer } from '../../../shared/utils/dataTransformers';
import { handleApiError } from '../../../shared/utils/errorHandler';

/**
 * Custom hook for managing meetings
 */
export const useMeetings = () => {
  const [meetingTypes, setMeetingTypes] = useState([]);
  const apiHook = useApi();
  const modal = useModal();

  // Fetch meetings
  const fetchMeetings = useCallback(async () => {
    try {
      const response = await api.get('/meetings?limit=50');
      return MeetingTransformer.transformMany(response.data || []);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // Fetch meeting types
  const fetchMeetingTypes = useCallback(async () => {
    try {
      const response = await api.get('/meeting-types');
      const types = response.data || [];
      setMeetingTypes(types);
      return types;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // Fetch both meetings and types
  const fetchAll = useCallback(async () => {
    try {
      const [meetings, types] = await Promise.all([
        fetchMeetings(),
        fetchMeetingTypes(),
      ]);
      return { meetings, types };
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, [fetchMeetings, fetchMeetingTypes]);

  // Create or find meeting type
  const ensureMeetingType = useCallback(async (typeName) => {
    if (!typeName) throw new Error('Meeting type is required');

    // Find existing type
    const existing = meetingTypes.find(
      (t) => t.meetingTypeName === typeName || 
             t.typeName === typeName ||
             t.type === typeName
    );

    if (existing) {
      return existing._id || existing.id;
    }

    // Create new type
    try {
      const response = await api.post('/meeting-types', {
        meetingTypeName: typeName,
        remarks: '',
      });
      const newType = response.data || response;
      const typeId = newType._id || newType.id;
      
      // Update local state
      setMeetingTypes((prev) => [...prev, newType]);
      
      return typeId;
    } catch (err) {
      throw new Error(`Failed to create meeting type: ${handleApiError(err)}`);
    }
  }, [meetingTypes]);

  // Save meeting (create or update)
  const saveMeeting = useCallback(async (formData, editingMeeting = null) => {
    try {
      const meetingTypeId = await ensureMeetingType(formData.type);
      
      const payload = MeetingTransformer.toAPIFormat(formData, meetingTypeId);
      
      if (editingMeeting) {
        await apiHook.put(`/meetings/${editingMeeting.id}`, payload);
      } else {
        await apiHook.post('/meetings', payload);
      }
      
      return true;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, [ensureMeetingType, apiHook]);

  // Delete meeting
  const deleteMeeting = useCallback(async (id) => {
    try {
      await apiHook.delete(`/meetings/${id}`);
      return true;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, [apiHook]);

  return {
    meetingTypes,
    loading: apiHook.loading,
    error: apiHook.error,
    fetchMeetings,
    fetchMeetingTypes,
    fetchAll,
    saveMeeting,
    deleteMeeting,
    modal,
  };
};

