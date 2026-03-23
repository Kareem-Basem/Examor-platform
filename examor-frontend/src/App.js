import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/admin/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import ExamPage from './pages/student/ExamPage';
import Results from './pages/student/Results';
import ProfilePage from './pages/ProfilePage';

const readStoredUser = () => {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const isRoleAllowed = (allowedRole, role) => {
    if (!allowedRole) return true;
    if (Array.isArray(allowedRole)) return allowedRole.includes(role);
    return role === allowedRole;
};

const isAcademicPending = (user, role) => {
    const normalizedRole = String(role || user?.role || '').toLowerCase();
    if (!['teacher', 'doctor'].includes(normalizedRole)) return false;
    const profileMode = String(user?.profile_mode || '').toLowerCase();
    const academicVerified = Boolean(user?.academic_verified);
    return profileMode === 'academic' && !academicVerified;
};

const ProtectedRoute = ({ children, allowedRole, blockAcademicPending, pendingRedirect }) => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    const user = readStoredUser();

    if (!token) return <Navigate to="/login" />;
    if (!isRoleAllowed(allowedRole, role)) return <Navigate to="/login" />;
    if (blockAcademicPending && isAcademicPending(user, role)) {
        return <Navigate to={pendingRedirect || "/student"} />;
    }

    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRole="admin">
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                {/* Doctor */}
                <Route path="/doctor" element={
                    <ProtectedRoute allowedRole={["teacher", "doctor"]} blockAcademicPending pendingRedirect="/doctor/profile?pending=1">
                        <DoctorDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/doctor/profile" element={
                    <ProtectedRoute allowedRole={["teacher", "doctor"]}>
                        <ProfilePage />
                    </ProtectedRoute>
                } />

                {/* Student */}
                <Route path="/student" element={
                    <ProtectedRoute allowedRole="student" blockAcademicPending pendingRedirect="/student/profile?pending=1">
                        <StudentDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/student/exam/:code" element={
                    <ProtectedRoute allowedRole="student" blockAcademicPending pendingRedirect="/student/profile?pending=1">
                        <ExamPage />
                    </ProtectedRoute>
                } />

                <Route path="/student/results" element={
                    <ProtectedRoute allowedRole="student" blockAcademicPending pendingRedirect="/student/profile?pending=1">
                        <Results />
                    </ProtectedRoute>
                } />

                <Route path="/student/profile" element={
                    <ProtectedRoute allowedRole="student">
                        <ProfilePage />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
