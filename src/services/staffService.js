import { api } from '../utils/api';

// Staff Service - Handles all staff-related operations
export class StaffService {
  // Fetch all staff
  static async fetchStaff() {
    try {
      const response = await api.get('/staff');
      return response.data || [];
    } catch (err) {
      console.error('Error fetching staff:', err);
      throw new Error('Failed to load staff data');
    }
  }

  // Create or update staff member
  static async saveStaff(form, editingStaff) {
    try {
      if (editingStaff) {
        await api.put(`/staff/${editingStaff.id}`, form);
      } else {
        await api.post('/staff', form);
      }
      return true;
    } catch (err) {
      alert('Failed to save staff: ' + err.message);
      return false;
    }
  }

  // Delete staff member
  static async deleteStaff(id) {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await api.delete(`/staff/${id}`);
        return true;
      } catch (err) {
        alert('Failed to delete staff');
        return false;
      }
    }
    return false;
  }

  // Get role badge class
  static getRoleBadgeClass(role) {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Convener': return 'bg-blue-100 text-blue-800';
      default: return 'bg-green-100 text-green-800';
    }
  }

  // Transform staff for form
  static transformStaffForForm(staffMember) {
    return {
      staffName: staffMember.staffName,
      emailAddress: staffMember.emailAddress,
      mobileNo: staffMember.mobileNo,
      role: staffMember.role,
      department: staffMember.department,
    };
  }

  // Get default form values
  static getDefaultForm() {
    return {
      staffName: "",
      emailAddress: "",
      mobileNo: "",
      role: "Staff",
      department: "",
    };
  }

  // Get role options
  static getRoleOptions() {
    return [
      { value: 'Admin', label: 'Admin' },
      { value: 'Convener', label: 'Convener' },
      { value: 'Staff', label: 'Staff' }
    ];
  }
}

export default StaffService;
