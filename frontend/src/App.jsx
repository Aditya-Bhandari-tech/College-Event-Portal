import { Routes, Route } from "react-router-dom";
import Welcome from "./components/AuthComponents/Welcome";
import Signup from "./components/AuthComponents/Signup";
import Login from "./components/AuthComponents/Login";
import Dashboard from "./components/pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      
    </Routes>
  );
}
