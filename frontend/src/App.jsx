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
import AdminEventApprovals from "./pages/AdminEventApprovals";
import { ThemeProvider } from "./contexts/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Admin & Student Dashboard (Role handled inside Dashboard.jsx) */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/student" element={<Dashboard />} />

        {/* Faculty Dashboard */}
        <Route path="/faculty" element={<FacultyDashboard />} />

        {/* Student Pages */}
        <Route path="/event-requests" element={<EventRequests />} />
        <Route path="/recruitment" element={<Recruitment />} />

        {/* Admin Pages */}
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/events" element={<AdminEventApprovals />} />
        <Route path="/admin/settings" element={<Dashboard />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}
