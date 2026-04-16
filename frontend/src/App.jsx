import { Routes, Route } from "react-router-dom";
import Welcome from "./components/AuthComponents/Welcome";
import Signup from "./components/AuthComponents/Signup";
import Login from "./components/AuthComponents/Login";
import FacultyDashboard from "./pages/FacultyDashboard";

import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import EventRequests from "./pages/EventRequests";
import Recruitment from "./pages/Recruitment";
import Users from "./pages/Users";

import { ThemeProvider } from "./contexts/ThemeContext";

import ProtectedRoute from "./components/AuthComponents/ProtectedRoute";
import PublicRoute from "./components/AuthComponents/PublicRoute";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* ── Public routes: only accessible when NOT logged in ── */}
        <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* ── Protected routes: only accessible when logged in ── */}

        {/* Admin & Student Dashboard */}
        <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Faculty Dashboard */}
        <Route path="/faculty" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />

        {/* Student Pages */}
        <Route path="/event-requests" element={<ProtectedRoute><EventRequests /></ProtectedRoute>} />
        <Route path="/recruitment" element={<ProtectedRoute><Recruitment /></ProtectedRoute>} />

        {/* Admin Pages */}
        <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}
