import { api } from '../../shared/utils';

export const fmt = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
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

export const fmtRelative = (timestamp) => {
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
    return fmt(timestamp);
  } catch (error) {
    console.error('Error formatting relative timestamp:', timestamp, error);
    return 'N/A';
  }
};

export const fetchMeetingTypes = async ({ setLoading, setError, setRows }) => {
  try {
    setLoading(true);
    setError(null);
    const response = await api.get('/meeting-types');
    const processedData = (response.data || []).map(item => ({
      ...item,
      createdAt: item.createdAt || item.created || new Date().toISOString(),
      updatedAt: item.updatedAt || item.modified || new Date().toISOString()
    }));
    setRows(processedData);
  } catch (err) {
    console.error('Error fetching meeting types:', err);
    setError(err.message || 'Failed to load meeting types');
  } finally {
    setLoading(false);
  }
};

export const setSort = (key, sortKey, sortDir, setSortKey, setSortDir) => {
  if (key === sortKey) {
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  } else {
    setSortKey(key);
    setSortDir('asc');
  }
};

export const handleAdd = ({ setEditRow, setForm, setFormError, setShowModal }) => {
  setEditRow(null);
  setForm({ meetingTypeName: '', remarks: '' });
  setFormError('');
  setShowModal(true);
};

export const handleEdit = (row, { setEditRow, setForm, setFormError, setShowModal }) => {
  setEditRow(row);
  setForm({ meetingTypeName: row.meetingTypeName, remarks: row.remarks });
  setFormError('');
  setShowModal(true);
};

export const handleDelete = async (row, { setLoading, setRows }) => {
  if (window.confirm(`Are you sure you want to delete \"${row.meetingTypeName}\"?`)) {
    try {
      setLoading(true);
      await api.delete(`/meeting-types/${row._id}`);
      setRows((prev) => prev.filter((r) => r._id !== row._id));
    } catch (err) {
      console.error('Error deleting meeting type:', err);
      alert(err.message || 'Failed to delete meeting type');
    } finally {
      setLoading(false);
    }
  }
};

export const handleFormChange = (e, { form, setForm }) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};

export const handleFormSubmit = async (e, { form, editRow, setLoading, setRows, setShowModal, setEditRow, setFormError }) => {
  e.preventDefault();
  if (!form.meetingTypeName.trim()) {
    setFormError('Meeting Type Name is required.');
    return;
  }

  try {
    setLoading(true);
    if (editRow) {
      const response = await api.put(`/meeting-types/${editRow._id}`, form);
      const updatedItem = {
        ...response.data,
        createdAt: response.data.createdAt || editRow.createdAt || new Date().toISOString(),
        updatedAt: response.data.updatedAt || new Date().toISOString()
      };
      setRows((prev) => prev.map((r) => (r._id === editRow._id ? updatedItem : r)));
    } else {
      const response = await api.post('/meeting-types', form);
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

export default {
  fmt,
  fmtRelative,
  fetchMeetingTypes,
  setSort,
  handleAdd,
  handleEdit,
  handleDelete,
  handleFormChange,
  handleFormSubmit,
};
