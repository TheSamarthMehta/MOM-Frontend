import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
    const [meetings, setMeetings] = useState([]);
    const [stats, setStats] = useState({
        upcoming: 0,
        completed: 0,
        cancelled: 0,
        pending: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // API Base URL
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8800/api';

    // Get token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // API request helper
    const apiRequest = async (endpoint, options = {}) => {
        const token = getAuthToken();
        const url = `${API_BASE_URL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            
            if (!response.ok) {
                const error = new Error(data.message || `HTTP ${response.status}`);
                error.response = { status: response.status, data };
                throw error;
            }
            
            return data;
        } catch (error) {
            if (error.response?.data?.message) {
                const apiError = new Error(error.response.data.message);
                apiError.response = error.response;
                throw apiError;
            }
            throw error;
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [dashboardResponse, meetingsResponse] = await Promise.all([
                apiRequest('/dashboard/overview'),
                apiRequest('/meetings?limit=10')
            ]);
            
            setStats(dashboardResponse.data?.overview || stats);
            
            // Transform backend data to frontend format
            const transformedMeetings = (meetingsResponse.data || []).map(meeting => {
                const meetingDate = meeting.meetingDate ? new Date(meeting.meetingDate) : null;
                const meetingTime = meeting.meetingTime ? new Date(meeting.meetingTime) : null;
                
                return {
                    id: meeting._id || meeting.id,
                    title: meeting.meetingTitle || 'Untitled Meeting',
                    type: meeting.meetingTypeId?.meetingTypeName || meeting.meetingTypeId?.typeName || 'N/A',
                    date: meetingDate ? meetingDate.toISOString().split('T')[0] : 'N/A',
                    time: meetingTime ? meetingTime.toTimeString().slice(0, 5) : 'N/A',
                    status: meeting.status || 'Scheduled'
                };
            });
            
            setMeetings(transformedMeetings);
            setError(null);
        } catch (err) {
            console.error('Error:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold";
        switch (status) {
            case 'Completed':
                return `${baseClasses} bg-success-100 text-success-800`;
            case 'Upcoming':
                return `${baseClasses} bg-primary-100 text-primary-800`;
            case 'Cancelled':
                return `${baseClasses} bg-danger-100 text-danger-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const StatCard = ({ title, value, icon, color, trend }) => (
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
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-24 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
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
                            <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600 mb-4">Welcome back! Here's your meeting overview</p>
                <button 
                    onClick={fetchData}
                    className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Upcoming Meetings"
                    value={stats.upcoming}
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    }
                    color="bg-primary-500"
                />
                <StatCard
                    title="Completed MOMs"
                    value={stats.completed}
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="bg-success-500"
                />
                <StatCard
                    title="Cancelled Meetings"
                    value={stats.cancelled}
                    icon={
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    color="bg-danger-500"
                />
                <StatCard
                    title="Pending Follow-ups"
                    value={stats.pending}
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
                    {meetings.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
                            <p className="text-gray-500">Get started by creating your first meeting.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wide">Meeting Title</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wide">Type</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wide">Date</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wide">Time</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-600 text-sm uppercase tracking-wide">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {meetings.map((meeting, index) => (
                                        <tr key={meeting.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                            <td className="py-4 px-4">
                                                <div className="font-medium text-gray-900">{meeting.title}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-gray-600">{meeting.type}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-gray-600">{meeting.date}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="text-gray-600">{meeting.time}</div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={getStatusBadge(meeting.status)}>
                                                    {meeting.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
