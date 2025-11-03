import { useCallback } from 'react';
import { useApi } from '../../../shared/hooks/useApi';
import { useModal } from '../../../shared/hooks/useModal';
import { api } from '../../../shared/utils/api';
import { StaffTransformer } from '../../../shared/utils/dataTransformers';
import { handleApiError } from '../../../shared/utils/errorHandler';

export const useStaff = () => {
  const apiHook = useApi();
  const modal = useModal();

  const fetchStaff = useCallback(async () => {
    try {
      const response = await api.get('/staff');
      return StaffTransformer.transformMany(response.data || []);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  const saveStaff = useCallback(async (formData, editingStaff = null) => {
    try {
      const payload = StaffTransformer.toAPIFormat(formData);
      
      if (editingStaff) {
        await apiHook.put(`/staff/${editingStaff.id}`, payload);
      } else {
        await apiHook.post('/staff', payload);
      }
      
      return true;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, [apiHook]);

  const deleteStaff = useCallback(async (id) => {
    try {
      await apiHook.delete(`/staff/${id}`);
      return true;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, [apiHook]);

  return {
    loading: apiHook.loading,
    error: apiHook.error,
    fetchStaff,
    saveStaff,
    deleteStaff,
    modal,
  };
};

