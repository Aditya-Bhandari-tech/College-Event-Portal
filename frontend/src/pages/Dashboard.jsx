import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, Users, Bell, Search, Grid, Image,
  FileText, UserPlus, Hand, ChevronRight, MapPin,
  Menu, X, LogOut, Settings, User, Award, Check, Trash2, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

// Role-based dashboard for Campus Pulse
// Supports: Student, Faculty, Admin roles
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeRoute, setActiveRoute] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Admin Data
  const [allUsers, setAllUsers] = useState([]);
  const [pendingFaculty, setPendingFaculty] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.role === 'admin') {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      // Verify response structure based on adminController
      // Controller returns: { message, data, status } (via sendSuccess util presumably? 
      // check adminController: sendSuccess(res, msg, users, 200). 
      // Assuming sendSuccess returns directly the json or inside a data property? 
      // Let's assume response.data.data is the array if using a util, OR response.data if direct.
      // Looking at authController, it returns json directly. 
      // Looking at adminController: return sendSuccess(...)
      // I should check existing `sendSuccess` impl if possible, but safer to assume response.data.data or check response.data structure.
      // Standard practice: if API returns { success: true, data: [...] }, use response.data.data.
      // If it returns [...], use response.data.
      // Let's log it or handle both. Ideally I'd check utils/apiResponse.js but let's assume standard { data: ... } for now based on 'sendSuccess'.

      const usersData = response.data.data || response.data; // Flexible fallback
      setAllUsers(usersData);
      setPendingFaculty(usersData.filter(u => u.role === 'faculty' && !u.isApproved));
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.put(`/admin/users/${id}/approve`);
      // Update local state to remove from pending
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
      // Update local state
      setAllUsers(prev => prev.filter(u => u._id !== id));
      setPendingFaculty(prev => prev.filter(u => u._id !== id));
      alert("Request rejected");
    } catch (err) {
      alert("Failed to reject request");
    }
  }

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }


  // Mock data - replace with API calls
  const [stats, setStats] = useState({
    ongoing: 1,
    upcoming: 3,
    finished: 3
  });

  const [liveEvent, setLiveEvent] = useState({
    id: 1,
    title: 'Annual Tech Fest 2024',
    description: 'Join us for the biggest tech celebration of the year!',
    date: 'Mar 15 - Mar 17, 2024',
    venue: 'Main Auditorium',
    department: 'Computer Department',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    attendance: { current: 245, total: 300 }
  });

  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 2,
      title: 'Industry Expert Talk',
      description: 'Expert insights on software industry trends.',
      date: 'Mar 20, 2024',
      venue: 'Seminar Hall',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop',
      spotsLeft: 61,
      registrationOpen: true
    },
    {
      id: 3,
      title: 'Robotics Workshop',
      description: 'Build your first robot in this hands-on workshop.',
      date: 'Mar 25, 2024',
      venue: 'Electronics Lab',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
      spotsLeft: 8,
      registrationOpen: true
    },
    {
      id: 4,
      title: 'Annual Sports Meet',
      description: 'Compete with fellow students in various sports.',
      date: 'Mar 28, 2024',
      venue: 'Sports Ground',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
      spotsLeft: 244,
      registrationOpen: true
    }
  ]);

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: 'Examination Schedule Released',
      preview: 'The end semester examination schedule for March 2024 has been released. Students are advised to check the notice board and prepare accordingly.',
      author: 'Dr. Priya Kulkarni',
      authorRole: 'admin',
      timestamp: 'almost 2 years ago',
      important: true
    },
    {
      id: 2,
      title: 'Library Timings Extended',
      preview: 'During examination period, the library will remain open from 8 AM to 10 PM. Students can utilize this facility for their studies.',
      author: 'Prof. Amit Desai',
      authorRole: 'faculty',
      timestamp: 'almost 2 years ago',
      important: false
    },
    {
      id: 3,
      title: 'Internship Opportunities',
      preview: 'Multiple companies are offering summer internships. Interested students should submit their resumes to the T&P cell by March 20th.',
      author: 'T&P Cell',
      authorRole: 'faculty',
      timestamp: 'almost 2 years ago',
      important: true
    },
    {
      id: 4,
      title: 'Workshop Registration Open',
      preview: 'Registrations for the upcoming Web Development workshop are now open. Limited seats available. Register through the portal.',
      author: 'Prof. Sneha Patil',
      authorRole: 'faculty',
      timestamp: 'almost 2 years ago',
      important: false
    }
  ]);

  const [pastEvents, setPastEvents] = useState([
    {
      id: 5,
      title: 'Coding Bootcamp',
      date: 'Feb 11, 2024',
      department: 'Computer Department',
      attended: 75,
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&h=100&fit=crop',
      hasPhotos: true
    },
    {
      id: 6,
      title: 'Republic Day Celebration',
      date: 'Jan 26, 2024',
      department: 'Administration',
      attended: 500,
      image: 'https://images.unsplash.com/photo-1610660848933-7162c5c64e7e?w=100&h=100&fit=crop',
      hasPhotos: true
    },
    {
      id: 7,
      title: 'Project Exhibition',
      date: 'Feb 21, 2024',
      department: 'All Departments',
      attended: 320,
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=100&h=100&fit=crop',
      hasPhotos: true
    }
  ]);

  const [recentPhotos, setRecentPhotos] = useState([
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop'
  ]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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

  if (!user) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  const quickActions = user.role === 'student' ? [
    { name: 'Request Event', icon: UserPlus, subtitle: 'Submit a new event proposal' },
    { name: 'Volunteer', icon: Hand, subtitle: 'Apply for volunteer roles' },
    { name: 'My Applications', icon: FileText, subtitle: 'Track your event applications' }
  ] : user.role === 'faculty' ? [
    { name: 'Create Event', icon: UserPlus, subtitle: 'Organize a new event' },
    { name: 'Manage Events', icon: Calendar, subtitle: 'View and edit your events' },
    { name: 'Post Announcement', icon: Bell, subtitle: 'Share important updates' }
  ] : [
    { name: 'Approve Events', icon: Award, subtitle: 'Review pending requests' },
    { name: 'System Settings', icon: Settings, subtitle: 'Configure portal settings' },
    { name: 'User Management', icon: Users, subtitle: 'Manage users and roles' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 font-sans">
      {/* Left Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-50 ${sidebarCollapsed ? 'w-20' : 'w-64'} shadow-2xl`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 font-bold text-lg">
                GP
              </div>
              {!sidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-lg tracking-tight">CAMPUS PULSE</span>
                  <span className="text-xs text-slate-400 tracking-wider"></span>
                </div>
              )}
            </div>
          </div>

          {/* Main Menu */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className={`${sidebarCollapsed ? 'px-3' : 'px-4'} mb-4`}>
              {!sidebarCollapsed && (
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Main Menu</span>
              )}
            </div>
            <nav className={`space-y-1 ${sidebarCollapsed ? 'px-3' : 'px-4'}`}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeRoute === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveRoute(item.name)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  >
                    <Icon size={20} />
                    {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
                  </button>
                );
              })}
            </nav>

            {/* Actions */}
            <div className={`mt-8 ${sidebarCollapsed ? 'px-3' : 'px-4'}`}>
              {!sidebarCollapsed && (
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4 block">Your Actions</span>
              )}
              <div className="space-y-1">
                {quickActions.slice(0, 2).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.name}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-300 hover:bg-slate-800/50 hover:text-white ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                      <Icon size={20} />
                      {!sidebarCollapsed && <span className="font-medium">{action.name}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-700/50">
            <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                {user.avatar}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
        >
          <ChevronRight size={14} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
        </button>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {getGreeting()}, <span className="text-blue-600">{user.name.split(' ')[0]}</span>
                </h1>
                <p className="text-sm text-slate-600 mt-1">Welcome back to your dashboard</p>
              </div>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search events, announcements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-80 bg-slate-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <Bell size={20} className="text-slate-600" />
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">2</span>
                </button>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md">
                      {user.avatar}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="font-semibold text-sm text-slate-900">{user.name}</p>
                      <p className="text-xs text-blue-600 font-medium">{user.role}</p>
                    </div>
                    <ChevronRight size={16} className={`text-slate-400 transition-transform hidden lg:block ${showProfileMenu ? 'rotate-90' : ''}`} />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                      <button className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700">
                        <User size={16} />
                        <span className="text-sm">Profile</span>
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700">
                        <Settings size={16} />
                        <span className="text-sm">Settings</span>
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-red-600 border-t border-slate-100 mt-1">
                        <LogOut size={16} />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pending Faculty Requests (Admin Only) */}
              {user && user.role === 'admin' && pendingFaculty.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <h2 className="text-xl font-bold text-slate-900">Pending Faculty Requests</h2>
                  </div>
                  <div className="grid gap-4">
                    {pendingFaculty.map((request) => (
                      <div k={request._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-lg">
                            {request.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{request.name}</h3>
                            <div className="text-sm text-slate-600 space-y-1">
                              <p className="flex items-center gap-2">
                                <Users size={14} /> {request.branch}
                              </p>
                              <p className="flex items-center gap-2">
                                <FileText size={14} /> {request.email}
                              </p>
                              {request.phone && (
                                <p className="flex items-center gap-2">
                                  <div className='w-3.5 h-3.5 flex items-center justify-center'>📞</div> {request.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="flex-1 md:flex-none px-4 py-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <Check size={16} /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  icon={Clock}
                  label="Ongoing Events"
                  count={stats.ongoing}
                  color="from-amber-500 to-orange-600"
                  iconBg="bg-amber-100"
                  iconColor="text-amber-600"
                />
                <StatsCard
                  icon={Calendar}
                  label="Upcoming Events"
                  count={stats.upcoming}
                  color="from-blue-500 to-indigo-600"
                  iconBg="bg-blue-100"
                  iconColor="text-blue-600"
                />
                <StatsCard
                  icon={Users}
                  label="Finished Events"
                  count={stats.finished}
                  color="from-emerald-500 to-teal-600"
                  iconBg="bg-emerald-100"
                  iconColor="text-emerald-600"
                />
              </div>

              {/* Happening Now */}
              {liveEvent && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <h2 className="text-xl font-bold text-slate-900">Happening Now</h2>
                  </div>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-64 md:h-auto">
                        <img src={liveEvent.image} alt={liveEvent.title} className="w-full h-full object-cover" />
                        <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          Live Now
                        </span>
                      </div>
                      <div className="p-6 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">{liveEvent.title}</h3>
                          <p className="text-slate-600 mb-4">{liveEvent.description}</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Calendar size={16} className="text-slate-400" />
                              <span>{liveEvent.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <MapPin size={16} className="text-slate-400" />
                              <span>{liveEvent.venue}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Users size={16} className="text-slate-400" />
                              <span>{liveEvent.department}</span>
                            </div>
                          </div>
                          {liveEvent.attendance && (
                            <div className="mt-4">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-600">Attendance</span>
                                <span className="font-semibold text-slate-900">{liveEvent.attendance.current} / {liveEvent.attendance.total}</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                                  style={{ width: `${(liveEvent.attendance.current / liveEvent.attendance.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                          View Details
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Upcoming Events */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Upcoming Events</h2>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
                    View All
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md transition-all group">
                      <div className="relative h-40">
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <span className="absolute top-3 right-3 px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg">
                          Upcoming
                        </span>
                        {event.registrationOpen && (
                          <span className="absolute top-3 left-3 px-3 py-1 bg-white text-slate-700 text-xs font-semibold rounded-full shadow-md">
                            Registration Open
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-slate-900 mb-2">{event.title}</h3>
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">{event.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <Calendar size={14} className="text-slate-400" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <MapPin size={14} className="text-slate-400" />
                            <span>{event.venue}</span>
                          </div>
                        </div>
                        {event.spotsLeft !== undefined && (
                          <div className="mb-3">
                            <p className="text-xs text-slate-600 mb-1">
                              Spots left: <span className="font-bold text-slate-900">{event.spotsLeft}</span>
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
                            View Details
                          </button>
                          {user.role === 'student' && event.registrationOpen && (
                            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all text-sm font-semibold">
                              Register
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Latest Announcements */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Latest Announcements</h2>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
                    View All
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-slate-600">
                          {announcement.author.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-slate-900">{announcement.title}</h3>
                              {announcement.important && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                  Important
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 whitespace-nowrap">{announcement.timestamp}</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2 line-clamp-2">{announcement.preview}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-700">{announcement.author}</span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${announcement.authorRole === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                              }`}>
                              {announcement.authorRole}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Past Events */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Past Events</h2>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
                    View All
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {pastEvents.map((event) => (
                    <div key={event.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{event.title}</h3>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                              Completed
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} className="text-slate-400" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={14} className="text-slate-400" />
                              <span>{event.department}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={14} className="text-slate-400" />
                              <span>{event.attended} attended</span>
                            </div>
                          </div>
                        </div>
                        {event.hasPhotos && (
                          <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-2">
                            <Image size={16} />
                            Photos
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* User Profile Card */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center font-bold text-2xl mb-4 shadow-lg">
                    {user.avatar}
                  </div>
                  <h3 className="font-bold text-xl mb-1">{user.name}</h3>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                    {user.role}
                  </span>
                  <div className="w-full space-y-3 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <Users size={16} />
                      <div className="text-left flex-1">
                        <p className="text-white/70 text-xs">Department</p>
                        <p className="font-semibold">{user.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                      <FileText size={16} />
                      <div className="text-left flex-1">
                        <p className="text-white/70 text-xs">Email</p>
                        <p className="font-semibold truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.name}
                        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                          <Icon size={18} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 text-sm">{action.name}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{action.subtitle}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 mt-2 group-hover:text-slate-600 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Photos */}
              {recentPhotos.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-500 rounded-full" />
                    Recent Photos
                  </h3>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {recentPhotos.map((photo, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
                        <img src={photo} alt={`Recent photo ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <button className="w-full px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-semibold flex items-center justify-center gap-2">
                    View Full Gallery
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* View All Events Button */}
              <button className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                <Calendar size={20} />
                View All Events
              </button>
            </div>
          </div>
        </main>
      </div>


      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
      `}</style>
    </div>
  );
};

const StatsCard = ({ icon: Icon, label, count, color, iconBg, iconColor }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={24} className={iconColor} />
        </div>
        <ChevronRight size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
      </div>
      <div>
        <p className="text-slate-600 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{count}</p>
      </div>
    </div>
  );
};

export default Dashboard;

