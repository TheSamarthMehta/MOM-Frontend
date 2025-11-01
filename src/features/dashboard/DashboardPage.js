import React from 'react';
import { useDashboard } from './hooks';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  PageHeader, 
  DataTable,
  ActionIcons,
  StatusBadge
} from '../../shared/components';
import { MEETING_STATUS } from '../../shared/constants';

const DashboardPage = () => {
  const { stats, meetings, loading, error, refetch } = useDashboard();

  const getStatusBadge = (status) => {
    return <StatusBadge status={status || MEETING_STATUS.SCHEDULED} />;
  };

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color} shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." fullScreen />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  const refreshButton = (
    <button 
      onClick={refetch}
      className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
    >
      <ActionIcons.Refresh size={16} className="text-gray-600" />
      <span>Refresh</span>
    </button>
  );

  const tableColumns = [
    {
      key: 'title',
      header: 'Meeting Title',
      render: (value) => <div className="font-medium text-gray-900">{value}</div>
    },
    {
      key: 'type',
      header: 'Type',
      render: (value) => <div className="text-gray-600">{value}</div>
    },
    {
      key: 'date',
      header: 'Date',
      render: (value) => <div className="text-gray-600">{value}</div>
    },
    {
      key: 'time',
      header: 'Time',
      render: (value) => <div className="text-gray-600">{value}</div>
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => getStatusBadge(value)
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader 
        title="Dashboard"
        subtitle="Welcome back! Here's your meeting overview"
        actionButton={refreshButton}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Upcoming Meetings"
          value={stats?.upcoming || 0}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="bg-primary-500"
        />
        <StatCard
          title="Completed MOMs"
          value={stats?.completed || 0}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-success-500"
        />
        <StatCard
          title="Cancelled Meetings"
          value={stats?.cancelled || 0}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-danger-500"
        />
        <StatCard
          title="Pending Follow-ups"
          value={stats?.pending || 0}
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="bg-warning-500"
        />
      </div>

      {/* Recent Meetings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Meetings</h2>
              <p className="text-gray-600 mt-1">Latest meeting activities</p>
            </div>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors duration-200">
              View All
            </button>
          </div>
        </div>

        <div className="p-6">
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
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
