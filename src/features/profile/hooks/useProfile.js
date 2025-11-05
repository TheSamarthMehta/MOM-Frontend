import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';

export const useProfile = () => {
  const { user: authUser, updateProfile, changePassword, loading, error, clearError } = useAuth();
  
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    role: ""
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(null);

  // Sync user state with auth user
  useEffect(() => {
    if (authUser) {
      setUser({
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        email: authUser.email || "",
        mobileNo: authUser.mobileNo || "",
        role: authUser.role || ""
      });
    }
  }, [authUser]);

  const handleUserChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "mobileNo") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length <= 10) {
        setUser((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSaveChanges = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }
    clearError();
    setSuccess(null);

    try {
      const profileData = {
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNo: user.mobileNo,
      };
      
      await updateProfile(profileData);
      
      if (passwords.newPassword) {
        if (passwords.newPassword !== passwords.confirmPassword) {
          setSuccess("New passwords do not match.");
          return;
        }
        
        await changePassword({
          currentPassword: passwords.current,
          newPassword: passwords.newPassword,
        });
        setSuccess("Profile and password updated successfully.");
      } else {
        setSuccess("Profile updated successfully.");
      }
      
      setIsEditing(false);
      setPasswords({ current: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  }, [user, passwords, updateProfile, changePassword, clearError]);

  const handleEditClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    // Reset user state to authUser values
    if (authUser) {
      setUser({
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        email: authUser.email || "",
        mobileNo: authUser.mobileNo || "",
        role: authUser.role || ""
      });
    }
    setPasswords({ current: "", newPassword: "", confirmPassword: "" });
    setSuccess(null);
    clearError();
  }, [authUser, clearError]);

  return {
    user,
    passwords,
    isEditing,
    success,
    loading,
    error,
    handleUserChange,
    handlePasswordChange,
    handleSaveChanges,
    handleEditClick,
    handleCancelEdit,
  };
};

export default useProfile;

