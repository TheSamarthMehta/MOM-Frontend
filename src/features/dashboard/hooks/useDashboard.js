import { useCallback } from 'react';
import { useFetch } from '../../../shared/hooks';
import { api } from '../../../shared/utils';
import { DashboardTransformer, MeetingTransformer } from '../../../shared/utils/dataTransformers';
import { handleApiError } from '../../../shared/utils/errorHandler';

/**
 * Custom hook for dashboard data
 */
export const useDashboard = () => {
  // Fetch dashboard overview
  const fetchOverview = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/overview');
      return DashboardTransformer.transformStats(response.data?.overview || {});
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // Fetch recent meetings
  const fetchRecentMeetings = useCallback(async () => {
    try {
      const response = await api.get('/meetings?limit=10');
      return MeetingTransformer.transformMany(response.data || []);
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      const [overview, meetings] = await Promise.all([
        fetchOverview(),
        fetchRecentMeetings(),
      ]);
      return { stats: overview, meetings };
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  }, [fetchOverview, fetchRecentMeetings]);

  const { data, loading, error, refetch } = useFetch(fetchDashboardData, []);

  return {
    stats: data?.stats || null,
    meetings: data?.meetings || [],
    loading,
    error,
    refetch,
  };
};

