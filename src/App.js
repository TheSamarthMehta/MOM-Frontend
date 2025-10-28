import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage, SignupPage, ProtectedRoute, AuthProvider } from "./features/auth";
import { DashboardPage } from "./features/dashboard";
import { ProfilePage } from "./features/profile";
import { MasterConfigPage } from "./features/masterConfig";
import { StaffConfigPage } from "./features/staff";
import { MeetingManagerPage } from "./features/meetings";
import { AttendancePage } from "./features/attendance";
import { DocumentsManagerPage } from "./features/documents";
import { ReportsPage } from "./features/reports";
import { MainLayout } from "./layouts";

const App = () => {
  return(
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/master_configure" element={
              <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
                <MasterConfigPage />
              </ProtectedRoute>
            } />
            <Route path="/staff_configure" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <StaffConfigPage />
              </ProtectedRoute>
            } />
            <Route path="/meetings_manager" element={
              <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
                <MeetingManagerPage />
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
                <AttendancePage />
              </ProtectedRoute>
            } />
            <Route path="/documents_manager" element={
              <ProtectedRoute>
                <DocumentsManagerPage />
              </ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute requiredRoles={['Admin', 'Convener']}>
                <ReportsPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;