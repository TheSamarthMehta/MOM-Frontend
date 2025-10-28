import React, { useState, useEffect } from "react";
import { api } from '../../shared/utils';
import StaffService from '../../api/staffService';
import { 
  LoadingSpinner, 
  ErrorMessage, 
  Modal, 
  PageHeader, 
  DataTable, 
  FormInput, 
  FormSelect, 
  FormButton,
  ActionIcons 
} from '../../shared/components';

const StaffConfigPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form, setForm] = useState({
    staffName: "",
    emailAddress: "",
    mobileNo: "",
    role: "Staff",
    department: "",
  });



  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/staff');
      setStaff(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, form);
      } else {
        await api.post('/staff', form);
      }
      fetchStaff();
      closeModal();
    } catch (err) {
      alert('Failed to save staff: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.delete(`/staff/${id}`);
        fetchStaff();
      } catch (err) {
        alert('Failed to delete staff');
      }
    }
  };

  const openCreateModal = () => {
    setEditingStaff(null);
    setForm({
      staffName: "",
      emailAddress: "",
      mobileNo: "",
      role: "Staff",
      department: "",
    });
    setShowModal(true);
  };

  const openEditModal = (staffMember) => {
    setEditingStaff(staffMember);
    setForm({
      staffName: staffMember.staffName,
      emailAddress: staffMember.emailAddress,
      mobileNo: staffMember.mobileNo,
      role: staffMember.role,
      department: staffMember.department,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
  };

  if (loading) {
    return <LoadingSpinner text="Loading staff data..." fullScreen />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={fetchStaff} />;
  }

  const addButton = (
    <button 
      onClick={openCreateModal}
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
    >
      <ActionIcons.Add size={20} className="text-white" />
      Add Staff
    </button>
  );

  const tableColumns = [
    {
      key: 'staffName',
      header: 'Name',
      render: (value, staff) => (
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 font-semibold text-sm">
              {value?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="text-sm font-medium text-gray-900">{value}</div>
        </div>
      )
    },
    {
      key: 'emailAddress',
      header: 'Email',
      render: (value) => <span className="text-sm text-gray-600">{value}</span>
    },
    {
      key: 'mobileNo',
      header: 'Mobile',
      render: (value) => <span className="text-sm text-gray-600">{value}</span>
    },
    {
      key: 'role',
      header: 'Role',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'Admin' ? 'bg-red-100 text-red-800' :
          value === 'Convener' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'department',
      header: 'Department',
      render: (value) => <span className="text-sm text-gray-600">{value || 'N/A'}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, staff) => (
        <div className="flex items-center gap-2">
          <ActionIcons.Edit onClick={() => openEditModal(staff)} />
          <ActionIcons.Delete onClick={() => handleDelete(staff.id)} />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader 
        title="Staff Management"
        subtitle="Manage your team members and their roles"
        actionButton={addButton}
      />

      <DataTable
        columns={tableColumns}
        data={staff}
        emptyMessage="No staff found"
        emptyIcon={
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      />

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Name"
            value={form.staffName}
            onChange={(e) => setForm({ ...form, staffName: e.target.value })}
            placeholder="Enter full name"
            required
          />
          
          <FormInput
            label="Email"
            type="email"
            value={form.emailAddress}
            onChange={(e) => setForm({ ...form, emailAddress: e.target.value })}
            placeholder="Enter email address"
            required
          />
          
          <FormInput
            label="Mobile"
            type="tel"
            value={form.mobileNo}
            onChange={(e) => setForm({ ...form, mobileNo: e.target.value })}
            placeholder="Enter mobile number"
            required
          />
          
          <FormSelect
            label="Role"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: 'Admin', label: 'Admin' },
              { value: 'Convener', label: 'Convener' },
              { value: 'Staff', label: 'Staff' }
            ]}
            required
          />
          
          <FormInput
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            placeholder="e.g., IT, HR, Finance"
          />
          
          <div className="flex gap-3 pt-4">
            <FormButton
              type="submit"
              className="flex-1"
            >
              {editingStaff ? 'Update Staff' : 'Add Staff'}
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

export default StaffConfigPage;
