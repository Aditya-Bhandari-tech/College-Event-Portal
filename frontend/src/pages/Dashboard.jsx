import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar, Clock, Users, Bell, Search, Grid, Image,
  FileText, UserPlus, Hand, ChevronRight, ChevronLeft, MapPin,
  Menu, X, Settings, User, Award, Check, Trash2, Maximize2,
  Camera, Edit2, Eye, EyeOff, Save, AlertCircle, CheckCircle,
  CheckCheck, BriefcaseBusiness, Sun, Moon, ToggleLeft, ToggleRight,
  Shield, Globe, Building2, Mail, BookOpen, Megaphone, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Events from './Events';
import Announcements from './Announcements';
import EmptyState from '../components/common/EmptyState';
import { useTheme } from '../contexts/ThemeContext';
import DarkModeToggle from '../components/common/DarkModeToggle';

// Role-based dashboard for Campus Pulse
// Supports: Student, Faculty, Admin roles
const Dashboard = () => {
  const navigate = useNavigate();
  // ── Theme (from global ThemeContext) ─────────────────────────
  const { darkMode, portalSettings } = useTheme();
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


  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('notif_read') || '[]')); }
    catch { return new Set(); }
  });
  const notifRef = useRef(null);

  // Helper: relative time
  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
  };

  // Fetch and aggregate all notifications
  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const [eventsRes, announcementsRes, eventRequestsRes, recruitmentsRes, usersRes] = await Promise.allSettled([
        axiosInstance.get('/events'),
        axiosInstance.get('/announcements'),
        axiosInstance.get('/event-requests'),
        axiosInstance.get('/recruitments'),
        axiosInstance.get('/admin/users'),
      ]);

      const items = [];

      // Events
      if (eventsRes.status === 'fulfilled') {
        (eventsRes.value.data?.data || []).forEach(e => {
          items.push({
            id: `event_${e._id}`,
            type: 'event',
            title: e.title,
            subtitle: `New event • ${e.venue || 'Campus'}`,
            time: e.createdAt || e.date,
            route: 'Events',
          });
        });
      }

      // Announcements
      if (announcementsRes.status === 'fulfilled') {
        (announcementsRes.value.data?.data || []).forEach(a => {
          items.push({
            id: `ann_${a._id}`,
            type: 'announcement',
            title: a.title,
            subtitle: `Announcement by ${a.createdBy?.name || 'Admin'}`,
            time: a.createdAt,
            route: 'Announcements',
          });
        });
      }

      // Event Requests (pending only)
      if (eventRequestsRes.status === 'fulfilled') {
        (eventRequestsRes.value.data?.data || []).filter(r => r.status === 'pending').forEach(r => {
          items.push({
            id: `evtreq_${r._id}`,
            type: 'eventRequest',
            title: r.title || r.eventName || 'Event Request',
            subtitle: `Pending request by ${r.requestedBy?.name || 'Student'}`,
            time: r.createdAt,
            route: 'Events',
          });
        });
      }

      // Recruitments
      if (recruitmentsRes.status === 'fulfilled') {
        (recruitmentsRes.value.data?.data || recruitmentsRes.value.data || []).forEach(r => {
          items.push({
            id: `recruit_${r._id}`,
            type: 'recruitment',
            title: r.title || r.position || 'Recruitment',
            subtitle: `Open recruitment • ${r.applicants?.length || 0} applicant(s)`,
            time: r.createdAt,
            route: 'Events',
          });
        });
      }

      // Faculty Approval Requests
      if (usersRes.status === 'fulfilled') {
        (usersRes.value.data?.data || []).filter(u => u.role === 'faculty' && !u.isApproved).forEach(u => {
          items.push({
            id: `facapproval_${u._id}`,
            type: 'approval',
            title: `${u.name} requests faculty access`,
            subtitle: `Approval needed • ${u.email}`,
            time: u.createdAt,
            route: 'Dashboard',
          });
        });
      }

      // Sort newest first
      items.sort((a, b) => new Date(b.time) - new Date(a.time));
      setNotifications(items);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const markRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('notif_read', JSON.stringify([...next]));
      return next;
    });
  };

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(prev => {
      const next = new Set([...prev, ...allIds]);
      localStorage.setItem('notif_read', JSON.stringify([...next]));
      return next;
    });
  };

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    setNotifOpen(false);
    handleRouteChange(notif.route);
  };

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

  // Fetch notifications once user is set (admin only)
  useEffect(() => {
    if (user?.role === 'admin') fetchNotifications();
  }, [user, fetchNotifications]);

  // Close notification panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

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
          .slice(0, 6);
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
    { name: 'Gallery', icon: Image },
    ...(user?.role === 'admin' ? [{ name: 'Settings', icon: Settings }] : [])
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
    { name: 'System Settings', icon: Settings, subtitle: 'Configure portal settings', action: 'Settings' },
    { name: 'User Management', icon: Users, subtitle: 'Manage users and roles', path: '/admin/users' },
    { name: 'Photo Gallery', icon: Image, subtitle: 'Browse event photo collections', action: 'Gallery' }
  ];

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
                      ? 'text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                      } ${sidebarCollapsed && !mobileSidebarOpen ? 'justify-center' : ''}`}
                    style={isActive ? { background: 'linear-gradient(135deg, var(--accent-from, #3b82f6), var(--accent-to, #4f46e5))' } : {}}
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
        <header className={`sticky top-0 z-30 backdrop-blur-xl border-b shadow-sm transition-colors duration-300 ${darkMode ? 'bg-slate-900/90 border-slate-700/60' : 'bg-white/80 border-slate-200/60'}`}>
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
                <h1 className={`text-lg md:text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {getGreeting()}, <span className="text-blue-500">{user.name.split(' ')[0]}</span>
                </h1>
                <p className={`text-xs md:text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>Welcome back to your dashboard</p>
              </div>

              <div className="flex items-center gap-2 md:gap-4 flex-1 sm:flex-none justify-end">
                {/* Search (hidden on mobile) */}
                <div className="relative hidden lg:block">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} size={18} />
                  <input
                    type="text"
                    placeholder="Search events, announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-2 w-64 xl:w-80 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-sm ${darkMode ? 'bg-slate-800 text-white placeholder-slate-400 focus:bg-slate-700' : 'bg-slate-100 focus:bg-white'}`}
                    aria-label="Search events and announcements"
                  />
                </div>

                {/* Dark / Light Mode Toggle — reusable component */}
                <DarkModeToggle />

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(o => !o); if (!notifOpen) fetchNotifications(); }}
                    className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  >
                    <Bell size={20} className={notifOpen ? 'text-blue-600' : 'text-slate-600'} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-0.5" aria-hidden="true">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel */}
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-notifSlide">
                      {/* Panel Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center gap-2">
                          <Bell size={16} className="text-blue-600" />
                          <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllRead}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Mark all as read"
                            >
                              <CheckCheck size={13} /> All read
                            </button>
                          )}
                          <button onClick={() => setNotifOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Notification List */}
                      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50">
                        {notifLoading ? (
                          <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
                            <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                            <span className="text-sm">Loading notifications…</span>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                              <Bell size={22} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-medium">All caught up!</p>
                            <p className="text-xs mt-1">No new notifications</p>
                          </div>
                        ) : notifications.map(notif => {
                          const isUnread = !readIds.has(notif.id);
                          const typeConfig = {
                            event: { bg: 'bg-blue-100', text: 'text-blue-600', Icon: Calendar, label: 'Event' },
                            announcement: { bg: 'bg-amber-100', text: 'text-amber-600', Icon: Bell, label: 'Announcement' },
                            eventRequest: { bg: 'bg-purple-100', text: 'text-purple-600', Icon: FileText, label: 'Event Request' },
                            recruitment: { bg: 'bg-emerald-100', text: 'text-emerald-600', Icon: BriefcaseBusiness, label: 'Recruitment' },
                            approval: { bg: 'bg-red-100', text: 'text-red-600', Icon: UserPlus, label: 'Approval' },
                          }[notif.type] || { bg: 'bg-slate-100', text: 'text-slate-600', Icon: Bell, label: 'Notice' };

                          return (
                            <button
                              key={notif.id}
                              onClick={() => handleNotifClick(notif)}
                              className={`w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition-colors group ${isUnread ? 'bg-blue-50/40' : ''}`}
                            >
                              {/* Icon chip */}
                              <div className={`flex-shrink-0 w-9 h-9 ${typeConfig.bg} rounded-xl flex items-center justify-center mt-0.5`}>
                                <typeConfig.Icon size={16} className={typeConfig.text} />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm font-semibold text-slate-900 truncate leading-snug ${isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                                    {notif.title}
                                  </p>
                                  {isUnread && <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 truncate">{notif.subtitle}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${typeConfig.bg} ${typeConfig.text}`}>
                                    {typeConfig.label}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{timeAgo(notif.time)}</span>
                                </div>
                              </div>

                              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 mt-2 transition-colors" />
                            </button>
                          );
                        })}
                      </div>

                      {/* Panel Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-center">
                          <p className="text-xs text-slate-400">{notifications.length} total notification{notifications.length !== 1 ? 's' : ''}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

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
                    <p className={`font-semibold text-sm ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>{user.name}</p>
                    <p className="text-xs text-blue-500 font-medium capitalize">{user.role === 'admin' ? 'Administration' : user.role}</p>
                  </div>
                  <ChevronRight size={16} className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} hidden lg:block`} />
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
                      <button
                        key={action.name}
                        onClick={() => action.action ? handleRouteChange(action.action) : navigate(action.path)}
                        className="w-full flex items-center gap-3 p-2.5 md:p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors text-left group"
                      >
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

                {/* Photo Gallery Preview */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                      <div className="w-1 h-5 bg-indigo-500 rounded-full" aria-hidden="true" />
                      Photo Gallery
                    </h3>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                      {recentPhotos.length} photo{recentPhotos.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {recentPhotos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1.5 mb-3 md:mb-4">
                      {recentPhotos.slice(0, 6).map((photo, index) => (
                        <div
                          key={index}
                          className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                          onClick={() => handleRouteChange('Gallery')}
                        >
                          <img
                            src={photo}
                            alt={`Campus event photo ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 mb-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-2">
                        <Camera size={18} className="text-indigo-500" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">No event photos yet</p>
                      <p className="text-xs text-slate-400">Upload photos via Gallery</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleRouteChange('Gallery')}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-xs md:text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Image size={14} />
                    View Gallery
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeRoute === 'Events' && <Events userRole={user.role} user={user} />}
          {activeRoute === 'Announcements' && <Announcements userRole={user.role} user={user} />}
          {activeRoute === 'Gallery' && <GalleryView galleryEvents={galleryEvents} galleryLoading={galleryLoading} setGalleryEvents={setGalleryEvents} setGalleryLoading={setGalleryLoading} lightbox={lightbox} setLightbox={setLightbox} axiosInstance={axiosInstance} userRole={user.role} user={user} />}
          {activeRoute === 'Settings' && <SettingsView user={user} stats={stats} allUsers={allUsers} />}
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

        @keyframes notifSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-notifSlide {
          animation: notifSlide 0.18s ease-out;
          transform-origin: top right;
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

        /* ━━━━━━ Dark Mode Global Overrides ━━━━━━
           Applied via .dark parent class on root div.
           Cascades to all hardcoded Tailwind color classes
           without needing to touch individual JSX elements. */

        .dark .bg-white { background-color: #1e293b !important; }
        .dark .bg-slate-50 { background-color: #1e293b !important; }
        .dark .bg-slate-100 { background-color: #334155 !important; }
        .dark .bg-slate-200 { background-color: #475569 !important; }
        .dark .bg-\\[\\#f9f8f6\\] { background-color: #0f172a !important; }

        .dark .border-slate-200 { border-color: #334155 !important; }
        .dark .border-slate-100 { border-color: #1e293b !important; }
        .dark .divide-slate-200 > * + * { border-color: #334155 !important; }

        .dark .text-slate-900 { color: #f1f5f9 !important; }
        .dark .text-slate-800 { color: #e2e8f0 !important; }
        .dark .text-slate-700 { color: #cbd5e1 !important; }
        .dark .text-slate-600 { color: #94a3b8 !important; }
        .dark .text-slate-500 { color: #64748b !important; }

        .dark .shadow-sm { box-shadow: 0 1px 3px rgba(0,0,0,0.4) !important; }
        .dark .shadow-md { box-shadow: 0 4px 6px rgba(0,0,0,0.4) !important; }

        /* Cards & Rounded containers */
        .dark .bg-white.rounded-2xl,
        .dark .bg-white.rounded-xl,
        .dark .bg-white.rounded-lg { background-color: #1e293b !important; }

        /* Stats card hover */
        .dark .hover\\:shadow-md:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important; }

        /* Announcement / event hover rows */
        .dark .hover\\:bg-slate-50:hover { background-color: #334155 !important; }

        /* Input fields */
        .dark input:not([class*="bg-"]) { background-color: #0f172a; color: #f1f5f9; border-color: #475569; }
        .dark .focus\\:bg-white:focus { background-color: #1e293b !important; }

        /* Notification panel in dark */
        .dark [class*="rounded-2xl"][class*="bg-white"] { background-color: #1e293b !important; }
        .dark .from-slate-50 { --tw-gradient-from: #1e293b !important; }
        .dark .to-white { --tw-gradient-to: #1e293b !important; }
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

// ─── Settings View Component ───────────────────────────────────────────────
const SettingsView = ({ user, stats, allUsers }) => {
  // All settings come from the global ThemeContext — no local copy
  const {
    darkMode, toggleDarkMode,
    portalSettings: settings,
    updateSetting: update,
    saveSettings,
    applyAccent,
    ACCENT_MAP,
  } = useTheme();

  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    saveSettings();   // persists the current in-memory settings to localStorage
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const dm = darkMode;
  const card = `rounded-2xl border p-5 md:p-6 mb-4 md:mb-6 transition-colors ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`;
  const label = `block text-xs font-semibold uppercase tracking-wide mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`;
  const input = `w-full px-3 py-2.5 rounded-xl border text-sm transition-colors ${darkMode ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400'} outline-none focus:ring-2 focus:ring-blue-500/30`;
  const sectionTitle = `font-bold text-base md:text-lg mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`;
  const sectionSub = `text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'} mb-5`;

  const ToggleSwitch = ({ value, onChange, label: tLabel, desc }) => (
    <div className={`flex items-center justify-between py-3.5 border-b last:border-b-0 ${dm ? 'border-slate-800' : 'border-slate-100'}`}>
      <div className="flex-1 pr-4">
        <p className={`text-sm font-semibold ${dm ? 'text-slate-200' : 'text-slate-700'}`}>{tLabel}</p>
        {desc && <p className={`text-xs mt-0.5 leading-relaxed ${dm ? 'text-slate-500' : 'text-slate-400'}`}>{desc}</p>}
      </div>
      {/* iOS-style Toggle */}
      <button
        onClick={() => onChange(!value)}
        role="switch"
        aria-checked={value}
        className={`relative inline-flex flex-shrink-0 h-7 w-[52px] rounded-full cursor-pointer
          transition-colors duration-300 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
          ${value
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-inner shadow-blue-700/30'
            : dm ? 'bg-slate-700' : 'bg-slate-200'
          }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0
            transition-transform duration-300 ease-in-out my-1
            ${value ? 'translate-x-7' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );


  return (
    <div className="max-w-3xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl md:text-2xl font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>System Settings</h2>
          <p className={`text-sm mt-0.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`}>Configure the Campus Pulse portal for your institution</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${saved
            ? 'bg-emerald-500 text-white'
            : 'text-white hover:opacity-90 hover:shadow-lg'
            }`}
          style={!saved ? { background: `linear-gradient(135deg, var(--accent-from, #3b82f6), var(--accent-to, #4f46e5))` } : {}}
        >
          {saved ? <><CheckCircle size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>

      {/* ── 1. Portal Configuration ── */}
      <div className={card}>
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dm ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <Building2 size={18} className="text-blue-500" />
          </div>
          <div>
            <p className={sectionTitle}>Portal Configuration</p>
            <p className={sectionSub}>Basic information about your institution and event portal</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className={label}>College / Institution Name</label>
            <input className={input} value={settings.collegeName} onChange={e => update('collegeName', e.target.value)} placeholder="e.g. Campus Pulse College" />
          </div>
          <div>
            <label className={label}>Portal Tagline</label>
            <input className={input} value={settings.tagline} onChange={e => update('tagline', e.target.value)} placeholder="e.g. Connecting students through events" />
          </div>
          <div>
            <label className={label}>Academic Year</label>
            <input className={input} value={settings.academicYear} onChange={e => update('academicYear', e.target.value)} placeholder="e.g. 2024-2025" />
          </div>
          <div>
            <label className={label}>Admin Contact Email</label>
            <input className={input} type="email" value={settings.contactEmail} onChange={e => update('contactEmail', e.target.value)} placeholder="admin@college.edu" />
          </div>
          <div>
            <label className={label}>Department / Office</label>
            <input className={input} value={settings.department} onChange={e => update('department', e.target.value)} placeholder="e.g. Student Affairs" />
          </div>
          <div>
            <label className={label}>Default Max Event Capacity</label>
            <input className={input} type="number" value={settings.maxEventCapacity} onChange={e => update('maxEventCapacity', e.target.value)} placeholder="e.g. 500" />
          </div>
        </div>
      </div>

      {/* ── 2. Event & Registration Settings ── */}
      <div className={card}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dm ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
            <Calendar size={18} className="text-amber-500" />
          </div>
          <div>
            <p className={sectionTitle}>Event & Registration Settings</p>
            <p className={sectionSub}>Control what features are enabled for students and faculty</p>
          </div>
        </div>
        <ToggleSwitch value={settings.eventRegistration} onChange={v => update('eventRegistration', v)} label="Student Event Registration" desc="Allow students to register for events on the portal" />
        <ToggleSwitch value={settings.studentEventRequests} onChange={v => update('studentEventRequests', v)} label="Student Event Requests" desc="Students can submit requests for new events" />
        <ToggleSwitch value={settings.facultyAnnouncements} onChange={v => update('facultyAnnouncements', v)} label="Faculty Announcements" desc="Faculty can post announcements to all students" />
        <ToggleSwitch value={settings.galleryUploads} onChange={v => update('galleryUploads', v)} label="Photo Gallery Uploads" desc="Allow faculty/admin to upload event photos" />
        <ToggleSwitch value={settings.recruitmentOpen} onChange={v => update('recruitmentOpen', v)} label="Recruitment / Volunteering" desc="Enable student volunteer and recruitment applications" />
      </div>

      {/* ── 3. Notification Preferences ── */}
      <div className={card}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dm ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
            <Bell size={18} className="text-purple-500" />
          </div>
          <div>
            <p className={sectionTitle}>Notification Preferences</p>
            <p className={sectionSub}>Manage what alerts the admin receives in the notification panel</p>
          </div>
        </div>
        <ToggleSwitch value={settings.emailNotifications} onChange={v => update('emailNotifications', v)} label="Email Notifications" desc="Receive email alerts for new events and announcements" />
        <ToggleSwitch value={settings.approvalNotifications} onChange={v => update('approvalNotifications', v)} label="Faculty Approval Alerts" desc="Get notified when a new faculty registration is pending" />
        <ToggleSwitch value={settings.eventReminders} onChange={v => update('eventReminders', v)} label="Event Reminders" desc="Show reminders for upcoming events on the dashboard" />
      </div>

      {/* ── 4. Appearance ── */}
      <div className={card}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dm ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
            <Star size={18} className="text-indigo-500" />
          </div>
          <div>
            <p className={sectionTitle}>Appearance</p>
            <p className={sectionSub}>Customise the look and feel of the portal dashboard</p>
          </div>
        </div>

        {/* Dark / Light toggle row */}
        <div className={`flex items-center justify-between py-3 border-b ${dm ? 'border-slate-800' : 'border-slate-100'}`}>
          <div>
            <p className={`text-sm font-semibold ${dm ? 'text-slate-200' : 'text-slate-700'}`}>Dark Mode</p>
            <p className={`text-xs mt-0.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Toggle between light and dark interface</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${dm ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30' : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
              }`}
          >
            {dm ? <><Sun size={14} className="text-amber-400" /> Light Mode</> : <><Moon size={14} /> Dark Mode</>}
          </button>
        </div>

        {/* Accent color */}
        <div className="flex items-start justify-between py-3.5 gap-4">
          <div>
            <p className={`text-sm font-semibold ${dm ? 'text-slate-200' : 'text-slate-700'}`}>Accent Colour</p>
            <p className={`text-xs mt-0.5 ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Applies instantly to buttons and highlights across the portal</p>
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap justify-end max-w-[180px]">
            {Object.values(ACCENT_MAP).map(c => (
              <button
                key={c.key}
                onClick={() => applyAccent(c.key)}
                title={c.label}
                aria-label={`${c.label} accent colour`}
                style={{ backgroundColor: c.hex }}
                className={`w-7 h-7 rounded-full transition-all duration-200 focus:outline-none ${settings.accentColor === c.key
                  ? 'ring-2 ring-offset-2 scale-110 shadow-lg ring-white'
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. About / Portal Stats ── */}
      <div className={card}>
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dm ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
            <Shield size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className={sectionTitle}>Portal Overview</p>
            <p className={sectionSub}>Live portal statistics for the current academic year</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Users', value: allUsers?.length ?? '—', color: 'text-blue-500', bg: dm ? 'bg-blue-500/10' : 'bg-blue-50' },
            { label: 'Events', value: (stats?.ongoing + stats?.upcoming + stats?.finished) || '—', color: 'text-amber-500', bg: dm ? 'bg-amber-500/10' : 'bg-amber-50' },
            { label: 'Ongoing Today', value: stats?.ongoing ?? '—', color: 'text-red-500', bg: dm ? 'bg-red-500/10' : 'bg-red-50' },
            { label: 'Upcoming', value: stats?.upcoming ?? '—', color: 'text-emerald-500', bg: dm ? 'bg-emerald-500/10' : 'bg-emerald-50' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className={`text-xs mt-1 font-medium ${dm ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
            </div>
          ))}
        </div>
        <div className={`mt-4 p-3 rounded-xl flex items-center gap-3 ${dm ? 'bg-slate-800' : 'bg-slate-50'}`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${dm ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
            <Globe size={14} className="text-blue-500" />
          </div>
          <div>
            <p className={`text-xs font-semibold ${dm ? 'text-slate-300' : 'text-slate-700'}`}>Campus Pulse — College Event Portal</p>
            <p className={`text-xs ${dm ? 'text-slate-500' : 'text-slate-400'}`}>Version 1.0.0 · Academic Year {settings.academicYear}</p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 rounded-full px-2 py-0.5 font-bold">● Online</span>
          </div>
        </div>
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
