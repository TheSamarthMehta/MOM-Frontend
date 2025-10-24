import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import MasterConfigPage from "./pages/MasterConfigPage";
import StaffConfigPage from "./pages/StaffConfigPage";
import MeetingManagerPage from "./pages/MeetingManagerPage";
import AttendancePage from "./pages/AttendancePage";
import DocumentsManagerPage from "./pages/DocumentsManagerPage";
import MainLayout from "./components/MainLayout";
import ReportsPage from "./pages/ReportsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

const App = () => {
  return(
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected Routes */}
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