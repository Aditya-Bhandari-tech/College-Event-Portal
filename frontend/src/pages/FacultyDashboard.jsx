import React, { useState, useEffect } from 'react';
import {
    Calendar, Users, Bell, Search, Image,
    UserPlus, Edit, Trash, Plus, FileText, CheckCircle, XCircle,
    UserCheck, ChevronRight, ChevronLeft, Menu, LogOut, Settings, Award, Check, X, Download,
    Upload, Trash2, Maximize2, User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import ProfileModal from '../components/profile/ProfileModal';
import { useTheme } from '../contexts/ThemeContext';
import DarkModeToggle from '../components/common/DarkModeToggle';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const { darkMode, portalSettings } = useTheme();
    const [user, setUser] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [activeRoute, setActiveRoute] = useState('Dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showProfilePanel, setShowProfilePanel] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Stats
    const [stats, setStats] = useState({
        ongoing: 0,
        upcoming: 0,
        finished: 0,
        students: 0
    });

    // Data Lists
    const [events, setEvents] = useState([]);
    const [requests, setRequests] = useState([]);
    const [recruitments, setRecruitments] = useState([]);
    const [students, setStudents] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [galleryItems, setGalleryItems] = useState([]);

    // Modals
    const [showEventModal, setShowEventModal] = useState(false);
    const [showRecruitmentModal, setShowRecruitmentModal] = useState(false);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [showApplicantsModal, setShowApplicantsModal] = useState(false);
    const [showGalleryUploadModal, setShowGalleryUploadModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null); // For edit/view applicants

    // Gallery
    const [galleryUploadEventId, setGalleryUploadEventId] = useState('');
    const [galleryUploadFiles, setGalleryUploadFiles] = useState([]);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

    // Forms
    const [eventForm, setEventForm] = useState({ title: '', description: '', date: '', venue: '', branch: '' });
    const [recruitmentForm, setRecruitmentForm] = useState({ title: '', roleType: '', description: '', branch: '', eventId: '' });
    const [announcementForm, setAnnouncementForm] = useState({ title: '', message: '', branch: '' });

    // Loading States
    const [loading, setLoading] = useState({
        events: false,
        requests: false,
        recruitments: false,
        students: false,
        announcements: false,
        applicants: false,
        gallery: false
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!storedUser || !token) {
            navigate('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'faculty') {
            navigate('/login');
            return;
        }
        setUser(parsedUser);

        axiosInstance.get('/users/me')
            .then(res => {
                const freshUser = res.data?.data || res.data;
                if (freshUser) {
                    setUser(freshUser);
                    localStorage.setItem('user', JSON.stringify(freshUser));
                }
            })
            .catch(() => { });

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        // Initial Fetch for Stats on mount (or when dashboard is active)
        if (activeRoute === 'Dashboard') {
            fetchEvents(true);
            fetchStudents(true);
        }
    }, [user, activeRoute]);

    useEffect(() => {
        if (!user) return;
        switch (activeRoute) {
            case 'Events':
                fetchEvents();
                break;
            case 'Event Requests':
                fetchRequests();
                break;
            case 'Recruitment':
                fetchEvents(); // Needed for dropdown
                fetchRecruitments();
                break;
            case 'Students':
                fetchStudents();
                break;
            case 'Announcements':
                fetchAnnouncements();
                break;
            case 'Gallery':
                fetchGallery();
                break;
            default:
                break;
        }
    }, [activeRoute, user]);


    // API Calls
    const fetchEvents = async (forStats = false) => {
        if (!forStats) setLoading(prev => ({ ...prev, events: true }));
        try {
            const res = await axiosInstance.get('/events');
            const allEvents = res.data.data || [];

            if (activeRoute === 'Dashboard' || forStats) {
                const now = new Date();
                const ongoing = allEvents.filter(e => new Date(e.date).toDateString() === now.toDateString()).length;
                const upcoming = allEvents.filter(e => new Date(e.date) > now).length;
                const finished = allEvents.filter(e => new Date(e.date) < now && new Date(e.date).toDateString() !== now.toDateString()).length;
                setStats(prev => ({ ...prev, ongoing, upcoming, finished }));
            }

            // Faculty manages their own events
            const myEvents = allEvents.filter(e => e.createdBy === user._id || e.createdBy?._id === user._id);
            setEvents(myEvents);
        } catch (error) {
            console.error("Error fetching events", error);
        } finally {
            if (!forStats) setLoading(prev => ({ ...prev, events: false }));
        }
    };

    const fetchRequests = async () => {
        setLoading(prev => ({ ...prev, requests: true }));
        try {
            const res = await axiosInstance.get('/event-requests');
            const allRequests = res.data.data || [];
            const departmentRequests = allRequests.filter(req => req.branch === user.branch);
            setRequests(departmentRequests);
        } catch (error) {
            console.error("Error fetching requests", error);
        } finally {
            setLoading(prev => ({ ...prev, requests: false }));
        }
    };

    const fetchRecruitments = async () => {
        setLoading(prev => ({ ...prev, recruitments: true }));
        try {
            const res = await axiosInstance.get('/recruitments?status=all');
            const allRecruitments = res.data.data || [];
            const myRecruitments = allRecruitments.filter(r => r.createdBy?._id === user._id || r.createdBy === user._id);
            setRecruitments(myRecruitments);
        } catch (error) {
            console.error("Error fetching recruitments", error);
        } finally {
            setLoading(prev => ({ ...prev, recruitments: false }));
        }
    };

    const fetchStudents = async (forStats = false) => {
        if (!forStats) setLoading(prev => ({ ...prev, students: true }));
        try {
            const res = await axiosInstance.get('/users/students');
            const studentList = res.data.data || [];
            setStudents(studentList);
            if (activeRoute === 'Dashboard' || forStats) {
                setStats(prev => ({ ...prev, students: studentList.length }));
            }
        } catch (error) {
            console.error("Error fetching students", error);
        } finally {
            if (!forStats) setLoading(prev => ({ ...prev, students: false }));
        }
    };

    const fetchAnnouncements = async () => {
        setLoading(prev => ({ ...prev, announcements: true }));
        try {
            const res = await axiosInstance.get('/announcements');
            const allAnnouncements = res.data.data || [];
            setAnnouncements(allAnnouncements);
        } catch (error) {
            console.error("Error fetching announcements", error);
        } finally {
            setLoading(prev => ({ ...prev, announcements: false }));
        }
    };

    const fetchApplicants = async (recruitmentId) => {
        setLoading(prev => ({ ...prev, applicants: true }));
        try {
            const res = await axiosInstance.get(`/recruitments/${recruitmentId}/applicants`);
            setSelectedItem(prev => ({ ...(prev || {}), applicants: res.data.data.applicants, recruitmentId }));
            setShowApplicantsModal(true);
        } catch (error) {
            console.error("Error fetching applicants", error);
            alert(error.response?.data?.message || "Failed to fetch applicants");
        } finally {
            setLoading(prev => ({ ...prev, applicants: false }));
        }
    };

    const handleUpdateApplicantStatus = async (recruitmentId, applicantId, status) => {
        try {
            await axiosInstance.patch(`/recruitments/${recruitmentId}/applicants/${applicantId}`, { status });
            // Update local state
            setSelectedItem(prev => ({
                ...prev,
                applicants: prev.applicants.map(app =>
                    app._id === applicantId ? { ...app, status } : app
                )
            }));
        } catch (error) {
            console.error("Update applicant status failed", error);
            alert(error.response?.data?.message || "Failed to update applicant status");
        }
    };

    // Gallery
    const fetchGallery = async () => {
        setLoading(prev => ({ ...prev, gallery: true }));
        try {
            const res = await axiosInstance.get('/events');
            const allEvents = res.data.data || [];
            // Faculty sees only their own events' images
            const myEventsWithImages = allEvents
                .filter(e => (e.createdBy === user._id || e.createdBy?._id === user._id) && e.images && e.images.length > 0);
            setGalleryItems(myEventsWithImages);
        } catch (error) {
            console.error('Error fetching gallery', error);
        } finally {
            setLoading(prev => ({ ...prev, gallery: false }));
        }
    };

    const handleGalleryUpload = async (e) => {
        e.preventDefault();
        if (!galleryUploadEventId || galleryUploadFiles.length === 0) {
            alert('Please select an event and at least one image.');
            return;
        }
        if (galleryUploadFiles.length > 10) {
            alert('You can upload a maximum of 10 images at a time.');
            return;
        }
        setGalleryUploading(true);
        try {
            const formData = new FormData();
            galleryUploadFiles.forEach(file => formData.append('images', file));
            await axiosInstance.post(`/events/${galleryUploadEventId}/gallery`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('Images uploaded successfully!');
            setShowGalleryUploadModal(false);
            setGalleryUploadEventId('');
            setGalleryUploadFiles([]);
            fetchGallery();
        } catch (error) {
            console.error('Gallery upload failed', error);
            alert(error.response?.data?.message || 'Failed to upload images');
        } finally {
            setGalleryUploading(false);
        }
    };

    const handleDeleteGalleryImage = async (eventId, publicId) => {
        if (!window.confirm('Delete this image permanently?')) return;
        try {
            await axiosInstance.delete(`/events/${eventId}/gallery/${publicId}`);
            // Update local state
            setGalleryItems(prev => prev.map(event => {
                if (event._id === eventId) {
                    return { ...event, images: event.images.filter(img => img.public_id !== publicId) };
                }
                return event;
            }).filter(event => event.images.length > 0));
        } catch (error) {
            console.error('Delete gallery image failed', error);
            alert('Failed to delete image');
        }
    };

    // CRUD Handlers
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/events', eventForm);
            alert("Event created successfully");
            setShowEventModal(false);
            fetchEvents();
        } catch (error) {
            console.error("Create event failed", error);
            alert(error.response?.data?.message || "Failed to create event");
        }
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/events/${selectedItem._id}`, eventForm);
            alert("Event updated successfully");
            setShowEventModal(false);
            setSelectedItem(null);
            fetchEvents();
        } catch (error) {
            console.error("Update event failed", error);
            alert(error.response?.data?.message || "Failed to update event");
        }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event?")) return;
        try {
            await axiosInstance.delete(`/events/${id}`);
            alert("Event deleted successfully");
            fetchEvents();
        } catch (error) {
            console.error("Delete event failed", error);
            alert(error.response?.data?.message || "Failed to delete event");
        }
    };

    const handleApproveRequest = async (id) => {
        try {
            await axiosInstance.patch(`/event-requests/${id}/approve`);
            alert("Request approved");
            fetchRequests();
        } catch (error) {
            console.error("Approve request failed", error);
            alert("Failed to approve request");
        }
    };

    const handleRejectRequest = async (id) => {
        if (!window.confirm("Reject this request?")) return;
        try {
            await axiosInstance.patch(`/event-requests/${id}/reject`);
            alert("Request rejected");
            fetchRequests();
        } catch (error) {
            console.error("Reject request failed", error);
            alert("Failed to reject request");
        }
    };

    const handleCreateRecruitment = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/recruitments', recruitmentForm);
            alert("Recruitment posted");
            setShowRecruitmentModal(false);
            fetchRecruitments();
        } catch (error) {
            console.error("Create recruitment failed", error);
            alert(error.response?.data?.message || "Failed to post recruitment");
        }
    };

    const handleUpdateRecruitment = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/recruitments/${selectedItem._id}`, recruitmentForm);
            alert("Recruitment updated");
            setShowRecruitmentModal(false);
            setSelectedItem(null);
            fetchRecruitments();
        } catch (error) {
            console.error("Update recruitment failed", error);
            alert(error.response?.data?.message || "Failed to update recruitment");
        }
    };

    const handleDeleteRecruitment = async (id) => {
        if (!window.confirm("Delete this recruitment?")) return;
        try {
            await axiosInstance.delete(`/recruitments/${id}`);
            alert("Recruitment deleted");
            fetchRecruitments();
        } catch (error) {
            console.error("Delete recruitment failed", error);
            alert(error.response?.data?.message || "Failed to delete recruitment");
        }
    };

    const handleCreateAnnouncement = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('/announcements', announcementForm);
            alert("Announcement posted");
            setShowAnnouncementModal(false);
            fetchAnnouncements();
        } catch (error) {
            console.error("Create announcement failed", error);
            alert(error.response?.data?.message || "Failed to post announcement");
        }
    };

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            await axiosInstance.delete(`/announcements/${id}`);
            alert("Announcement deleted");
            fetchAnnouncements();
        } catch (error) {
            console.error("Delete announcement failed", error);
            alert(error.response?.data?.message || "Failed to delete announcement");
        }
    };

    // Handlers
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Sub-renderers
    const handleRouteChange = (route) => {
        setActiveRoute(route);
        setMobileSidebarOpen(false);
    };

    const renderStats = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8" role="region" aria-label="Statistics">
            <StatsCard icon={Calendar} label="Ongoing Events" count={stats.ongoing} color="blue" />
            <StatsCard icon={Calendar} label="Upcoming Events" count={stats.upcoming} color="indigo" />
            <StatsCard icon={CheckCircle} label="Finished Events" count={stats.finished} color="emerald" />
            <StatsCard icon={Users} label="Total Students" count={stats.students} color="amber" />
        </div>
    );

    // UI Helpers for Data Displays
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    const navigation = [
        { name: 'Dashboard', icon: UserCheck },
        { name: 'Events', icon: Calendar },
        { name: 'Event Requests', icon: Award },
        { name: 'Recruitment', icon: UserPlus },
        { name: 'Students', icon: Users },
        { name: 'Announcements', icon: Bell },
        { name: 'Gallery', icon: Image }
    ];

    if (!user) return <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Loading"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div><span className="sr-only">Loading...</span></div>;

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'dark bg-slate-950' : 'bg-[#f9f8f6]'}`}>
            {/* Mobile Sidebar Overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-50 shadow-2xl
                    ${mobileSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
                    md:translate-x-0 ${sidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}
                role="navigation"
                aria-label="Faculty navigation"
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 md:p-6 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">GP</div>
                            {(!sidebarCollapsed || mobileSidebarOpen) && <span className="font-bold text-lg">CAMPUS PULSE</span>}
                        </div>
                        <button
                            onClick={() => setMobileSidebarOpen(false)}
                            className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            aria-label="Close navigation menu"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <nav className="flex-1 py-4 md:py-6 px-3 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeRoute === item.name;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => handleRouteChange(item.name)}
                                    aria-current={isActive ? 'page' : undefined}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center' : ''}`}
                                >
                                    <Icon size={20} />
                                    {(!sidebarCollapsed || mobileSidebarOpen) && <span className="font-medium">{item.name}</span>}
                                </button>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-700/50">
                        <div className={`flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center' : ''}`}>
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {user.name.charAt(0)}
                            </div>
                            {(!sidebarCollapsed || mobileSidebarOpen) && (
                                <div className="overflow-hidden">
                                    <p className="text-sm font-semibold truncate">{user.name}</p>
                                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-slate-800 rounded-full items-center justify-center border border-slate-700 text-slate-500 hover:text-white transition-all"
                        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <ChevronRight size={14} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 ml-0 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                {/* Header */}
                <header className={`sticky top-0 z-30 backdrop-blur-xl border-b shadow-sm transition-colors duration-300 ${darkMode ? 'bg-slate-900/90 border-slate-700/60' : 'bg-white/80 border-slate-200/60'}`}>
                    <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4">
                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                            aria-label="Open navigation menu"
                        >
                            <Menu size={24} className="text-slate-700" />
                        </button>
                        <div className="hidden sm:block">
                            <h1 className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{getGreeting()}, <span className="text-blue-500">{user.name.split(' ')[0]}</span></h1>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 flex-1 sm:flex-none justify-end">
                            {/* Dark mode toggle */}
                            <DarkModeToggle />
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden ring-2 ring-blue-500/30 shadow-md"
                                    aria-expanded={showProfileMenu}
                                    aria-haspopup="true"
                                    aria-label="User menu"
                                >
                                    {user.profilePic?.url ? (
                                        <img src={user.profilePic.url} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="bg-blue-100 text-blue-600 w-full h-full flex items-center justify-center">{user.name.charAt(0)}</span>
                                    )}
                                </button>
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 animate-fadeIn z-50" role="menu">
                                        <button onClick={() => { setShowProfilePanel(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2" role="menuitem">
                                            <User size={16} /> Profile
                                        </button>
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600 flex items-center gap-2" role="menuitem">
                                            <LogOut size={16} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-6 lg:p-8" id="main-content">
                    {/* Dashboard Overview */}
                    {activeRoute === 'Dashboard' && (
                        <div className="animate-fadeIn">
                            {renderStats()}
                            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-slate-800">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                <QuickActionCard title="Create Event" icon={Plus} onClick={() => { handleRouteChange('Events'); setEventForm({ title: '', description: '', date: '', venue: '', branch: user.branch }); setShowEventModal(true); }} />
                                <QuickActionCard title="Post Update" icon={Bell} onClick={() => { handleRouteChange('Announcements'); setAnnouncementForm({ title: '', message: '', branch: user.branch }); setShowAnnouncementModal(true); }} />
                                <QuickActionCard title="Review Applicants" icon={UserCheck} onClick={() => handleRouteChange('Recruitment')} />
                            </div>
                        </div>
                    )}

                    {/* Events Management */}
                    {activeRoute === 'Events' && (
                        <div className="animate-fadeIn">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Manage Events</h2>
                                <button onClick={() => { setEventForm({ title: '', description: '', date: '', venue: '', branch: user.branch }); setSelectedItem(null); setShowEventModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto justify-center">
                                    <Plus size={18} /> Create Event
                                </button>
                            </div>
                            {loading.events ? <Loader /> : (
                                <div className="grid gap-4">
                                    {events.map(event => (
                                        <div key={event._id} className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-base md:text-lg text-slate-800">{event.title}</h3>
                                                <p className="text-slate-600 text-sm line-clamp-2">{event.description}</p>
                                                <div className="flex flex-wrap gap-3 md:gap-4 mt-2 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(event.date)}</span>
                                                    <span className="flex items-center gap-1"><Users size={14} /> {event.branch}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button onClick={() => { setSelectedItem(event); setEventForm(event); setShowEventModal(true); }} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg flex-1 sm:flex-none flex items-center justify-center" aria-label={`Edit ${event.title}`}><Edit size={18} /></button>
                                                <button onClick={() => handleDeleteEvent(event._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-1 sm:flex-none flex items-center justify-center" aria-label={`Delete ${event.title}`}><Trash size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {events.length === 0 && <EmptyState message="No events created yet" />}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Event Requests */}
                    {activeRoute === 'Event Requests' && (
                        <div className="animate-fadeIn">
                            <h2 className={`text-xl md:text-2xl font-bold mb-4 md:mb-6 ${darkMode ? 'text-white' : 'text-slate-800'}`}>Student Event Requests</h2>
                            {!portalSettings.studentEventRequests ? (
                                <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <FileText size={24} className="text-amber-500" />
                                    </div>
                                    <p className={`font-bold text-lg mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Student Event Requests Disabled</p>
                                    <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>An admin has turned off student event requests in System Settings.</p>
                                </div>
                            ) : loading.requests ? <Loader /> : (
                                <div className="grid gap-4">
                                    {requests.map(req => (
                                        <div key={req._id} className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-bold text-base md:text-lg text-slate-800">{req.title}</h3>
                                                        <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {req.status?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 mt-1 text-sm">{req.description}</p>
                                                    <p className="text-xs text-slate-500 mt-2">Requested by: {req.requestedBy?.name} ({req.branch})</p>
                                                </div>
                                                {req.status === 'pending' && (
                                                    <div className="flex gap-2 w-full sm:w-auto">
                                                        <button onClick={() => handleApproveRequest(req._id)} className="flex-1 sm:flex-none px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600" aria-label={`Approve ${req.title}`}>Approve</button>
                                                        <button onClick={() => handleRejectRequest(req._id)} className="flex-1 sm:flex-none px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600" aria-label={`Reject ${req.title}`}>Reject</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {requests.length === 0 && <EmptyState message="No pending requests" />}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recruitment */}
                    {activeRoute === 'Recruitment' && (
                        <div className="animate-fadeIn">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                                <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Recruitments</h2>
                                {portalSettings.recruitmentOpen && (
                                    <button onClick={() => { setRecruitmentForm({ title: '', roleType: '', description: '', branch: user.branch, eventId: '' }); setSelectedItem(null); setShowRecruitmentModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto justify-center">
                                        <Plus size={18} /> New Post
                                    </button>
                                )}
                            </div>
                            {!portalSettings.recruitmentOpen ? (
                                <div className={`rounded-2xl border-2 border-dashed p-10 text-center ${darkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}`}>
                                    <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <UserPlus size={24} className="text-rose-500" />
                                    </div>
                                    <p className={`font-bold text-lg mb-1 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Recruitment Disabled</p>
                                    <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>An admin has turned off recruitment/volunteering in System Settings.</p>
                                </div>
                            ) : loading.recruitments ? <Loader /> : (
                                <div className="grid gap-4">
                                    {recruitments.map(rec => (
                                        <div key={rec._id} className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-base md:text-lg text-slate-800">{rec.title}</h3>
                                                    <p className="text-sm text-blue-600 font-medium mb-1">{rec.roleType} • {rec.event?.title}</p>
                                                    <p className="text-slate-600 text-sm">{rec.description}</p>
                                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                                        <button onClick={() => fetchApplicants(rec._id)} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Users size={14} /> View Applicants ({rec.applicants?.length || 0})</button>
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${rec.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{rec.status}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full sm:w-auto">
                                                    <button onClick={() => { setSelectedItem(rec); setRecruitmentForm(rec); setShowRecruitmentModal(true); }} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg flex-1 sm:flex-none flex items-center justify-center" aria-label={`Edit ${rec.title}`}><Edit size={18} /></button>
                                                    <button onClick={() => handleDeleteRecruitment(rec._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-1 sm:flex-none flex items-center justify-center" aria-label={`Delete ${rec.title}`}><Trash size={18} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {recruitments.length === 0 && <EmptyState message="No recruitment posts" />}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Students */}
                    {activeRoute === 'Students' && (
                        <div className="animate-fadeIn">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-slate-800">Students ({user.branch})</h2>
                            {loading.students ? <Loader /> : (
                                <>
                                    {/* Desktop table */}
                                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-50 border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Name</th>
                                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Email</th>
                                                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {students.map(student => (
                                                        <tr key={student._id} className="hover:bg-slate-50">
                                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{student.name}</td>
                                                            <td className="px-6 py-4 text-sm text-slate-600">{student.email}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">Active</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {students.length === 0 && (
                                                        <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-500">No students found</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    {/* Mobile cards */}
                                    <div className="md:hidden space-y-3">
                                        {students.map(student => (
                                            <div key={student._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-900 text-sm">{student.name}</p>
                                                        <p className="text-xs text-slate-500 truncate">{student.email}</p>
                                                    </div>
                                                    <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full flex-shrink-0">Active</span>
                                                </div>
                                            </div>
                                        ))}
                                        {students.length === 0 && <div className="text-center py-8 text-slate-500 text-sm">No students found</div>}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Announcements */}
                    {activeRoute === 'Announcements' && (
                        <div className="animate-fadeIn">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Announcements</h2>
                                <button onClick={() => { setAnnouncementForm({ title: '', message: '', branch: user.branch }); setShowAnnouncementModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto justify-center">
                                    <Plus size={18} /> New Announcement
                                </button>
                            </div>
                            {loading.announcements ? <Loader /> : (
                                <div className="space-y-4">
                                    {announcements.map(ann => (
                                        <article key={ann._id} className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200">
                                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="font-bold text-base md:text-lg text-slate-800">{ann.title}</h3>
                                                    <p className="text-slate-600 mt-1 text-sm">{ann.message}</p>
                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Posted on {formatDate(ann.createdAt)} by {ann.createdBy?.name || 'Unknown'}
                                                    </div>
                                                </div>
                                                {(ann.createdBy === user._id || ann.createdBy?._id === user._id) && (
                                                    <button onClick={() => handleDeleteAnnouncement(ann._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" aria-label={`Delete ${ann.title}`}><Trash size={18} /></button>
                                                )}
                                            </div>
                                        </article>
                                    ))}
                                    {announcements.length === 0 && <EmptyState message="No announcements" />}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Gallery */}
                    {activeRoute === 'Gallery' && (
                        <div className="animate-fadeIn">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800">Gallery</h2>
                                <button
                                    onClick={() => { fetchEvents(); setGalleryUploadEventId(''); setGalleryUploadFiles([]); setShowGalleryUploadModal(true); }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto justify-center"
                                >
                                    <Upload size={18} /> Upload Images
                                </button>
                            </div>
                            {loading.gallery ? <Loader /> : (
                                galleryItems.length === 0 ? (
                                    <EmptyState message="No gallery images yet. Upload photos to your events to see them here." />
                                ) : (
                                    <div className="space-y-6">
                                        {galleryItems.map(event => (
                                            <section key={event._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                                <div className="p-4 md:p-5 border-b border-slate-100">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h3 className="font-bold text-lg text-slate-900">{event.title}</h3>
                                                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                                                            {event.images.length} photos
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="p-3 md:p-4">
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                                                        {event.images.map((img, idx) => (
                                                            <div key={img.public_id || idx} className="group aspect-square rounded-xl overflow-hidden relative">
                                                                <img
                                                                    src={img.url}
                                                                    alt={`${event.title} photo ${idx + 1}`}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                                                                    loading="lazy"
                                                                    onClick={() => setLightbox({ open: true, images: event.images, index: idx })}
                                                                />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 pointer-events-none"></div>
                                                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setLightbox({ open: true, images: event.images, index: idx }); }}
                                                                        className="p-1.5 bg-white/90 rounded-lg text-slate-700 hover:bg-white transition-colors shadow-sm"
                                                                        aria-label="View full size"
                                                                    >
                                                                        <Maximize2 size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleDeleteGalleryImage(event._id, img.public_id); }}
                                                                        className="p-1.5 bg-red-500/90 rounded-lg text-white hover:bg-red-600 transition-colors shadow-sm"
                                                                        aria-label="Delete image"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </section>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    )}

                </div>
            </main>

            {/* --- MODALS --- */}

            {/* Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="event-modal-title">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-4 md:p-6 border border-slate-200 shadow-xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <h3 id="event-modal-title" className="text-lg md:text-xl font-bold mb-4">{selectedItem ? 'Edit Event' : 'Create New Event'}</h3>
                        <form onSubmit={selectedItem ? handleUpdateEvent : handleCreateEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
                                <input type="text" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea required value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows="3"></textarea>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input type="datetime-local" required value={eventForm.date} onChange={e => setEventForm({ ...eventForm, date: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Venue</label>
                                    <input type="text" required value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                                <input type="text" disabled value={eventForm.branch} className="w-full border border-slate-300 bg-slate-100 rounded-lg px-3 py-2 text-slate-500 cursor-not-allowed" />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowEventModal(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Recruitment Modal */}
            {showRecruitmentModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="recruitment-modal-title">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-4 md:p-6 border border-slate-200 shadow-xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <h3 id="recruitment-modal-title" className="text-lg md:text-xl font-bold mb-4">{selectedItem ? 'Edit Recruitment' : 'New Recruitment'}</h3>
                        <form onSubmit={selectedItem ? handleUpdateRecruitment : handleCreateRecruitment} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input type="text" required value={recruitmentForm.title} onChange={e => setRecruitmentForm({ ...recruitmentForm, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role Type</label>
                                <select required value={recruitmentForm.roleType} onChange={e => setRecruitmentForm({ ...recruitmentForm, roleType: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Select Role</option>
                                    <option value="volunteer">Volunteer</option>
                                    <option value="anchor">Anchor</option>
                                    <option value="coordinator">Coordinator</option>
                                    <option value="technical">Technical</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Linked Event</label>
                                <select required value={recruitmentForm.eventId} onChange={e => setRecruitmentForm({ ...recruitmentForm, eventId: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Select Event</option>
                                    {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea required value={recruitmentForm.description} onChange={e => setRecruitmentForm({ ...recruitmentForm, description: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows="3"></textarea>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowRecruitmentModal(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="announcement-modal-title">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-4 md:p-6 border border-slate-200 shadow-xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <h3 id="announcement-modal-title" className="text-lg md:text-xl font-bold mb-4">New Announcement</h3>
                        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input type="text" required value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea required value={announcementForm.message} onChange={e => setAnnouncementForm({ ...announcementForm, message: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" rows="4"></textarea>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowAnnouncementModal(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Applicants Modal */}
            {showApplicantsModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="applicants-modal-title">
                    <div className="bg-white rounded-2xl w-full max-w-3xl p-4 md:p-6 border border-slate-200 shadow-xl animate-fadeIn max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 id="applicants-modal-title" className="text-lg md:text-xl font-bold">Applicants</h3>
                            <button onClick={() => setShowApplicantsModal(false)} className="p-2 hover:bg-slate-100 rounded-full" aria-label="Close applicants modal"><X size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            {selectedItem.applicants?.map(app => (
                                <div key={app._id} className="border border-slate-200 rounded-lg p-3 md:p-4 flex flex-col sm:flex-row justify-between items-start gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-slate-900 text-sm md:text-base">{app.student?.name || 'Unknown Student'}</p>
                                        <p className="text-xs md:text-sm text-slate-600 truncate">{app.student?.email}</p>
                                        {app.student?.branch && <p className="text-xs text-slate-500 mt-0.5">{app.student.branch}</p>}
                                        <div className="mt-2 bg-slate-50 p-2 rounded text-xs md:text-sm text-slate-700">{app.note || 'No cover note'}</div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {app.status === 'applied' ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateApplicantStatus(selectedItem.recruitmentId, app._id, 'selected')}
                                                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors flex items-center gap-1"
                                                    aria-label={`Accept ${app.student?.name}`}
                                                >
                                                    <Check size={14} /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateApplicantStatus(selectedItem.recruitmentId, app._id, 'rejected')}
                                                    className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors flex items-center gap-1"
                                                    aria-label={`Reject ${app.student?.name}`}
                                                >
                                                    <X size={14} /> Reject
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-3 py-1.5 text-xs font-bold rounded-full ${app.status === 'selected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {app.status === 'selected' ? '✓ Accepted' : '✗ Rejected'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!selectedItem.applicants || selectedItem.applicants.length === 0) && (
                                <p className="text-center text-slate-500 py-8">No applicants yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Upload Modal */}
            {showGalleryUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="gallery-upload-title">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-4 md:p-6 border border-slate-200 shadow-xl animate-fadeIn max-h-[90vh] overflow-y-auto">
                        <h3 id="gallery-upload-title" className="text-lg md:text-xl font-bold mb-4">Upload Gallery Images</h3>
                        <form onSubmit={handleGalleryUpload} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Event</label>
                                <select
                                    required
                                    value={galleryUploadEventId}
                                    onChange={e => setGalleryUploadEventId(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Choose an event...</option>
                                    {events.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Images (max 10)</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                    onClick={() => document.getElementById('gallery-file-input').click()}
                                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-400', 'bg-blue-50'); }}
                                    onDragLeave={(e) => { e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50'); }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.classList.remove('border-blue-400', 'bg-blue-50');
                                        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                                        setGalleryUploadFiles(prev => [...prev, ...files].slice(0, 10));
                                    }}
                                >
                                    <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-600">Click or drag images here</p>
                                    <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 10MB each</p>
                                </div>
                                <input
                                    id="gallery-file-input"
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/jpg"
                                    className="hidden"
                                    onChange={(e) => setGalleryUploadFiles(prev => [...prev, ...Array.from(e.target.files)].slice(0, 10))}
                                />
                                {galleryUploadFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs text-slate-500 font-medium">{galleryUploadFiles.length} file(s) selected</p>
                                        <div className="grid grid-cols-5 gap-2">
                                            {galleryUploadFiles.map((file, i) => (
                                                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100">
                                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setGalleryUploadFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 text-white rounded-full"
                                                        aria-label={`Remove ${file.name}`}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => { setShowGalleryUploadModal(false); setGalleryUploadFiles([]); }} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Cancel</button>
                                <button type="submit" disabled={galleryUploading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {galleryUploading ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Uploading...</>
                                    ) : 'Upload Images'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {lightbox.open && lightbox.images.length > 0 && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center" onClick={() => setLightbox({ ...lightbox, open: false })}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, open: false }); }}
                        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                        aria-label="Close lightbox"
                    >
                        <X size={28} />
                    </button>
                    {lightbox.images.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index - 1 + lightbox.images.length) % lightbox.images.length }); }}
                                className="absolute left-4 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
                                aria-label="Previous image"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.images.length }); }}
                                className="absolute right-4 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-colors z-10"
                                aria-label="Next image"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}
                    <img
                        src={lightbox.images[lightbox.index]?.url}
                        alt={`Gallery image ${lightbox.index + 1}`}
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-6 text-white/60 text-sm">
                        {lightbox.index + 1} / {lightbox.images.length}
                    </div>
                </div>
            )}

            <ProfileModal
                open={showProfilePanel}
                onClose={() => setShowProfilePanel(false)}
                user={user}
                onUserUpdate={(u) => {
                    setUser(u);
                    localStorage.setItem('user', JSON.stringify(u));
                }}
                onLogout={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }}
            />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

// Helper Components
const StatsCard = ({ icon: Icon, label, count, color }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-${color}-500`}>
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold mt-1">{count}</h3>
            </div>
            <div className={`p-2 bg-${color}-50 text-${color}-600 rounded-lg`}>
                <Icon size={20} />
            </div>
        </div>
    </div>
);

const QuickActionCard = ({ title, icon: Icon, onClick }) => (
    <button onClick={onClick} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all flex items-center gap-4 text-left">
        <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Icon size={24} />
        </div>
        <span className="font-semibold text-slate-700">{title}</span>
    </button>
);



export default FacultyDashboard;
