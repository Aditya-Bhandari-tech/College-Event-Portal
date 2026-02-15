import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import {
    Calendar,
    Users,
    Bell,
    Briefcase,
    FileText,
    LogOut
} from "lucide-react";

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/login");
            return;
        }

        const parsed = JSON.parse(storedUser);

        if (parsed.role !== "faculty") {
            navigate("/login");
            return;
        }

        setUser(parsed);
    }, [navigate]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    if (!user) return null;

    return (
        <div className="flex min-h-screen bg-slate-100">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white p-6 space-y-4">
                <h2 className="text-xl font-bold">Faculty Panel</h2>

                <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
                <button onClick={() => setActiveTab("events")}>Events</button>
                <button onClick={() => setActiveTab("requests")}>Event Requests</button>
                <button onClick={() => setActiveTab("recruitment")}>Recruitment</button>
                <button onClick={() => setActiveTab("students")}>Students</button>
                <button onClick={() => setActiveTab("announcements")}>Announcements</button>
                <button onClick={() => setActiveTab("gallery")}>Gallery</button>

                <button
                    onClick={logout}
                    className="flex items-center gap-2 text-red-400 mt-6"
                >
                    <LogOut size={18} /> Logout
                </button>
            </aside>

            {/* Content */}
            <main className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-6">
                    Welcome, {user.name}
                </h1>

                {activeTab === "dashboard" && (
                    <div>Faculty Overview Dashboard</div>
                )}

                {activeTab === "events" && (
                    <div>Event Management Section</div>
                )}

                {activeTab === "requests" && (
                    <div>Event Requests Section</div>
                )}

                {activeTab === "recruitment" && (
                    <div>Recruitment Section</div>
                )}

                {activeTab === "students" && (
                    <div>Student List (Branch Based)</div>
                )}

                {activeTab === "announcements" && (
                    <div>Announcement Section</div>
                )}

                {activeTab === "gallery" && (
                    <div>Gallery Section</div>
                )}
            </main>
        </div>
    );
};

export default FacultyDashboard;