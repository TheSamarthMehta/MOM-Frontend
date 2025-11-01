import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import ProtectedRoute from "../features/auth/ProtectedRoute";
import DashboardPage from "../features/dashboard/DashboardPage";
import ProfilePage from "../features/profile/ProfilePage";
import MasterConfigPage from "../features/masterConfig/MasterConfigPage";
import StaffConfigPage from "../features/staff/StaffConfigPage";
import MeetingManagerPage from "../features/meetings/MeetingManagerPage";
import AttendancePage from "../features/attendance/AttendancePage";
import DocumentsManagerPage from "../features/documents/DocumentsManagerPage";
import ReportsPage from "../features/reports/ReportsPage";
import { MainLayout } from "../layouts";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<MainLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/master_configure"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
              <MasterConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff_configure"
          element={
            <ProtectedRoute requiredRoles={['Admin']}>
              <StaffConfigPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meetings_manager"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
              <MeetingManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents_manager"
          element={
            <ProtectedRoute>
              <DocumentsManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report"
          element={
            <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
