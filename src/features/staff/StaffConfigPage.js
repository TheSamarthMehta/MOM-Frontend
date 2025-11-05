import React, { useEffect, useState } from "react";
import { useStaff } from "./hooks/useStaff";
import { useForm } from "../../shared/hooks/useForm";
import LoadingSpinner from "../../shared/components/LoadingSpinner";
import ErrorMessage from "../../shared/components/ErrorMessage";
import Modal from "../../shared/components/Modal";
import PageHeader from "../../shared/components/PageHeader";
import DataTable from "../../shared/components/DataTable";
import { FormInput, FormSelect, FormButton } from "../../shared/components/FormComponents";
import { ActionIcons } from "../../shared/components/ActionIcons";
import { RoleBadge } from "../../shared/components/StatusBadge";
import { StaffTransformer } from "../../shared/utils/dataTransformers";
import { schemas } from "../../shared/utils/validators";
import { USER_ROLES } from "../../shared/constants/enums";
import { notify } from "../../shared/utils/notifications";

const StaffConfigPage = () => {
  const {
    loading: apiLoading,
    error: apiError,
    fetchStaff,
    saveStaff,
    deleteStaff,
    modal,
  } = useStaff();

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const initialFormValues = {
    staffName: "",
    emailAddress: "",
    mobileNo: "",
    role: USER_ROLES.STAFF,
    department: "",
  };

  const form = useForm(
    initialFormValues,
    async (values) => {
      try {
        await saveStaff(values, modal.data);
        await loadData();
        modal.close();
        notify.success(modal.data ? 'Staff member updated successfully' : 'Staff member added successfully');
      } catch (err) {
        notify.error(err.message || 'Failed to save staff');
      }
    },
    schemas.staff
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const fetchedStaff = await fetchStaff();
      setStaff(fetchedStaff || []);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load staff:', err);
      }
      notify.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
        await loadData();
        notify.success('Staff member deleted successfully');
      } catch (err) {
        notify.error(err.message || 'Failed to delete staff');
      }
    }
  };

  const openCreateModal = () => {
    form.reset(initialFormValues);
    modal.open(null);
  };

  const openEditModal = (staffMember) => {
    const formData = {
      staffName: staffMember.staffName,
      emailAddress: staffMember.emailAddress,
      mobileNo: staffMember.mobileNo,
      role: staffMember.role,
      department: staffMember.department || "",
    };
    form.reset(formData);
    modal.open(staffMember);
  };

  const handleModalClose = () => {
    modal.close();
    form.reset(initialFormValues);
  };

  if (loading || apiLoading) {
    return <LoadingSpinner text="Loading staff data..." fullScreen />;
  }

  if (apiError) {
    return <ErrorMessage error={apiError} onRetry={loadData} />;
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
      render: (value) => <RoleBadge role={value || USER_ROLES.STAFF} />
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
        isOpen={modal.isOpen}
        onClose={handleModalClose}
        title={modal.data ? 'Edit Staff Member' : 'Add Staff Member'}
        size="md"
      >
        <form onSubmit={form.handleSubmit} className="space-y-6">
          <FormInput
            label="Name"
            value={form.values.staffName}
            onChange={(e) => form.handleChange('staffName', e.target.value)}
            onBlur={() => form.handleBlur('staffName')}
            placeholder="Enter full name"
            required
            error={form.touched.staffName && form.errors.staffName}
          />
          
          <FormInput
            label="Email"
            type="email"
            value={form.values.emailAddress}
            onChange={(e) => form.handleChange('emailAddress', e.target.value)}
            onBlur={() => form.handleBlur('emailAddress')}
            placeholder="Enter email address"
            required
            error={form.touched.emailAddress && form.errors.emailAddress}
          />
          
          <FormInput
            label="Mobile"
            type="tel"
            value={form.values.mobileNo}
            onChange={(e) => form.handleChange('mobileNo', e.target.value)}
            onBlur={() => form.handleBlur('mobileNo')}
            placeholder="Enter mobile number"
            maxLength={10}
            pattern="\d{10}"
            inputMode="numeric"
            required
            error={form.touched.mobileNo && form.errors.mobileNo}
          />
          
          <FormSelect
            label="Role"
            value={form.values.role}
            onChange={(e) => form.handleChange('role', e.target.value)}
            onBlur={() => form.handleBlur('role')}
            options={[
              { value: USER_ROLES.ADMIN, label: USER_ROLES.ADMIN },
              { value: USER_ROLES.CONVENER, label: USER_ROLES.CONVENER },
              { value: USER_ROLES.STAFF, label: USER_ROLES.STAFF }
            ]}
            required
            error={form.touched.role && form.errors.role}
          />
          
          <FormInput
            label="Department"
            value={form.values.department}
            onChange={(e) => form.handleChange('department', e.target.value)}
            placeholder="e.g., IT, HR, Finance"
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
              {modal.data ? 'Update Staff' : 'Add Staff'}
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

export default StaffConfigPage;
