import React from "react";
import { useProfile } from './hooks/useProfile';

const ProfilePage = () => {
  const {
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
  } = useProfile();

  if (loading && !user.email) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user.email) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', flexDirection: 'column' }}>
          <div style={{ color: '#c33', marginBottom: '20px' }}>{error}</div>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a1a' }}>Profile Settings</h1>
        {!isEditing ? (
          <button
            onClick={handleEditClick}
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: loading ? '#ccc' : '#4a90e2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCancelEdit}
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#999', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={loading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: loading ? '#ccc' : '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500'
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {success && (
        <div style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33', padding: '12px', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#e0e7ff', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: '#4f46e5', fontWeight: '600' }}>
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
            {user.firstName} {user.lastName}
          </h2>
          <p style={{ fontSize: '14px', color: '#666' }}>{user.role}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0' }}>
              Personal Information
            </h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={user.firstName}
                    onChange={handleUserChange}
                    disabled={!isEditing}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px', 
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: isEditing ? 'white' : '#f5f5f5'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={user.lastName}
                    onChange={handleUserChange}
                    disabled={!isEditing}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px', 
                      fontSize: '14px',
                      boxSizing: 'border-box',
                      backgroundColor: isEditing ? 'white' : '#f5f5f5'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: '#f5f5f5',
                    color: '#999'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={user.mobileNo}
                  onChange={handleUserChange}
                  disabled={!isEditing}
                  style={{ 
                    width: '100%', 
                    padding: '10px 12px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    backgroundColor: isEditing ? 'white' : '#f5f5f5'
                  }}
                />
              </div>
            </form>
          </div>

          {isEditing && (
            <div style={{ background: 'white', borderRadius: '8px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0' }}>
                Change Password
              </h3>
              <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="current"
                    value={passwords.current}
                    onChange={handlePasswordChange}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#333' }}>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      border: '1px solid #ddd', 
                      borderRadius: '4px', 
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
