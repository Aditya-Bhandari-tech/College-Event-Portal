import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, Clock, Users, Bell, Search, Grid, Image,
  FileText, UserPlus, Hand, ChevronRight, ChevronLeft, MapPin,
  Menu, X, Settings, User, Award, Check, Trash2, Maximize2,
  Camera, Edit2, Eye, EyeOff, Save, AlertCircle, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Events from './Events';
import Announcements from './Announcements';
import EmptyState from '../components/common/EmptyState';

// Role-based dashboard for Campus Pulse
// Supports: Student, Faculty, Admin roles
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Profile panel state
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', newPassword: '', confirmPassword: '' });
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const picInputRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Admin Data
  const [allUsers, setAllUsers] = useState([]);
  const [pendingFaculty, setPendingFaculty] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!storedUser || !token) {
      navigate('/login');
      return;
    }

    // Set from localStorage immediately (fast render)
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Then fetch fresh user from DB — ensures profilePic & all fields are up to date
    axiosInstance.get('/users/me')
      .then(res => {
        const freshUser = res.data?.data || res.data;
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      })
      .catch(() => {
        // If /me fails, keep using cached localStorage user silently
      });

    if (parsedUser.role === 'admin') {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      const usersData = response.data.data || response.data;
      setAllUsers(usersData);
      setPendingFaculty(usersData.filter(u => u.role === 'faculty' && !u.isApproved));
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/admin/users/${id}/approve`);
      setAllUsers(prev => prev.map(u => u._id === id ? { ...u, isApproved: true } : u));
      setPendingFaculty(prev => prev.filter(u => u._id !== id));
      alert("Faculty approved successfully");
    } catch (err) {
      alert("Failed to approve faculty");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject and delete this request?")) return;
    try {
      await axiosInstance.delete(`/admin/users/${id}`);
      setAllUsers(prev => prev.filter(u => u._id !== id));
      setPendingFaculty(prev => prev.filter(u => u._id !== id));
      alert("Request rejected");
    } catch (err) {
      alert("Failed to reject request");
    }
  }

  // Profile panel handlers
  const openProfilePanel = () => {
    setShowProfilePanel(true);
    setProfileEditMode(false);
    setProfileError('');
    setProfileSuccess('');
    setProfilePicFile(null);
    setProfilePicPreview(null);
    if (user) setProfileForm({ name: user.name || '', newPassword: '', confirmPassword: '' });
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      // Client-side password validation first
      if (profileForm.newPassword || profileForm.confirmPassword) {
        if (profileForm.newPassword !== profileForm.confirmPassword) {
          setProfileError('Passwords do not match');
          setProfileLoading(false);
          return;
        }
        if (profileForm.newPassword.length < 6) {
          setProfileError('Password must be at least 6 characters');
          setProfileLoading(false);
          return;
        }
      }

      // 1. Update name / password
      const payload = { name: profileForm.name.trim() };
      if (profileForm.newPassword) {
        payload.newPassword = profileForm.newPassword;
        payload.confirmPassword = profileForm.confirmPassword;
      }
      const profileRes = await axiosInstance.put('/users/profile', payload);
      let updatedUser = {
        ...user,
        name: profileRes.data?.data?.name || profileForm.name.trim(),
      };

      // 2. Upload profile pic if changed
      if (profilePicFile) {
        const formData = new FormData();
        formData.append('image', profilePicFile);
        const picRes = await axiosInstance.put('/users/profile-pic', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        updatedUser.profilePic = picRes.data?.data;
      }

      // 3. Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setProfileForm(f => ({ ...f, newPassword: '', confirmPassword: '' }));
      setProfilePicFile(null);
      setProfilePicPreview(null);
      setProfileSuccess('Profile updated successfully!');
      setProfileEditMode(false);
    } catch (err) {
      // sendError returns { success, message } — read message directly
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to update profile. Please try again.';
      setProfileError(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRegister = (eventId) => {
    alert("Registration feature coming soon! You will be able to register for this event.");
  };

  const handleViewDetails = (eventId) => {
    alert(`Viewing details for event ID: ${eventId}`);
  };

  // Data States
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({ ongoing: 0, upcoming: 0, finished: 0 });
  const [liveEvent, setLiveEvent] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [recentPhotos, setRecentPhotos] = useState([]);
  const [galleryEvents, setGalleryEvents] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventsRes, announcementsRes] = await Promise.all([
          axiosInstance.get('/events'),
          axiosInstance.get('/announcements')
        ]);

        const allEvents = eventsRes.data.data || [];
        const allAnnouncements = announcementsRes.data.data || [];

        setEvents(allEvents);
        setAnnouncements(allAnnouncements);

        const now = new Date();
        const ongoing = allEvents.filter(e => new Date(e.date).toDateString() === now.toDateString());
        const upcoming = allEvents.filter(e => new Date(e.date) > now);
        const finished = allEvents.filter(e => new Date(e.date) < now && new Date(e.date).toDateString() !== now.toDateString());

        setStats({ ongoing: ongoing.length, upcoming: upcoming.length, finished: finished.length });
        setLiveEvent(ongoing.length > 0 ? ongoing[0] : null);
        setUpcomingEvents(upcoming.slice(0, 3));
        setPastEvents(finished.slice(0, 3));

        // Extract real photos from events that have gallery images
        const allPhotos = allEvents
          .filter(e => e.images && e.images.length > 0)
          .flatMap(e => e.images.map(img => img.url))
          .slice(0, 3);
        setRecentPhotos(allPhotos);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Close mobile sidebar on route change
  const handleRouteChange = (route) => {
    setActiveRoute(route);
    setMobileSidebarOpen(false);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const navigation = [
    { name: 'Dashboard', icon: Grid },
    { name: 'Events', icon: Calendar },
    { name: 'Announcements', icon: Bell },
    { name: 'Gallery', icon: Image }
  ];

  if (loading || !user) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white" role="status" aria-label="Loading dashboard">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="sr-only">Loading dashboard...</span>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white" role="alert">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 rounded-lg">Retry</button>
      </div>
    </div>
  );

  const quickActions = user.role === 'student' ? [
    { name: 'Request Event', icon: UserPlus, subtitle: 'Submit a new event proposal', path: '/event-requests' },
    { name: 'Volunteer', icon: Hand, subtitle: 'Apply for volunteer roles', path: '/recruitment' },
    { name: 'My Applications', icon: FileText, subtitle: 'Track your event applications', path: '/recruitment' }
  ] : user.role === 'faculty' ? [
    { name: 'Create Event', icon: UserPlus, subtitle: 'Organize a new event', path: '/faculty' },
    { name: 'Manage Events', icon: Calendar, subtitle: 'View and edit your events', path: '/faculty' },
    { name: 'Post Announcement', icon: Bell, subtitle: 'Share important updates', path: '/faculty' }
  ] : [
    { name: 'Approve Events', icon: Award, subtitle: 'Review pending requests', path: '/admin/events' },
    { name: 'System Settings', icon: Settings, subtitle: 'Configure portal settings', path: '/admin/settings' },
    { name: 'User Management', icon: Users, subtitle: 'Manage users and roles', path: '/admin/users' }
  ];

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#f9f8f6' }}>
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
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 md:p-6 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 font-bold text-lg flex-shrink-0">
                GP
              </div>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="flex flex-col">
                  <span className="font-bold text-lg tracking-tight">CAMPUS PULSE</span>
                </div>
              )}
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Menu */}
          <div className="flex-1 overflow-y-auto py-4 md:py-6">
            <div className={`${sidebarCollapsed && !mobileSidebarOpen ? 'px-3' : 'px-4'} mb-4`}>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Main Menu</span>
              )}
            </div>
            <nav className={`space-y-1 ${sidebarCollapsed && !mobileSidebarOpen ? 'px-3' : 'px-4'}`}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleRouteChange(item.name)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      } ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center' : ''}`}
                  >
                    <Icon size={20} />
                    {(!sidebarCollapsed || mobileSidebarOpen) && <span className="font-medium">{item.name}</span>}
                  </button>
                );
              })}
            </nav>

            {/* Quick Actions in Sidebar */}
            <div className={`mt-8 ${sidebarCollapsed && !mobileSidebarOpen ? 'px-3' : 'px-4'}`}>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 block">Your Actions</span>
              )}
              <div className="space-y-1">
                {quickActions.slice(0, 2).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.name}
                      onClick={() => { navigate(action.path); setMobileSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-800/50 hover:text-white ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center' : ''}`}
                    >
                      <Icon size={20} />
                      {(!sidebarCollapsed || mobileSidebarOpen) && <span className="font-medium">{action.name}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Profile in Sidebar */}
          <div className="p-4 border-t border-slate-700/50">
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-sm shadow-lg flex-shrink-0">
                {user.avatar}
              </div>
              {(!sidebarCollapsed || mobileSidebarOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapse Toggle (desktop only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronRight size={14} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ml-0 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="px-4 md:px-8 py-3 md:py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu size={24} className="text-slate-700" />
              </button>

              <div className="hidden sm:block">
                <h1 className="text-lg md:text-2xl font-bold text-slate-900">
                  {getGreeting()}, <span className="text-blue-600">{user.name.split(' ')[0]}</span>
                </h1>
                <p className="text-xs md:text-sm text-slate-600 mt-0.5">Welcome back to your dashboard</p>
              </div>

              <div className="flex items-center gap-2 md:gap-4 flex-1 sm:flex-none justify-end">
                {/* Search (hidden on mobile) */}
                <div className="relative hidden lg:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Search events, announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 xl:w-80 bg-slate-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                    aria-label="Search events and announcements"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors" aria-label="Notifications, 2 unread">
                  <Bell size={20} className="text-slate-600" />
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold" aria-hidden="true">2</span>
                </button>

                {/* Profile Button */}
                <button
                  onClick={openProfilePanel}
                  className="flex items-center gap-2 md:gap-3 p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Open profile panel"
                >
                  {user.profilePic?.url ? (
                    <img
                      src={user.profilePic.url}
                      alt={user.name}
                      className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover shadow-md ring-2 ring-blue-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-xs md:text-sm text-white shadow-md">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                    <p className="text-xs text-blue-600 font-medium capitalize">{user.role === 'admin' ? 'Administration' : user.role}</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-500 hidden lg:block" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 md:p-6 lg:p-8" id="main-content">
          {activeRoute === 'Dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {/* Pending Faculty Requests (Admin Only) */}
                {user && user.role === 'admin' && pendingFaculty.length > 0 && (
                  <section aria-label="Pending faculty requests">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" aria-hidden="true" />
                      <h2 className="text-lg md:text-xl font-bold text-slate-900">Pending Faculty Requests</h2>
                    </div>
                    <div className="grid gap-3 md:gap-4">
                      {pendingFaculty.map((request) => (
                        <div key={request._id} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-base md:text-lg flex-shrink-0">
                              {request.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm md:text-base">{request.name}</h3>
                              <div className="text-xs md:text-sm text-slate-500 space-y-0.5 md:space-y-1">
                                <p className="flex items-center gap-1.5 md:gap-2">
                                  <Users size={12} /> {request.branch}
                                </p>
                                <p className="flex items-center gap-1.5 md:gap-2 truncate max-w-[200px]">
                                  <FileText size={12} /> {request.email}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                            <button
                              onClick={() => handleApprove(request._id)}
                              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg font-semibold text-xs md:text-sm transition-colors flex items-center justify-center gap-1.5"
                              aria-label={`Approve ${request.name}`}
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(request._id)}
                              className="flex-1 sm:flex-none px-3 md:px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg font-semibold text-xs md:text-sm transition-colors flex items-center justify-center gap-1.5"
                              aria-label={`Reject ${request.name}`}
                            >
                              <Trash2 size={14} /> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4" role="region" aria-label="Event statistics">
                  <StatsCard icon={Clock} label="Ongoing Events" count={stats.ongoing} iconBg="bg-amber-100" iconColor="text-amber-600" />
                  <StatsCard icon={Calendar} label="Upcoming Events" count={stats.upcoming} iconBg="bg-blue-100" iconColor="text-blue-600" />
                  <StatsCard icon={Users} label="Finished Events" count={stats.finished} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
                </div>

                {/* Happening Now */}
                {liveEvent && (
                  <section aria-label="Live event">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" aria-hidden="true" />
                      <h2 className="text-lg md:text-xl font-bold text-slate-900">Happening Now</h2>
                    </div>
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        <div className="relative h-48 md:h-64">
                          <img src={liveEvent.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'} alt={liveEvent.title} className="w-full h-full object-cover" />
                          <span className="absolute top-3 md:top-4 left-3 md:left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" aria-hidden="true" />
                            Live Now
                          </span>
                        </div>
                        <div className="p-4 md:p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{liveEvent.title}</h3>
                            <p className="text-sm md:text-base text-slate-600 mb-3 md:mb-4 line-clamp-2">{liveEvent.description}</p>
                            <div className="space-y-1.5 md:space-y-2">
                              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-700">
                                <Calendar size={14} className="text-slate-500 flex-shrink-0" />
                                <span>{new Date(liveEvent.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-700">
                                <MapPin size={14} className="text-slate-500 flex-shrink-0" />
                                <span>{liveEvent.venue}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs md:text-sm text-slate-700">
                                <Users size={14} className="text-slate-500 flex-shrink-0" />
                                <span>{liveEvent.branch || 'General'}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleViewDetails(liveEvent._id)}
                            className="mt-4 md:mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                          >
                            View Details
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Upcoming Events */}
                <section aria-label="Upcoming events">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900">Upcoming Events</h2>
                    <button onClick={() => handleRouteChange('Events')} className="text-blue-600 hover:text-blue-700 font-semibold text-xs md:text-sm flex items-center gap-1">
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  {upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                      {upcomingEvents.map((event) => (
                        <article key={event._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                          <div className="relative h-32 md:h-40">
                            <img src={event.image || 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop'} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                            <span className="absolute top-2 md:top-3 right-2 md:right-3 px-2 md:px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                              Upcoming
                            </span>
                          </div>
                          <div className="p-3 md:p-4">
                            <h3 className="font-bold text-slate-900 mb-1 md:mb-2 truncate text-sm md:text-base">{event.title}</h3>
                            <p className="text-xs md:text-sm text-slate-600 mb-2 md:mb-3 line-clamp-2">{event.description}</p>
                            <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                              <div className="flex items-center gap-1.5 md:gap-2 text-xs text-slate-700">
                                <Calendar size={12} className="text-slate-500 flex-shrink-0" />
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5 md:gap-2 text-xs text-slate-700">
                                <MapPin size={12} className="text-slate-500 flex-shrink-0" />
                                <span className="truncate">{event.venue}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(event._id)}
                                className="flex-1 px-3 md:px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-xs md:text-sm font-medium"
                              >
                                View Details
                              </button>
                              {user.role === 'student' && (
                                <button
                                  onClick={() => handleRegister(event._id)}
                                  className="flex-1 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all text-xs md:text-sm font-semibold"
                                >
                                  Register
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-8 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 text-sm">
                      No upcoming events found.
                    </div>
                  )}
                </section>

                {/* Latest Announcements */}
                <section aria-label="Latest announcements">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg md:text-xl font-bold text-slate-900">Latest Announcements</h2>
                    <button onClick={() => handleRouteChange('Announcements')} className="text-blue-600 hover:text-blue-700 font-semibold text-xs md:text-sm flex items-center gap-1">
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
                    {announcements.length > 0 ? announcements.slice(0, 4).map((announcement) => (
                      <article key={announcement._id} className="p-3 md:p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-slate-600 text-sm">
                            {(announcement.createdBy?.name || 'Admin').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-slate-900 text-sm md:text-base">{announcement.title}</h3>
                                {announcement.important && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                    Important
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs md:text-sm text-slate-600 mb-1.5 md:mb-2 line-clamp-2">{announcement.message}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs md:text-sm text-slate-700">{announcement.createdBy?.name || 'Admin'}</span>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${announcement.authorRole === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                                }`}>
                                {announcement.createdBy?.role || 'Faculty'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </article>
                    )) : (
                      <div className="p-6 md:p-8 text-center text-slate-500 text-sm">No announcements found.</div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="space-y-4 md:space-y-6">
                {/* Quick Actions */}
                <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-900 mb-3 md:mb-4 text-sm md:text-base">Quick Actions</h3>
                  <div className="space-y-2 md:space-y-3">
                    {quickActions.map(action => (
                      <button key={action.name} onClick={() => navigate(action.path)} className="w-full flex items-center gap-3 p-2.5 md:p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left group">
                        <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600 group-hover:scale-110 transition-transform flex-shrink-0">
                          <action.icon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-700 text-xs md:text-sm">{action.name}</p>
                          <p className="text-xs text-slate-500 truncate">{action.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Photos */}
                {recentPhotos.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5">
                    <h3 className="font-bold text-slate-900 mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                      <div className="w-1 h-5 bg-blue-500 rounded-full" aria-hidden="true" />
                      Recent Photos
                    </h3>
                    <div className="grid grid-cols-3 gap-2 mb-3 md:mb-4">
                      {recentPhotos.map((photo, index) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
                          <img src={photo} alt={`Recent campus photo ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleRouteChange('Gallery')}
                      className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-xs md:text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      View Full Gallery
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeRoute === 'Events' && <Events userRole={user.role} user={user} />}
          {activeRoute === 'Announcements' && <Announcements userRole={user.role} user={user} />}
          {activeRoute === 'Gallery' && <GalleryView galleryEvents={galleryEvents} galleryLoading={galleryLoading} setGalleryEvents={setGalleryEvents} setGalleryLoading={setGalleryLoading} lightbox={lightbox} setLightbox={setLightbox} axiosInstance={axiosInstance} userRole={user.role} user={user} />}
        </main>
      </div>

      {/* ─── Profile Modal (centered) ─── */}
      {showProfilePanel && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => { setShowProfilePanel(false); setProfileEditMode(false); }}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fadeIn"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-label="Profile"
          >
            {/* Modal Header — gradient banner */}
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 px-6 pt-8 pb-16 text-center">
              <button
                onClick={() => { setShowProfilePanel(false); setProfileEditMode(false); }}
                className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <h2 className="text-white font-bold text-lg">
                {profileEditMode ? 'Edit Profile' : 'My Profile'}
              </h2>
            </div>

            {/* Avatar — overlaps banner */}
            <div className="flex justify-center -mt-12 mb-3 relative z-10">
              <div className="relative">
                {profilePicPreview || user?.profilePic?.url ? (
                  <img
                    src={profilePicPreview || user.profilePic.url}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover shadow-xl ring-4 ring-white"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-3xl text-white shadow-xl ring-4 ring-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {profileEditMode && (
                  <button
                    onClick={() => picInputRef.current?.click()}
                    className="absolute bottom-0.5 right-0.5 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full shadow-lg transition-colors border-2 border-white"
                    aria-label="Change photo"
                  >
                    <Camera size={13} />
                  </button>
                )}
                <input ref={picInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-2 space-y-4 max-h-[55vh] overflow-y-auto">
              {/* Alerts */}
              {profileError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}
              {profileSuccess && !profileEditMode && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
                  <CheckCircle size={15} className="flex-shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {/* View mode: name + role badge */}
              {!profileEditMode && (
                <div className="text-center">
                  <h3 className="font-bold text-xl text-slate-900">{user?.name}</h3>
                  <span className="inline-block mt-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                    {user?.role === 'admin' ? 'Administration' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </span>
                </div>
              )}

              {/* View mode: info cards */}
              {!profileEditMode && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Role</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {user?.role === 'admin' ? 'Administration' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                    <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText size={14} className="text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Email</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Edit mode: name field */}
              {profileEditMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Your full name"
                  />
                </div>
              )}

              {/* Edit mode: password fields */}
              {profileEditMode && (
                <div className="space-y-3 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Change Password <span className="normal-case"> — optional</span></p>
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">New Password</label>
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={profileForm.newPassword}
                      onChange={e => setProfileForm(f => ({ ...f, newPassword: e.target.value }))}
                      className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Min. 6 characters"
                    />
                    <button type="button" onClick={() => setShowNewPass(v => !v)} className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-600">
                      {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Confirm Password</label>
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={profileForm.confirmPassword}
                      onChange={e => setProfileForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Repeat new password"
                    />
                    <button type="button" onClick={() => setShowConfirmPass(v => !v)} className="absolute right-3 bottom-2.5 text-slate-400 hover:text-slate-600">
                      {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 space-y-2.5">
              {profileEditMode ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setProfileEditMode(false); setProfileError(''); setProfilePicFile(null); setProfilePicPreview(null); setProfileForm(f => ({ ...f, newPassword: '', confirmPassword: '' })); }}
                    disabled={profileLoading}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={profileLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-60"
                  >
                    {profileLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
                    {profileLoading ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { setProfileEditMode(true); setProfileSuccess(''); setProfileError(''); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  <Edit2 size={15} />
                  Edit Profile
                </button>
              )}
              {/* Logout button — opens custom confirm dialog */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-semibold text-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Logout Confirmation Dialog ─── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[80] backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">Sign out?</h3>
              <p className="text-sm text-slate-500 mb-6">You'll need to log in again to access your dashboard.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (min-width: 768px) {
          .main-content-area {
            margin-left: ${sidebarCollapsed ? '5rem' : '16rem'};
          }
        }
      `}</style>

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
            src={lightbox.images[lightbox.index]?.url || lightbox.images[lightbox.index]}
            alt={`Gallery image ${lightbox.index + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-6 text-white/60 text-sm">
            {lightbox.index + 1} / {lightbox.images.length}
          </div>
        </div>
      )}
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, count, iconBg, iconColor }) => {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group" role="status">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={20} className={iconColor} />
        </div>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-slate-600 transition-colors" />
      </div>
      <div>
        <p className="text-slate-600 text-xs md:text-sm font-medium mb-1">{label}</p>
        <p className="text-2xl md:text-3xl font-bold text-slate-900">{count}</p>
      </div>
    </div>
  );
};

// Gallery View Component
const GalleryView = ({ galleryEvents, galleryLoading, setGalleryEvents, setGalleryLoading, lightbox, setLightbox, axiosInstance, userRole, user }) => {
  const [allEvents, setAllEvents] = React.useState([]);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [uploadEventId, setUploadEventId] = React.useState('');
  const [uploadFiles, setUploadFiles] = React.useState([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const [deletingId, setDeletingId] = React.useState(null);
  const fileInputRef = React.useRef(null);

  const canManage = userRole === 'admin' || userRole === 'faculty';

  useEffect(() => {
    const fetchGallery = async () => {
      setGalleryLoading(true);
      try {
        const res = await axiosInstance.get('/events');
        const evts = res.data.data || [];
        setAllEvents(evts);
        setGalleryEvents(evts.filter(e => e.images && e.images.length > 0));
      } catch (err) {
        console.error('Failed to fetch gallery:', err);
      } finally {
        setGalleryLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const openLightbox = (images, index) => setLightbox({ open: true, images, index });

  /* ── Upload ── */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadEventId) { setUploadError('Please select an event.'); return; }
    if (uploadFiles.length === 0) { setUploadError('Please select at least one image.'); return; }
    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      uploadFiles.forEach(f => formData.append('images', f));
      const res = await axiosInstance.post(`/events/${uploadEventId}/gallery`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Refresh gallery
      const refreshRes = await axiosInstance.get('/events');
      const evts = refreshRes.data.data || [];
      setAllEvents(evts);
      setGalleryEvents(evts.filter(ev => ev.images && ev.images.length > 0));
      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadEventId('');
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  /* ── Delete image ── */
  const handleDeleteImage = async (eventId, publicId) => {
    if (!window.confirm('Delete this photo?')) return;
    setDeletingId(publicId);
    try {
      // publicId may contain slashes (Cloudinary folder/id) — encode it
      await axiosInstance.delete(`/events/${eventId}/gallery/${encodeURIComponent(publicId)}`);
      setGalleryEvents(prev => prev.map(ev => {
        if (ev._id !== eventId) return ev;
        return { ...ev, images: ev.images.filter(img => img.public_id !== publicId) };
      }).filter(ev => ev.images.length > 0));
    } catch (err) {
      console.error('Delete image failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (galleryLoading) {
    return (
      <div className="flex justify-center py-16" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="sr-only">Loading gallery...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Event Gallery</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {galleryEvents.reduce((sum, e) => sum + e.images.length, 0)} photos across {galleryEvents.length} events
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => { setUploadError(''); setShowUploadModal(true); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow hover:shadow-lg hover:shadow-blue-500/25 transition-all text-sm"
          >
            <Image size={15} />
            <span className="hidden sm:inline">Upload Photos</span>
          </button>
        )}
      </div>

      {galleryEvents.length === 0 ? (
        <EmptyState message="No gallery images yet. Upload images to events to see them here." />
      ) : (
        galleryEvents.map(event => (
          <section key={event._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{event.title}</h3>
                <div className="flex items-center gap-3 mt-0.5 text-sm text-slate-500">
                  <span className="flex items-center gap-1"><Calendar size={13} /> {new Date(event.date).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><MapPin size={13} /> {event.venue}</span>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                {event.images.length} photos
              </span>
            </div>

            <div className="p-3 md:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                {event.images.map((img, idx) => (
                  <div
                    key={img.public_id || idx}
                    className="group aspect-square rounded-xl overflow-hidden cursor-pointer relative"
                  >
                    <img
                      src={img.url}
                      alt={`${event.title} photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onClick={() => openLightbox(event.images, idx)}
                    />
                    <div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center"
                      onClick={() => openLightbox(event.images, idx)}
                    >
                      <Maximize2 size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {/* Delete button for faculty/admin */}
                    {canManage && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteImage(event._id, img.public_id); }}
                        disabled={deletingId === img.public_id}
                        className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-md disabled:opacity-50"
                        title="Delete photo"
                      >
                        {deletingId === img.public_id
                          ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <X size={12} />
                        }
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))
      )}

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
              <h2 className="text-white font-bold text-lg">Upload Photos</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-white/70 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {uploadError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Select Event *</label>
                <select
                  value={uploadEventId}
                  onChange={e => setUploadEventId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
                >
                  <option value="">Choose an event…</option>
                  {allEvents.map(ev => (
                    <option key={ev._id} value={ev._id}>{ev.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Photos *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center cursor-pointer transition-colors"
                >
                  <Image size={28} className="mx-auto text-slate-300 mb-2" />
                  {uploadFiles.length > 0 ? (
                    <p className="text-sm text-blue-600 font-semibold">{uploadFiles.length} file{uploadFiles.length > 1 ? 's' : ''} selected</p>
                  ) : (
                    <p className="text-sm text-slate-500">Click to select images (max 10)</p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={e => setUploadFiles(Array.from(e.target.files).slice(0, 10))}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
                    : <><Image size={15} /> Upload Photos</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
