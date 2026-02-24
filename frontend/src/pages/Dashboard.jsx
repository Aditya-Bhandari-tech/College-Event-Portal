import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Calendar, Clock, Users, Bell, Search, Grid, Image,
  FileText, UserPlus, Hand, ChevronRight, ChevronLeft, MapPin,
  Menu, X, Settings, User, Award, Check, Trash2, Maximize2,
  Camera, Edit2, Eye, EyeOff, Save, AlertCircle, CheckCircle,
  CheckCheck, BriefcaseBusiness, Sun, Moon, ToggleLeft, ToggleRight,
  Shield, Globe, Building2, Mail, BookOpen, Megaphone, Star,
  Briefcase, Plus, ChevronDown, UserCheck, FileCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Events from './Events';
import Announcements from './Announcements';
import EmptyState from '../components/common/EmptyState';
import ProfileModal from '../components/profile/ProfileModal';
import { useTheme } from '../contexts/ThemeContext';
import DarkModeToggle from '../components/common/DarkModeToggle';
import ConfirmDialog from '../components/common/ConfirmDialog';

// Branch options with full names (used across components)
const BRANCHES = [
  { value: 'ALL', label: 'All Branches' },
  { value: 'CSE', label: 'Computer Science Engineering' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'ENTC', label: 'Electronics & Telecommunication Engineering' },
  { value: 'Mechanical', label: 'Mechanical Engineering' },
  { value: 'Civil', label: 'Civil Engineering' },
  { value: 'Electrical', label: 'Electrical Engineering' },
  { value: 'Automobile', label: 'Automobile Engineering' },
];

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

  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Admin Data
  const [allUsers, setAllUsers] = useState([]);
  const [pendingFaculty, setPendingFaculty] = useState([]);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ open: false, title: '', message: '', onConfirm: null, variant: 'danger', loading: false });
  const openConfirm = (opts) => setConfirmDialog({ open: true, loading: false, variant: 'danger', ...opts });
  const closeConfirm = () => setConfirmDialog(d => ({ ...d, open: false, loading: false }));

  // Toast notification state
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };


  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifClosing, setNotifClosing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [readIds, setReadIds] = useState(new Set());
  const [clearedIds, setClearedIds] = useState(new Set());
  const notifRef = useRef(null);
  const notifCloseTimer = useRef(null);

  // Helper: user-scoped localStorage key
  const notifReadKey = user ? `notif_read_${user._id}` : null;
  const notifClearedKey = user ? `notif_cleared_${user._id}` : null;

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

  // Only count notifications that aren't cleared and aren't read
  const visibleNotifications = notifications.filter(n => !clearedIds.has(n.id));
  const unreadCount = visibleNotifications.filter(n => !readIds.has(n.id)).length;

  const markRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      if (notifReadKey) localStorage.setItem(notifReadKey, JSON.stringify([...next]));
      return next;
    });
  };

  const markAllRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(prev => {
      const next = new Set([...prev, ...allIds]);
      if (notifReadKey) localStorage.setItem(notifReadKey, JSON.stringify([...next]));
      return next;
    });
  };

  const closeNotifPanel = () => {
    setNotifClosing(true);
    clearTimeout(notifCloseTimer.current);
    notifCloseTimer.current = setTimeout(() => {
      setNotifOpen(false);
      setNotifClosing(false);
    }, 150);
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setClearedIds(prev => {
      const next = new Set([...prev, ...allIds]);
      if (notifClearedKey) localStorage.setItem(notifClearedKey, JSON.stringify([...next]));
      return next;
    });
    // Also mark all as read
    setReadIds(prev => {
      const next = new Set([...prev, ...allIds]);
      if (notifReadKey) localStorage.setItem(notifReadKey, JSON.stringify([...next]));
      return next;
    });
    closeNotifPanel();
  };

  const handleNotifClick = (notif) => {
    markRead(notif.id);
    closeNotifPanel();
    handleRouteChange(notif.route);
  };

  useEffect(() => {
    // Load initial user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.role === 'admin') fetchUsers();
      } catch (_) { }
    }

    // Fetch fresh user from server
    axiosInstance.get('/users/me')
      .then(res => {
        const freshUser = res.data?.data || res.data;
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      })
      .catch(() => { });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load user-scoped read/cleared IDs from localStorage when user is known
  useEffect(() => {
    if (!user?._id) return;
    const readKey = `notif_read_${user._id}`;
    const clearedKey = `notif_cleared_${user._id}`;
    try {
      setReadIds(new Set(JSON.parse(localStorage.getItem(readKey) || '[]')));
      setClearedIds(new Set(JSON.parse(localStorage.getItem(clearedKey) || '[]')));
    } catch { /* ignore parse errors */ }
  }, [user?._id]);

  // Fetch notifications once user is set (admin only)
  useEffect(() => {
    if (user?.role === 'admin') fetchNotifications();
  }, [user, fetchNotifications]);

  // Cleanup close timer on unmount
  useEffect(() => () => clearTimeout(notifCloseTimer.current), []);

  // Close notification panel on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        closeNotifPanel();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]); // eslint-disable-line react-hooks/exhaustive-deps

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
      showToast('Faculty approved successfully!');
    } catch (err) {
      showToast('Failed to approve faculty.', 'error');
    }
  };

  const handleReject = (id) => {
    openConfirm({
      title: 'Reject Request',
      message: 'This will permanently delete the faculty request. This action cannot be undone.',
      confirmLabel: 'Yes, Reject',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, loading: true }));
        try {
          await axiosInstance.delete(`/admin/users/${id}`);
          setAllUsers(prev => prev.filter(u => u._id !== id));
          setPendingFaculty(prev => prev.filter(u => u._id !== id));
          closeConfirm();
          showToast('Request rejected and removed.');
        } catch (err) {
          closeConfirm();
          showToast('Failed to reject request.', 'error');
        }
      },
    });
  };

  const openProfilePanel = () => setShowProfilePanel(true);

  const handleRegister = (eventId) => {
    showToast('Registration feature coming soon!');
  };

  const handleViewDetails = (eventId) => {
    handleRouteChange('Events');
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
    ...(user?.role === 'admin' ? [
      { name: 'Recruitment', icon: BriefcaseBusiness },
      { name: 'Approve Event', icon: FileCheck, badge: pendingFaculty.length > 0 ? pendingFaculty.length : null },
      { name: 'User Management', icon: Users },
    ] : [])
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
    { name: 'System Settings', icon: Settings, subtitle: 'Configure portal settings', action: 'Settings' },
    { name: 'User Management', icon: Users, subtitle: 'Manage users and roles', action: 'User Management' },
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
                    {(!sidebarCollapsed || mobileSidebarOpen) && (
                      <span className="font-medium flex-1 text-left">{item.name}</span>
                    )}
                    {(!sidebarCollapsed || mobileSidebarOpen) && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${isActive ? 'bg-white/30 text-white' : 'bg-amber-500 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
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
                      onClick={() => {
                        if (action.action) {
                          handleRouteChange(action.action);
                        } else {
                          navigate(action.path);
                        }
                        setMobileSidebarOpen(false);
                      }}
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
                    onClick={() => {
                      if (notifOpen || notifClosing) {
                        closeNotifPanel();
                      } else {
                        setNotifOpen(true);
                        fetchNotifications();
                      }
                    }}
                    className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors"
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                  >
                    <Bell size={20} className={(notifOpen || notifClosing) ? 'text-blue-600' : 'text-slate-600'} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-0.5" aria-hidden="true">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Panel — stays mounted during close animation */}
                  {(notifOpen || notifClosing) && (
                    <div className={`absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden ${notifClosing ? 'animate-notifSlideOut' : 'animate-notifSlide'}`}>
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
                          {visibleNotifications.length > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold px-2 py-1 hover:bg-red-50 rounded-lg transition-colors"
                              title="Clear all notifications"
                            >
                              <Trash2 size={13} /> Clear
                            </button>
                          )}
                          <button onClick={closeNotifPanel} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
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
                        ) : visibleNotifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                              <Bell size={22} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-medium">All caught up!</p>
                            <p className="text-xs mt-1">No notifications</p>
                          </div>
                        ) : visibleNotifications.map(notif => {
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
                                  <p className={`text-sm font-semibold truncate leading-snug ${isUnread ? 'text-slate-900' : 'text-slate-500'}`}>
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
                      {visibleNotifications.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-center">
                          <p className="text-xs text-slate-400">{visibleNotifications.length} notification{visibleNotifications.length !== 1 ? 's' : ''}</p>
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

                {/* Stats Cards — Events only */}
                <div className="grid grid-cols-3 gap-3 md:gap-4" role="region" aria-label="Event statistics">
                  <StatsCard icon={Clock} label="Ongoing Events" count={stats.ongoing} iconBg="bg-amber-100" iconColor="text-amber-600" onClick={() => handleRouteChange('Events')} />
                  <StatsCard icon={Calendar} label="Upcoming Events" count={stats.upcoming} iconBg="bg-blue-100" iconColor="text-blue-600" onClick={() => handleRouteChange('Events')} />
                  <StatsCard icon={Users} label="Finished Events" count={stats.finished} iconBg="bg-emerald-100" iconColor="text-emerald-600" onClick={() => handleRouteChange('Events')} />
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

                {/* Admin Overview — below Gallery (admin only) */}
                {user.role === 'admin' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-5 bg-purple-500 rounded-full" aria-hidden="true" />
                      <h3 className="font-bold text-slate-900 text-sm md:text-base">Admin Overview</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-xl">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                          <Users size={16} className="text-purple-600" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{allUsers.length}</span>
                        <span className="text-xs text-slate-500 mt-0.5 text-center">Total Users</span>
                      </div>
                      <div className="flex flex-col items-center justify-center p-3 bg-red-50 rounded-xl">
                        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                          <FileCheck size={16} className="text-red-600" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">{pendingFaculty.length}</span>
                        <span className="text-xs text-slate-500 mt-0.5 text-center">Pending Approvals</span>
                      </div>
                    </div>
                    {pendingFaculty.length > 0 && (
                      <button
                        onClick={() => handleRouteChange('Approve Event')}
                        className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        <FileCheck size={13} /> Review Approvals
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeRoute === 'Events' && <Events userRole={user.role} user={user} />}
          {activeRoute === 'Announcements' && <Announcements userRole={user.role} user={user} />}
          {activeRoute === 'Gallery' && <GalleryView galleryEvents={galleryEvents} galleryLoading={galleryLoading} setGalleryEvents={setGalleryEvents} setGalleryLoading={setGalleryLoading} lightbox={lightbox} setLightbox={setLightbox} axiosInstance={axiosInstance} userRole={user.role} user={user} openConfirm={openConfirm} closeConfirm={closeConfirm} setConfirmDialog={setConfirmDialog} />}
          {activeRoute === 'Recruitment' && <RecruitmentView axiosInstance={axiosInstance} user={user} openConfirm={openConfirm} closeConfirm={closeConfirm} setConfirmDialog={setConfirmDialog} showToast={showToast} />}
          {activeRoute === 'Approve Event' && <FacultyRequestsView pendingFaculty={pendingFaculty} allUsers={allUsers} fetchUsers={fetchUsers} handleApprove={handleApprove} handleReject={handleReject} showToast={showToast} />}
          {activeRoute === 'User Management' && <UserManagementView allUsers={allUsers} />}
          {activeRoute === 'Settings' && <SettingsView user={user} stats={stats} allUsers={allUsers} />}
        </main>
      </div>

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
          window.location.replace('/login'); // full reload — reliable logout
        }}
      />

      {/* Global Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        variant={confirmDialog.variant}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel || 'Confirm'}
        cancelLabel={confirmDialog.cancelLabel || 'Cancel'}
        loading={confirmDialog.loading}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
      />

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-semibold transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}
          role="alert"
          style={{ animation: 'cdlgSlide 0.25s ease-out' }}
        >
          {toast.type === 'error'
            ? <AlertCircle size={16} />
            : <CheckCircle size={16} />
          }
          {toast.msg}
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

const StatsCard = ({ icon: Icon, label, count, iconBg, iconColor, onClick }) => {
  return (
    <div
      className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
      role="status"
      onClick={onClick}
    >
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
  const handleDeleteImage = (eventId, publicId) => {
    openConfirm({
      title: 'Delete Photo',
      message: 'This photo will be permanently deleted. This action cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, loading: true }));
        setDeletingId(publicId);
        try {
          await axiosInstance.delete(`/events/${eventId}/gallery/${encodeURIComponent(publicId)}`);
          setGalleryEvents(prev => prev.map(ev => {
            if (ev._id !== eventId) return ev;
            return { ...ev, images: ev.images.filter(img => img.public_id !== publicId) };
          }).filter(ev => ev.images.length > 0));
          closeConfirm();
        } catch (err) {
          console.error('Delete image failed:', err);
          closeConfirm();
        } finally {
          setDeletingId(null);
        }
      },
    });
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

// ─── Recruitment View (Admin) ─────────────────────────────────────────────────
const RecruitmentView = ({ axiosInstance, user, openConfirm, closeConfirm, setConfirmDialog, showToast }) => {
  const [recruitments, setRecruitments] = React.useState([]);
  const [events, setEvents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState('list'); // 'list' | 'create'
  const [expandedId, setExpandedId] = React.useState(null);
  const [applicants, setApplicants] = React.useState({});
  const [loadingApplicants, setLoadingApplicants] = React.useState({});
  const [form, setForm] = React.useState({ title: '', description: '', roleType: 'volunteer', branch: 'ALL', eventId: '', customRole: '' });
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState('');

  const roleTypes = ['volunteer', 'anchor', 'coordinator', 'technical', 'other'];
  // BRANCHES is defined at module level

  const fetchRecruitments = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/recruitments?status=all');
      setRecruitments(res.data.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [axiosInstance]);

  React.useEffect(() => {
    fetchRecruitments();
    axiosInstance.get('/events').then(r => setEvents(r.data.data || [])).catch(() => { });
  }, [fetchRecruitments, axiosInstance]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.eventId) { setFormError('Title, description and event are required.'); return; }
    if (form.roleType === 'other' && !form.customRole.trim()) { setFormError('Please specify a custom role name for "Other" role type.'); return; }
    setSubmitting(true); setFormError('');
    try {
      const payload = { ...form, roleType: form.roleType === 'other' ? form.customRole.trim() : form.roleType };
      await axiosInstance.post('/recruitments', payload);
      showToast('Recruitment post created!');
      setForm({ title: '', description: '', roleType: 'volunteer', branch: 'ALL', eventId: '', customRole: '' });
      setTab('list');
      fetchRecruitments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create recruitment post.');
    } finally { setSubmitting(false); }
  };

  const handleDelete = (id) => {
    openConfirm({
      title: 'Delete Recruitment Post',
      message: 'This will permanently delete this recruitment post and all its applicant data.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, loading: true }));
        try {
          await axiosInstance.delete(`/recruitments/${id}`);
          setRecruitments(prev => prev.filter(r => r._id !== id));
          closeConfirm();
          showToast('Recruitment post deleted.');
        } catch {
          closeConfirm();
          showToast('Failed to delete post.', 'error');
        }
      },
    });
  };

  const toggleApplicants = async (id) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (applicants[id]) return;
    setLoadingApplicants(p => ({ ...p, [id]: true }));
    try {
      const res = await axiosInstance.get(`/recruitments/${id}/applicants`);
      setApplicants(p => ({ ...p, [id]: res.data.data?.applicants || [] }));
    } catch { setApplicants(p => ({ ...p, [id]: [] })); }
    finally { setLoadingApplicants(p => ({ ...p, [id]: false })); }
  };

  const updateApplicantStatus = async (recruitId, applicantId, status) => {
    try {
      await axiosInstance.patch(`/recruitments/${recruitId}/applicants/${applicantId}`, { status });
      setApplicants(prev => ({
        ...prev,
        [recruitId]: prev[recruitId].map(a => a._id === applicantId ? { ...a, status } : a),
      }));
      showToast(`Applicant ${status} successfully.`);
    } catch { showToast('Failed to update applicant status.', 'error'); }
  };

  const closeRecruit = async (id) => {
    openConfirm({
      title: 'Close Recruitment',
      message: 'No more applications will be accepted for this post.',
      confirmLabel: 'Close It',
      variant: 'info',
      onConfirm: async () => {
        setConfirmDialog(d => ({ ...d, loading: true }));
        try {
          await axiosInstance.put(`/recruitments/${id}`, { status: 'closed' });
          setRecruitments(prev => prev.map(r => r._id === id ? { ...r, status: 'closed' } : r));
          closeConfirm();
          showToast('Recruitment closed.');
        } catch {
          closeConfirm();
          showToast('Failed to close recruitment.', 'error');
        }
      },
    });
  };

  const statusBadge = (s) => s === 'open'
    ? <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Open</span>
    : <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">Closed</span>;

  const applicantBadge = (s) => {
    const map = { selected: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', applied: 'bg-amber-100 text-amber-700' };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${map[s] || map.applied}`}>{s}</span>;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Recruitment Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Create volunteer/organizer roles for your events</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('list')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'list' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            All Posts
          </button>
          <button
            onClick={() => setTab('create')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${tab === 'create' ? 'bg-blue-600 text-white shadow' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <Plus size={15} /> Create New
          </button>
        </div>
      </div>

      {/* Create Form */}
      {tab === 'create' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6">
          <h3 className="font-bold text-slate-900 mb-4">New Recruitment Post</h3>
          {formError && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              <AlertCircle size={15} /> {formError}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Stage Volunteers for Tech Fest" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Role Type</label>
                <select value={form.roleType} onChange={e => setForm(f => ({ ...f, roleType: e.target.value, customRole: '' }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white capitalize">
                  {roleTypes.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
                {form.roleType === 'other' && (
                  <input
                    value={form.customRole}
                    onChange={e => setForm(f => ({ ...f, customRole: e.target.value }))}
                    className="w-full mt-2 px-3 py-2.5 border border-blue-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50 placeholder-slate-400"
                    placeholder="Enter specific role name (e.g. Stage Manager)…"
                    autoFocus
                  />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Target Branch</label>
                <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Linked Event *</label>
                <select value={form.eventId} onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">Choose an event…</option>
                  {events.map(ev => <option key={ev._id} value={ev._id}>{ev.title}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="What will volunteers do? Any requirements?" />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setTab('list')}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-60 flex items-center gap-2">
                {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</> : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recruitment List */}
      {tab === 'list' && (
        loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
        ) : recruitments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <BriefcaseBusiness size={30} className="text-blue-400" />
            </div>
            <h3 className="font-bold text-slate-700 text-lg mb-1">No Recruitment Posts Yet</h3>
            <p className="text-slate-400 text-sm mb-4 text-center max-w-xs">Get started by creating your first volunteer or organizer role for an event.</p>
            <button onClick={() => setTab('create')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <Plus size={15} /> Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {recruitments.map(rec => (
              <div key={rec._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Card Header */}
                <div className="p-4 md:p-5 flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 text-base">{rec.title}</h3>
                      {statusBadge(rec.status)}
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full capitalize">{rec.roleType}</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-2 line-clamp-2">{rec.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Calendar size={12} />{rec.event?.title || 'No event'}</span>
                      <span className="flex items-center gap-1"><Users size={12} />{rec.branch}</span>
                      <span className="flex items-center gap-1"><FileText size={12} />{rec.applicants?.length || 0} applicant(s)</span>
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <button
                      onClick={() => toggleApplicants(rec._id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Users size={13} /> Applicants
                      <ChevronDown size={13} className={`transition-transform ${expandedId === rec._id ? 'rotate-180' : ''}`} />
                    </button>
                    {rec.status === 'open' && (
                      <button onClick={() => closeRecruit(rec._id)} className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold transition-colors">
                        Close
                      </button>
                    )}
                    <button onClick={() => handleDelete(rec._id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>

                {/* Applicants Panel */}
                {expandedId === rec._id && (
                  <div className="border-t border-slate-100 bg-slate-50 p-4">
                    {loadingApplicants[rec._id] ? (
                      <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" /></div>
                    ) : (applicants[rec._id] || []).length === 0 ? (
                      <div className="flex flex-col items-center py-6 text-slate-400">
                        <Users size={28} className="mb-2 text-slate-300" />
                        <p className="text-sm font-medium">No applicants yet</p>
                        <p className="text-xs">Applications will appear here once students apply.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-3">{(applicants[rec._id] || []).length} Applicant(s)</p>
                        {(applicants[rec._id] || []).map(app => (
                          <div key={app._id} className="bg-white rounded-xl p-3 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {app.student?.name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-slate-900 text-sm">{app.student?.name || 'Unknown'}</p>
                              <p className="text-xs text-slate-500">{app.student?.email} · {app.student?.branch}</p>
                              {app.note && <p className="text-xs text-slate-400 mt-1 italic">"{app.note}"</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              {applicantBadge(app.status)}
                              {app.status === 'applied' && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => updateApplicantStatus(rec._id, app._id, 'selected')}
                                    className="px-2.5 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-semibold transition-colors"
                                  >Select</button>
                                  <button
                                    onClick={() => updateApplicantStatus(rec._id, app._id, 'rejected')}
                                    className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors"
                                  >Reject</button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

// ─── Faculty Requests View (Admin) ────────────────────────────────────────────
const FacultyRequestsView = ({ pendingFaculty, allUsers, fetchUsers, handleApprove, handleReject }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Faculty Requests</h2>
          <p className="text-sm text-slate-500 mt-0.5">Review and approve pending faculty registration requests</p>
        </div>
        {pendingFaculty.length > 0 && (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-bold rounded-full">
            {pendingFaculty.length} Pending
          </span>
        )}
      </div>

      {/* Empty State */}
      {pendingFaculty.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-5">
            <UserCheck size={38} className="text-emerald-400" />
          </div>
          <h3 className="font-bold text-slate-700 text-xl mb-2">All Clear!</h3>
          <p className="text-slate-400 text-sm text-center max-w-xs leading-relaxed">
            There are no pending faculty requests at the moment. New requests will appear here when faculty members register.
          </p>
          <div className="mt-5 flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl text-emerald-600 text-sm font-medium">
            <CheckCircle size={16} />
            All faculty accounts are approved
          </div>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {pendingFaculty.map((request) => (
            <div key={request._id} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {request.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{request.name}</h3>
                  <div className="text-sm text-slate-500 space-y-0.5 mt-0.5">
                    <p className="flex items-center gap-1.5"><Mail size={12} /> {request.email}</p>
                    <p className="flex items-center gap-1.5"><Users size={12} /> {request.branch}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <span className="ml-auto sm:ml-0 px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full border border-amber-200">
                  Pending
                </span>
                <button
                  onClick={() => handleApprove(request._id)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                  aria-label={`Approve ${request.name}`}
                >
                  <Check size={15} /> Approve
                </button>
                <button
                  onClick={() => handleReject(request._id)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                  aria-label={`Reject ${request.name}`}
                >
                  <Trash2 size={15} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── User Management View (Admin) ────────────────────────────────────────────
const UserManagementView = ({ allUsers }) => {
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [branchFilter, setBranchFilter] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState('asc'); // 'asc' | 'desc'

  const filtered = React.useMemo(() => {
    let result = allUsers.filter(u => {
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchBranch = branchFilter === 'ALL' || u.branch === branchFilter;
      const matchSearch = !searchQuery ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRole && matchBranch && matchSearch;
    });

    // Apply sorting by name
    result.sort((a, b) => {
      const nameA = a.name?.toLowerCase() || '';
      const nameB = b.name?.toLowerCase() || '';
      if (sortOrder === 'asc') {
        return nameA.localeCompare(nameB);
      } else {
        return nameB.localeCompare(nameA);
      }
    });

    return result;
  }, [allUsers, roleFilter, branchFilter, searchQuery, sortOrder]);

  const roleTabs = [
    { key: 'all', label: 'All Users', count: allUsers.length },
    { key: 'student', label: 'Students', count: allUsers.filter(u => u.role === 'student').length },
    { key: 'faculty', label: 'Faculty', count: allUsers.filter(u => u.role === 'faculty').length },
    { key: 'admin', label: 'Admin', count: allUsers.filter(u => u.role === 'admin').length },
  ];

  const roleStyle = {
    student: 'bg-blue-100 text-blue-700',
    faculty: 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">{allUsers.length} total registered users</p>
        </div>
        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          {sortOrder === 'asc' ? 'Sort A-Z' : 'Sort Z-A'}
        </button>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap gap-1 bg-white rounded-xl p-1 shadow-sm border border-slate-200">
        {roleTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setRoleFilter(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${roleFilter === tab.key
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-50'
              }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${roleFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Branch Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          />
        </div>
        <select
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-[220px]"
        >
          {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
      </div>

      <p className="text-xs text-slate-400 font-medium">{filtered.length} user{filtered.length !== 1 ? 's' : ''} shown</p>

      {/* Users Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
          <Users size={36} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No users found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map(u => (
            <div
              key={u._id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all flex items-start gap-3"
            >
              {u.profilePic?.url ? (
                <img
                  src={u.profilePic.url}
                  alt={u.name}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0">
                  {u.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <p className="font-semibold text-slate-900 text-sm truncate">{u.name}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${roleStyle[u.role] || 'bg-slate-100 text-slate-600'}`}>
                    {u.role}
                  </span>
                  {u.role === 'faculty' && !u.isApproved && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate">{u.email}</p>
                {u.branch && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {BRANCHES.find(b => b.value === u.branch)?.label || u.branch}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
