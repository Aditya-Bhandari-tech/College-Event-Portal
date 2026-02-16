import { Routes, Route } from "react-router-dom";
import Welcome from "./components/AuthComponents/Welcome";
import Signup from "./components/AuthComponents/Signup";
import Login from "./components/AuthComponents/Login";
import FacultyDashboard from "./pages/FacultyDashboard";

import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Admin Dashboard */}
      <Route path="/admin" element={<Dashboard />} />
      <Route path="/student" element={<Dashboard />} />
      <Route path="/faculty" element={<FacultyDashboard />} />

      {/* Temporary placeholders */}
      <Route path="/student" element={<div>Student Dashboard</div>} />
      <Route path="/faculty" element={<div>Faculty Dashboard</div>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}