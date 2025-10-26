import React, { useMemo, useState, useEffect } from "react";
import { Info, Edit, Trash2 } from "lucide-react";
import { API_BASE_URL } from '../utils/const';

const initialRows = [
  {
    srno: 1,
    typeName: "Stand-up Meeting",
    remarks: "Daily sync for team",
    createdAt: "2025-09-15T09:30:00Z",
    updatedAt: "2025-10-10T11:00:00Z",
  },
  {
    srno: 2,
    typeName: "Sprint Planning",
    remarks: "Plan sprint backlog",
    createdAt: "2025-08-10T12:15:00Z",
    updatedAt: "2025-10-01T10:45:00Z",
  },
  {
    srno: 3,
    typeName: "Retrospective",
    remarks: "Sprint review and feedback",
    createdAt: "2025-07-05T08:00:00Z",
    updatedAt: "2025-09-25T14:20:00Z",
  },
  {
    srno: 4,
    typeName: "Client Review",
    remarks: "External stakeholder review",
    createdAt: "2025-09-01T10:00:00Z",
    updatedAt: "2025-10-12T16:10:00Z",
  },
  {
    srno: 5,
    typeName: "Budget Review",
    remarks: "Quarterly finance check",
    createdAt: "2025-06-20T15:30:00Z",
    updatedAt: "2025-09-18T12:00:00Z",
  }
];

// Enhanced timestamp formatting function
const fmt = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    
    // Format as: "MMM DD, YYYY at HH:MM AM/PM"
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting timestamp:', timestamp, error);
    return 'N/A';
  }
};

// Alternative format for relative time (e.g., "2 hours ago")
const fmtRelative = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // For older dates, show the formatted date
    return fmt(timestamp);
  } catch (error) {
    console.error('Error formatting relative timestamp:', timestamp, error);
    return 'N/A';
  }
};

const MasterConfigPage = () => {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("srno");
  const [sortDir, setSortDir] = useState("asc");
  const [showModal, setShowModal] = useState(false);
  const [viewRow, setViewRow] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ meetingTypeName: "", remarks: "" });
  const [formError, setFormError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());


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

  // Fetch meeting types on component mount
  useEffect(() => {
    const fetchMeetingTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiRequest('/meeting-types');
        console.log('Meeting types response:', response);
        console.log('Meeting types data:', response.data);
        
        // The data should now have createdAt and updatedAt from virtuals
        const processedData = (response.data || []).map(item => ({
          ...item,
          // Fallback to current time if timestamps are missing
          createdAt: item.createdAt || item.created || new Date().toISOString(),
          updatedAt: item.updatedAt || item.modified || new Date().toISOString()
        }));
        
        console.log('Processed data:', processedData);
        setRows(processedData);
      } catch (err) {
        console.error('Error fetching meeting types:', err);
        setError(err.message || 'Failed to load meeting types');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetingTypes();
  }, []);

  // Update timestamps every minute for real-time display
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filteredRows = [...rows];
    if (q) {
      filteredRows = filteredRows.filter(
        (r) =>
          String(r._id?.slice(-6)).includes(q) ||
          r.meetingTypeName?.toLowerCase().includes(q) ||
          r.remarks?.toLowerCase().includes(q)
      );
    }
    filteredRows.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (sortKey === "createdAt" || sortKey === "updatedAt") {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return filteredRows;
  }, [rows, query, sortKey, sortDir]);

  const setSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };



  const handleAdd = () => {
    setEditRow(null);
    setForm({ meetingTypeName: "", remarks: "" });
    setFormError("");
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setForm({
      meetingTypeName: row.meetingTypeName,
      remarks: row.remarks,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    if (window.confirm(`Are you sure you want to delete "${row.meetingTypeName}"?`)) {
      try {
        setLoading(true);
        await apiRequest(`/meeting-types/${row._id}`, {
          method: 'DELETE'
        });
        setRows((prev) => prev.filter((r) => r._id !== row._id));
      } catch (err) {
        console.error('Error deleting meeting type:', err);
        alert(err.message || 'Failed to delete meeting type');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.meetingTypeName.trim()) {
      setFormError("Meeting Type Name is required.");
      return;
    }

    try {
      setLoading(true);
      
      if (editRow) {
        const response = await apiRequest(`/meeting-types/${editRow._id}`, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        // Ensure timestamps are properly handled
        const updatedItem = {
          ...response.data,
          createdAt: response.data.createdAt || editRow.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString()
        };
        setRows((prev) =>
          prev.map((r) =>
            r._id === editRow._id ? updatedItem : r
          )
        );
      } else {
        const response = await apiRequest('/meeting-types', {
          method: 'POST',
          body: JSON.stringify(form)
        });
        // Ensure timestamps are properly handled for new items
        const newItem = {
          ...response.data,
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString()
        };
        setRows((prev) => [newItem, ...prev]);
      }
      
      setShowModal(false);
      setEditRow(null);
    } catch (err) {
      console.error('Error saving meeting type:', err);
      setFormError(err.message || 'Failed to save meeting type');
    } finally {
      setLoading(false);
    }
  };

  if (loading && rows.length === 0) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading meeting types...</p>
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
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Master Configuration</h1>
          <p className="text-gray-600">Manage Meeting Types used throughout the MOM workflow.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by Sr No., Type, or Remarks"
            className="w-64 max-w-[70vw] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-[.99] ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600'
            }`}
            title="Add Meeting Type"
            onClick={handleAdd}
            disabled={loading}
          >
            + Add
          </button>
          <button
            className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 shadow hover:bg-gray-200 active:scale-[.99] ${
              loading 
                ? 'cursor-not-allowed opacity-50' 
                : ''
            }`}
            title="Refresh Data"
            onClick={() => window.location.reload()}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left align-middle">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => setSort("_id")}
                >
                  Meeting Sr No. {sortKey === "_id" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                </th>
                <th
                  className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => setSort("meetingTypeName")}
                >
                  Meeting Type Name {sortKey === "meetingTypeName" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Remarks</th>
                <th
                  className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => setSort("createdAt")}
                >
                  Created {sortKey === "createdAt" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                </th>
                <th
                  className="px-4 py-2 text-left font-semibold text-gray-700 cursor-pointer select-none"
                  onClick={() => setSort("updatedAt")}
                >
                  Modified {sortKey === "updatedAt" ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">No records found</td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row._id}
                    className="hover:bg-blue-50 group"
                  >
                    <td className="px-4 py-3 text-gray-900 font-medium">{row._id?.slice(-6) || 'N/A'}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      {row.meetingTypeName || 'N/A'}
                      <button
                        className="ml-2 text-blue-600 hover:text-blue-800 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        title="View Info"
                        onClick={() => setViewRow(row)}
                        type="button"
                      >
                        <Info size={18} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.remarks || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.createdAt ? (
                        <div className="text-sm">
                          <div className="text-gray-900">{fmt(row.createdAt)}</div>
                          <div className="text-gray-500 text-xs">{fmtRelative(row.createdAt)}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.updatedAt ? (
                        <div className="text-sm">
                          <div className="text-gray-900">{fmt(row.updatedAt)}</div>
                          <div className="text-gray-500 text-xs">{fmtRelative(row.updatedAt)}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(row)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-sm text-gray-600">
        <span>Showing {filtered.length} result(s)</span>
        <span>Last updated: {fmt(lastUpdate)}</span>
      </div>

      {showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            ×
          </button>
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {editRow ? "Edit Meeting Type" : "Add Meeting Type"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Type Name<span className="text-red-500">*</span></label>
              <input
                type="text"
                name="meetingTypeName"
                value={form.meetingTypeName}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleFormChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            {formError && <div className="text-red-500 text-sm">{formError}</div>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                {editRow ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Modal for viewing meeting type details */}
    {viewRow && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
            onClick={() => setViewRow(null)}
            aria-label="Close"
          >
            ×
          </button>
          <h2 className="text-lg font-bold mb-4 text-gray-800">Meeting Info</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Meeting Sr No.:</span>
              <span className="ml-2 text-gray-900">{viewRow._id?.slice(-6) || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Meeting Type Name:</span>
              <span className="ml-2 text-gray-900">{viewRow.meetingTypeName || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Remarks:</span>
              <span className="ml-2 text-gray-900">{viewRow.remarks || <span className="text-gray-400">(none)</span>}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <div className="ml-2 text-gray-900">
                {viewRow.createdAt ? (
                  <div>
                    <div>{fmt(viewRow.createdAt)}</div>
                    <div className="text-sm text-gray-500">{fmtRelative(viewRow.createdAt)}</div>
                  </div>
                ) : (
                  'N/A'
                )}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Modified:</span>
              <div className="ml-2 text-gray-900">
                {viewRow.updatedAt ? (
                  <div>
                    <div>{fmt(viewRow.updatedAt)}</div>
                    <div className="text-sm text-gray-500">{fmtRelative(viewRow.updatedAt)}</div>
                  </div>
                ) : (
                  'N/A'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};

export default MasterConfigPage;
