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
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#f9f8f6' }}>
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
                  <span className="text-xs text-slate-500 tracking-wider"></span>
                </div>
              )}
            </div>
          </div>

          {/* Main Menu */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className={`${sidebarCollapsed ? 'px-3' : 'px-4'} mb-4`}>
              {!sidebarCollapsed && (
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Main Menu</span>
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
                      : 'text-slate-600 hover:bg-slate-800/50 hover:text-white'
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
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 block">Your Actions</span>
              )}
              <div className="space-y-1">
                {quickActions.slice(0, 2).map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.name}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-600 hover:bg-slate-800/50 hover:text-white ${sidebarCollapsed ? 'justify-center' : ''}`}
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
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
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
                    <ChevronRight size={16} className={`text-slate-500 transition-transform hidden lg:block ${showProfileMenu ? 'rotate-90' : ''}`} />
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
                            <div className="text-sm text-slate-500 space-y-1">
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
                              <Calendar size={16} className="text-slate-500" />
                              <span>{liveEvent.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <MapPin size={16} className="text-slate-500" />
                              <span>{liveEvent.venue}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Users size={16} className="text-slate-500" />
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
                            <Calendar size={14} className="text-slate-500" />
                            <span>{event.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-700">
                            <MapPin size={14} className="text-slate-500" />
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
                              <Calendar size={14} className="text-slate-500" />
                              <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={14} className="text-slate-500" />
                              <span>{event.department}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={14} className="text-slate-500" />
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
                        <ChevronRight size={16} className="text-slate-500 mt-2 group-hover:text-slate-600 transition-colors" />
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
        <ChevronRight size={20} className="text-slate-500 group-hover:text-slate-600 transition-colors" />
      </div>
      <div>
        <p className="text-slate-600 text-sm font-medium mb-1">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{count}</p>
      </div>
    </div>
  );
};

export default Dashboard;




// import React, { useState, useEffect } from 'react';
// import {
//     Calendar, Clock, Users, Bell, Search, Grid, Image,
//     FileText, UserPlus, Hand, ChevronRight, MapPin,
//     Menu, X, LogOut, Settings, User, Award, Check, Trash2, Home,
//     Plus, Edit, Eye, Filter, Download, Upload, CheckCircle, XCircle,
//     AlertCircle, MessageSquare, Trash
// } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import axiosInstance from '../api/axios';

// // Role-based dashboard for Campus Pulse
// // Supports: Student, Faculty, Admin roles
// const Dashboard = () => {
//     const navigate = useNavigate();
//     const [user, setUser] = useState(null);

//     useEffect(() => {
//         const storedUser = localStorage.getItem('user');
//         if (!storedUser) {
//             navigate('/login');
//             return;
//         }
//         const parsedUser = JSON.parse(storedUser);
//         setUser(parsedUser);
//     }, [navigate]);

//     if (!user) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

//     // Role-based rendering
//     if (user.role === 'faculty') {
//         return <FacultyDashboard user={user} />;
//     }

//     // Student/Admin dashboard (existing code)
//     return <StudentAdminDashboard user={user} />;
// };

// // ==================== FACULTY DASHBOARD ====================
// const FacultyDashboard = ({ user }) => {
//     const navigate = useNavigate();
//     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//     const [activeRoute, setActiveRoute] = useState('Dashboard');
//     const [searchQuery, setSearchQuery] = useState('');
//     const [showProfileMenu, setShowProfileMenu] = useState(false);
//     const [currentTime, setCurrentTime] = useState(new Date());

//     // Faculty Data States
//     const [loading, setLoading] = useState({
//         events: false,
//         requests: false,
//         recruitments: false,
//         students: false,
//         announcements: false,
//         gallery: false
//     });

//     const [stats, setStats] = useState({
//         myEvents: 0,
//         pendingRequests: 0,
//         activeRecruitments: 0,
//         departmentStudents: 0
//     });

//     const [events, setEvents] = useState([]);
//     const [eventRequests, setEventRequests] = useState([]);
//     const [recruitments, setRecruitments] = useState([]);
//     const [departmentStudents, setDepartmentStudents] = useState([]);
//     const [announcements, setAnnouncements] = useState([]);
//     const [galleryItems, setGalleryItems] = useState([]);

//     // Filter states
//     const [eventFilter, setEventFilter] = useState('all');
//     const [requestFilter, setRequestFilter] = useState('pending');
//     const [studentSearchQuery, setStudentSearchQuery] = useState('');
//     const [studentYearFilter, setStudentYearFilter] = useState('');

//     // Modal states
//     const [showApprovalModal, setShowApprovalModal] = useState(false);
//     const [showApplicantsModal, setShowApplicantsModal] = useState(false);
//     const [selectedItem, setSelectedItem] = useState(null);
//     const [approvalComment, setApprovalComment] = useState('');
//     const [approvalAction, setApprovalAction] = useState('');

//     useEffect(() => {
//         fetchDashboardData();
//         const timer = setInterval(() => setCurrentTime(new Date()), 60000);
//         return () => clearInterval(timer);
//     }, []);

//     const fetchDashboardData = async () => {
//         await Promise.all([
//             fetchEvents(),
//             fetchEventRequests(),
//             fetchRecruitments(),
//             fetchDepartmentStudents(),
//             fetchAnnouncements(),
//             fetchGallery()
//         ]);
//         await fetchStats();
//     };

//     const fetchStats = async () => {
//         try {
//             const [eventsRes, requestsRes, recruitmentsRes, studentsRes] = await Promise.all([
//                 axiosInstance.get(`/events?createdBy=${user._id}`),
//                 axiosInstance.get(`/event-requests?department=${user.branch}&status=pending`),
//                 axiosInstance.get(`/recruitments?department=${user.branch}&status=open`),
//                 axiosInstance.get(`/users?role=student&branch=${user.branch}`)
//             ]);

//             setStats({
//                 myEvents: (eventsRes.data.data || eventsRes.data)?.length || 0,
//                 pendingRequests: (requestsRes.data.data || requestsRes.data)?.length || 0,
//                 activeRecruitments: (recruitmentsRes.data.data || recruitmentsRes.data)?.length || 0,
//                 departmentStudents: (studentsRes.data.data || studentsRes.data)?.length || 0
//             });
//         } catch (error) {
//             console.error('Failed to fetch stats:', error);
//         }
//     };

//     const fetchEvents = async () => {
//         setLoading(prev => ({ ...prev, events: true }));
//         try {
//             const response = await axiosInstance.get(`/events?createdBy=${user._id}`);
//             const eventsData = response.data.data || response.data;
//             setEvents(Array.isArray(eventsData) ? eventsData : []);
//         } catch (error) {
//             console.error('Failed to fetch events:', error);
//             setEvents([]);
//         } finally {
//             setLoading(prev => ({ ...prev, events: false }));
//         }
//     };

//     const fetchEventRequests = async () => {
//         setLoading(prev => ({ ...prev, requests: true }));
//         try {
//             const response = await axiosInstance.get(`/event-requests?department=${user.branch}`);
//             const requestsData = response.data.data || response.data;
//             setEventRequests(Array.isArray(requestsData) ? requestsData : []);
//         } catch (error) {
//             console.error('Failed to fetch event requests:', error);
//             setEventRequests([]);
//         } finally {
//             setLoading(prev => ({ ...prev, requests: false }));
//         }
//     };

//     const fetchRecruitments = async () => {
//         setLoading(prev => ({ ...prev, recruitments: true }));
//         try {
//             const response = await axiosInstance.get(`/recruitments?department=${user.branch}`);
//             const recruitmentsData = response.data.data || response.data;
//             setRecruitments(Array.isArray(recruitmentsData) ? recruitmentsData : []);
//         } catch (error) {
//             console.error('Failed to fetch recruitments:', error);
//             setRecruitments([]);
//         } finally {
//             setLoading(prev => ({ ...prev, recruitments: false }));
//         }
//     };

//     const fetchDepartmentStudents = async () => {
//         setLoading(prev => ({ ...prev, students: true }));
//         try {
//             const response = await axiosInstance.get(`/users?role=student&branch=${user.branch}`);
//             const studentsData = response.data.data || response.data;
//             setDepartmentStudents(Array.isArray(studentsData) ? studentsData : []);
//         } catch (error) {
//             console.error('Failed to fetch students:', error);
//             setDepartmentStudents([]);
//         } finally {
//             setLoading(prev => ({ ...prev, students: false }));
//         }
//     };

//     const fetchAnnouncements = async () => {
//         setLoading(prev => ({ ...prev, announcements: true }));
//         try {
//             const response = await axiosInstance.get(`/announcements?department=${user.branch}`);
//             const announcementsData = response.data.data || response.data;
//             setAnnouncements(Array.isArray(announcementsData) ? announcementsData : []);
//         } catch (error) {
//             console.error('Failed to fetch announcements:', error);
//             setAnnouncements([]);
//         } finally {
//             setLoading(prev => ({ ...prev, announcements: false }));
//         }
//     };

//     const fetchGallery = async () => {
//         setLoading(prev => ({ ...prev, gallery: true }));
//         try {
//             const response = await axiosInstance.get('/gallery');
//             const galleryData = response.data.data || response.data;
//             setGalleryItems(Array.isArray(galleryData) ? galleryData : []);
//         } catch (error) {
//             console.error('Failed to fetch gallery:', error);
//             setGalleryItems([]);
//         } finally {
//             setLoading(prev => ({ ...prev, gallery: false }));
//         }
//     };

//     const handleApproveRequest = async (requestId) => {
//         try {
//             await axiosInstance.patch(`/event-requests/${requestId}/approve`, {
//                 comment: approvalComment
//             });
//             setShowApprovalModal(false);
//             setApprovalComment('');
//             await fetchEventRequests();
//             await fetchStats();
//             alert('Event request approved successfully');
//         } catch (error) {
//             console.error('Error approving request:', error);
//             alert('Failed to approve request');
//         }
//     };

//     const handleRejectRequest = async (requestId) => {
//         try {
//             await axiosInstance.patch(`/event-requests/${requestId}/reject`, {
//                 comment: approvalComment
//             });
//             setShowApprovalModal(false);
//             setApprovalComment('');
//             await fetchEventRequests();
//             await fetchStats();
//             alert('Event request rejected');
//         } catch (error) {
//             console.error('Error rejecting request:', error);
//             alert('Failed to reject request');
//         }
//     };

//     const handleDeleteEvent = async (eventId) => {
//         if (!window.confirm('Are you sure you want to delete this event?')) return;
//         try {
//             await axiosInstance.delete(`/events/${eventId}`);
//             await fetchEvents();
//             await fetchStats();
//             alert('Event deleted successfully');
//         } catch (error) {
//             console.error('Error deleting event:', error);
//             alert('Failed to delete event');
//         }
//     };

//     const handleDeleteRecruitment = async (recruitmentId) => {
//         if (!window.confirm('Are you sure you want to delete this recruitment?')) return;
//         try {
//             await axiosInstance.delete(`/recruitments/${recruitmentId}`);
//             await fetchRecruitments();
//             await fetchStats();
//             alert('Recruitment deleted successfully');
//         } catch (error) {
//             console.error('Error deleting recruitment:', error);
//             alert('Failed to delete recruitment');
//         }
//     };

//     const handleToggleRecruitmentStatus = async (recruitmentId, currentStatus) => {
//         const newStatus = currentStatus === 'open' ? 'closed' : 'open';
//         try {
//             await axiosInstance.patch(`/recruitments/${recruitmentId}`, { status: newStatus });
//             await fetchRecruitments();
//             await fetchStats();
//             alert(`Recruitment ${newStatus} successfully`);
//         } catch (error) {
//             console.error('Error updating recruitment:', error);
//             alert('Failed to update recruitment status');
//         }
//     };

//     const handleViewApplicants = async (recruitment) => {
//         try {
//             const response = await axiosInstance.get(`/recruitments/${recruitment._id}/applicants`);
//             const applicantsData = response.data.data || response.data;
//             setSelectedItem({
//                 recruitment,
//                 applicants: Array.isArray(applicantsData) ? applicantsData : []
//             });
//             setShowApplicantsModal(true);
//         } catch (error) {
//             console.error('Error fetching applicants:', error);
//             alert('Failed to fetch applicants');
//         }
//     };

//     const handleUpdateApplicantStatus = async (recruitmentId, applicantId, status) => {
//         try {
//             await axiosInstance.patch(
//                 `/recruitments/${recruitmentId}/applicants/${applicantId}`,
//                 { status }
//             );
//             await handleViewApplicants(selectedItem.recruitment);
//             alert(`Applicant ${status} successfully`);
//         } catch (error) {
//             console.error('Error updating applicant:', error);
//             alert('Failed to update applicant status');
//         }
//     };

//     const handleDeleteAnnouncement = async (announcementId) => {
//         if (!window.confirm('Are you sure you want to delete this announcement?')) return;
//         try {
//             await axiosInstance.delete(`/announcements/${announcementId}`);
//             await fetchAnnouncements();
//             alert('Announcement deleted successfully');
//         } catch (error) {
//             console.error('Error deleting announcement:', error);
//             alert('Failed to delete announcement');
//         }
//     };

//     const handleGalleryUpload = async (file) => {
//         try {
//             const formData = new FormData();
//             formData.append('file', file);
//             await axiosInstance.post('/gallery', formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' }
//             });
//             await fetchGallery();
//             alert('Media uploaded successfully');
//         } catch (error) {
//             console.error('Error uploading media:', error);
//             alert('Failed to upload media');
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         navigate('/login');
//     };

//     const getGreeting = () => {
//         const hour = currentTime.getHours();
//         if (hour < 12) return 'Good Morning';
//         if (hour < 17) return 'Good Afternoon';
//         return 'Good Evening';
//     };

//     const navigation = [
//         { name: 'Dashboard', icon: Grid },
//         { name: 'Events', icon: Calendar },
//         { name: 'Event Requests', icon: FileText },
//         { name: 'Recruitment', icon: UserCheck },
//         { name: 'Students', icon: Users },
//         { name: 'Announcements', icon: Bell },
//         { name: 'Gallery', icon: Image }
//     ];

//     const getFilteredEvents = () => {
//         if (!Array.isArray(events)) return [];
//         const now = new Date();

//         return events.filter(event => {
//             const start = new Date(event.startDate);
//             const end = new Date(event.endDate);

//             if (eventFilter === 'all') return true;
//             if (eventFilter === 'ongoing') return start <= now && end >= now;
//             if (eventFilter === 'upcoming') return start > now;
//             if (eventFilter === 'completed') return end < now;
//             return true;
//         });
//     };

//     const getFilteredRequests = () => {
//         if (!Array.isArray(eventRequests)) return [];
//         if (requestFilter === 'all') return eventRequests;
//         return eventRequests.filter(req => req.status === requestFilter);
//     };

//     const getFilteredStudents = () => {
//         if (!Array.isArray(departmentStudents)) return [];

//         return departmentStudents.filter(student => {
//             const matchesSearch = !studentSearchQuery ||
//                 student.name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
//                 student.email?.toLowerCase().includes(studentSearchQuery.toLowerCase());

//             const matchesYear = !studentYearFilter || student.year === studentYearFilter;

//             return matchesSearch && matchesYear;
//         });
//     };

//     const getEventStatus = (event) => {
//         const now = new Date();
//         const start = new Date(event.startDate);
//         const end = new Date(event.endDate);

//         if (start <= now && end >= now) return 'ongoing';
//         if (start > now) return 'upcoming';
//         return 'completed';
//     };

//     const filteredEvents = getFilteredEvents();
//     const filteredRequests = getFilteredRequests();
//     const filteredStudents = getFilteredStudents();

//     return (
//         <div className="min-h-screen font-sans">
//             {/* Sidebar */}
//             <aside className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 z-50 ${sidebarCollapsed ? 'w-20' : 'w-64'} shadow-2xl`}>
//                 <div className="flex flex-col h-full">
//                     <div className="p-6 border-b border-slate-700/50">
//                         <div className="flex items-center gap-3">
//                             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30 font-bold text-lg">
//                                 CP
//                             </div>
//                             {!sidebarCollapsed && (
//                                 <div className="flex flex-col">
//                                     <span className="font-bold text-lg tracking-tight">CAMPUS PULSE</span>
//                                     <span className="text-xs text-slate-500">Faculty Portal</span>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     <div className="flex-1 overflow-y-auto py-6">
//                         <div className={`${sidebarCollapsed ? 'px-3' : 'px-4'} mb-4`}>
//                             {!sidebarCollapsed && (
//                                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Main Menu</span>
//                             )}
//                         </div>
//                         <nav className={`space-y-1 ${sidebarCollapsed ? 'px-3' : 'px-4'}`}>
//                             {navigation.map((item) => {
//                                 const Icon = item.icon;
//                                 const isActive = activeRoute === item.name;
//                                 return (
//                                     <button
//                                         key={item.name}
//                                         onClick={() => setActiveRoute(item.name)}
//                                         className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
//                                                 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
//                                                 : 'text-slate-600 hover:bg-slate-800/50 hover:text-white'
//                                             } ${sidebarCollapsed ? 'justify-center' : ''}`}
//                                     >
//                                         <Icon size={20} />
//                                         {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
//                                     </button>
//                                 );
//                             })}
//                         </nav>
//                     </div>

//                     <div className="p-4 border-t border-slate-700/50">
//                         <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 ${sidebarCollapsed ? 'justify-center' : ''}`}>
//                             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
//                                 {user.name?.charAt(0) || 'F'}
//                             </div>
//                             {!sidebarCollapsed && (
//                                 <div className="flex-1 min-w-0">
//                                     <p className="font-semibold text-sm truncate">{user.name}</p>
//                                     <p className="text-xs text-slate-500 capitalize">{user.role}</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <button
//                     onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//                     className="absolute -right-3 top-8 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-700 transition-all shadow-lg"
//                 >
//                     <ChevronRight size={14} className={`transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
//                 </button>
//             </aside>

//             {/* Main Content */}
//             <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
//                 {/* Header */}
//                 <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
//                     <div className="px-8 py-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <h1 className="text-2xl font-bold text-slate-900">
//                                     {getGreeting()}, <span className="text-blue-600">{user.name?.split(' ')[0] || 'Faculty'}</span>
//                                 </h1>
//                                 <p className="text-sm text-slate-600 mt-1">Welcome back to your faculty dashboard</p>
//                             </div>

//                             <div className="flex items-center gap-4">
//                                 <div className="relative hidden md:block">
//                                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
//                                     <input
//                                         type="text"
//                                         placeholder="Search events, students..."
//                                         value={searchQuery}
//                                         onChange={(e) => setSearchQuery(e.target.value)}
//                                         className="pl-10 pr-4 py-2 w-80 bg-slate-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
//                                     />
//                                 </div>

//                                 <button className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors">
//                                     <Bell size={20} className="text-slate-600" />
//                                     {stats.pendingRequests > 0 && (
//                                         <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
//                                             {stats.pendingRequests}
//                                         </span>
//                                     )}
//                                 </button>

//                                 <div className="relative">
//                                     <button
//                                         onClick={() => setShowProfileMenu(!showProfileMenu)}
//                                         className="flex items-center gap-3 p-2 hover:bg-slate-100 rounded-xl transition-colors"
//                                     >
//                                         <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-md">
//                                             {user.name?.charAt(0) || 'F'}
//                                         </div>
//                                         <div className="hidden lg:block text-left">
//                                             <p className="font-semibold text-sm text-slate-900">{user.name}</p>
//                                             <p className="text-xs text-blue-600 font-medium capitalize">{user.role}</p>
//                                         </div>
//                                         <ChevronRight size={16} className={`text-slate-500 transition-transform hidden lg:block ${showProfileMenu ? 'rotate-90' : ''}`} />
//                                     </button>

//                                     {showProfileMenu && (
//                                         <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 animate-fadeIn">
//                                             <div className="px-4 py-3 border-b border-slate-100">
//                                                 <p className="font-semibold text-slate-900">{user.name}</p>
//                                                 <p className="text-sm text-slate-600">{user.email}</p>
//                                                 <p className="text-xs text-slate-500 mt-1">{user.branch}</p>
//                                             </div>
//                                             <button className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700">
//                                                 <User size={16} />
//                                                 <span className="text-sm">Profile</span>
//                                             </button>
//                                             <button className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-slate-700">
//                                                 <Settings size={16} />
//                                                 <span className="text-sm">Settings</span>
//                                             </button>
//                                             <button
//                                                 onClick={handleLogout}
//                                                 className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 text-red-600 border-t border-slate-100 mt-1"
//                                             >
//                                                 <LogOut size={16} />
//                                                 <span className="text-sm">Logout</span>
//                                             </button>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </header>

//                 {/* Dashboard Content */}
//                 <main className="p-8">
//                     {activeRoute === 'Dashboard' && (
//                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                             <div className="lg:col-span-2 space-y-6">
//                                 {/* Stats Cards */}
//                                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                                     <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
//                                         <div className="flex items-center justify-between mb-4">
//                                             <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                                                 <Calendar size={24} className="text-blue-600" />
//                                             </div>
//                                             <ChevronRight size={20} className="text-slate-500 group-hover:text-slate-600 transition-colors" />
//                                         </div>
//                                         <div>
//                                             <p className="text-slate-600 text-sm font-medium mb-1">My Events</p>
//                                             <p className="text-3xl font-bold text-slate-900">{stats.myEvents}</p>
//                                         </div>
//                                     </div>

//                                     <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
//                                         <div className="flex items-center justify-between mb-4">
//                                             <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                                                 <AlertCircle size={24} className="text-amber-600" />
//                                             </div>
//                                             <ChevronRight size={20} className="text-slate-500 group-hover:text-slate-600 transition-colors" />
//                                         </div>
//                                         <div>
//                                             <p className="text-slate-600 text-sm font-medium mb-1">Pending Requests</p>
//                                             <p className="text-3xl font-bold text-slate-900">{stats.pendingRequests}</p>
//                                         </div>
//                                     </div>

//                                     <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
//                                         <div className="flex items-center justify-between mb-4">
//                                             <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                                                 <UserCheck size={24} className="text-emerald-600" />
//                                             </div>
//                                             <ChevronRight size={20} className="text-slate-500 group-hover:text-slate-600 transition-colors" />
//                                         </div>
//                                         <div>
//                                             <p className="text-slate-600 text-sm font-medium mb-1">Active Recruitments</p>
//                                             <p className="text-3xl font-bold text-slate-900">{stats.activeRecruitments}</p>
//                                         </div>
//                                     </div>

//                                     <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
//                                         <div className="flex items-center justify-between mb-4">
//                                             <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
//                                                 <Users size={24} className="text-purple-600" />
//                                             </div>
//                                             <ChevronRight size={20} className="text-slate-500 group-hover:text-slate-600 transition-colors" />
//                                         </div>
//                                         <div>
//                                             <p className="text-slate-600 text-sm font-medium mb-1">Department Students</p>
//                                             <p className="text-3xl font-bold text-slate-900">{stats.departmentStudents}</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Pending Requests Preview */}
//                                 {filteredRequests.filter(r => r.status === 'pending').slice(0, 3).length > 0 && (
//                                     <section>
//                                         <div className="flex items-center justify-between mb-4">
//                                             <div className="flex items-center gap-2">
//                                                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
//                                                 <h2 className="text-xl font-bold text-slate-900">Pending Event Requests</h2>
//                                             </div>
//                                             <button
//                                                 onClick={() => setActiveRoute('Event Requests')}
//                                                 className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
//                                             >
//                                                 View All
//                                                 <ChevronRight size={16} />
//                                             </button>
//                                         </div>
//                                         <div className="space-y-3">
//                                             {filteredRequests.filter(r => r.status === 'pending').slice(0, 3).map((request) => (
//                                                 <div key={request._id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
//                                                     <div className="flex items-start justify-between gap-4">
//                                                         <div className="flex-1">
//                                                             <h3 className="font-bold text-slate-900 mb-2">{request.title}</h3>
//                                                             <p className="text-sm text-slate-600 mb-3 line-clamp-2">{request.description}</p>
//                                                             <div className="flex items-center gap-4 text-xs text-slate-500">
//                                                                 <span className="flex items-center gap-1">
//                                                                     <Calendar size={12} />
//                                                                     {new Date(request.startDate).toLocaleDateString()}
//                                                                 </span>
//                                                                 <span className="flex items-center gap-1">
//                                                                     <User size={12} />
//                                                                     {request.requestedBy?.name || 'Unknown'}
//                                                                 </span>
//                                                             </div>
//                                                         </div>
//                                                         <div className="flex gap-2">
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setSelectedItem(request);
//                                                                     setApprovalAction('approve');
//                                                                     setShowApprovalModal(true);
//                                                                 }}
//                                                                 className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1"
//                                                             >
//                                                                 <Check size={14} />
//                                                                 Approve
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => {
//                                                                     setSelectedItem(request);
//                                                                     setApprovalAction('reject');
//                                                                     setShowApprovalModal(true);
//                                                                 }}
//                                                                 className="px-3 py-1.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg font-semibold text-sm transition-colors flex items-center gap-1"
//                                                             >
//                                                                 <XCircle size={14} />
//                                                                 Reject
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </section>
//                                 )}

//                                 {/* My Events Preview */}
//                                 {filteredEvents.length > 0 && (
//                                     <section>
//                                         <div className="flex items-center justify-between mb-4">
//                                             <h2 className="text-xl font-bold text-slate-900">My Events</h2>
//                                             <button
//                                                 onClick={() => setActiveRoute('Events')}
//                                                 className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
//                                             >
//                                                 View All
//                                                 <ChevronRight size={16} />
//                                             </button>
//                                         </div>
//                                         <div className="grid md:grid-cols-2 gap-4">
//                                             {filteredEvents.slice(0, 4).map((event) => {
//                                                 const status = getEventStatus(event);
//                                                 const statusConfig = {
//                                                     ongoing: { bg: 'bg-red-100', text: 'text-red-700', label: 'Live Now' },
//                                                     upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Upcoming' },
//                                                     completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' }
//                                                 };
//                                                 const config = statusConfig[status];

//                                                 return (
//                                                     <div key={event._id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all">
//                                                         <div className="flex items-start justify-between mb-3">
//                                                             <h3 className="font-bold text-slate-900">{event.title}</h3>
//                                                             <span className={`px-2 py-0.5 ${config.bg} ${config.text} text-xs font-bold rounded-full`}>
//                                                                 {config.label}
//                                                             </span>
//                                                         </div>
//                                                         <p className="text-sm text-slate-600 mb-3 line-clamp-2">{event.description}</p>
//                                                         <div className="space-y-2">
//                                                             <div className="flex items-center gap-2 text-xs text-slate-700">
//                                                                 <Calendar size={12} className="text-slate-500" />
//                                                                 <span>{new Date(event.startDate).toLocaleDateString()}</span>
//                                                             </div>
//                                                             <div className="flex items-center gap-2 text-xs text-slate-700">
//                                                                 <MapPin size={12} className="text-slate-500" />
//                                                                 <span>{event.venue}</span>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     </section>
//                                 )}
//                             </div>

//                             {/* Right Sidebar */}
//                             <div className="space-y-6">
//                                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
//                                     <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
//                                         <div className="w-1 h-5 bg-blue-500 rounded-full" />
//                                         Quick Actions
//                                     </h3>
//                                     <div className="space-y-2">
//                                         <button className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
//                                             <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
//                                                 <Plus size={18} className="text-blue-600" />
//                                             </div>
//                                             <div className="flex-1">
//                                                 <p className="font-semibold text-slate-900 text-sm">Create Event</p>
//                                                 <p className="text-xs text-slate-600 mt-0.5">Organize a new event</p>
//                                             </div>
//                                             <ChevronRight size={16} className="text-slate-500 mt-2 group-hover:text-slate-600 transition-colors" />
//                                         </button>

//                                         <button className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
//                                             <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
//                                                 <Bell size={18} className="text-blue-600" />
//                                             </div>
//                                             <div className="flex-1">
//                                                 <p className="font-semibold text-slate-900 text-sm">Post Announcement</p>
//                                                 <p className="text-xs text-slate-600 mt-0.5">Share updates</p>
//                                             </div>
//                                             <ChevronRight size={16} className="text-slate-500 mt-2 group-hover:text-slate-600 transition-colors" />
//                                         </button>

//                                         <button className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group">
//                                             <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
//                                                 <UserPlus size={18} className="text-blue-600" />
//                                             </div>
//                                             <div className="flex-1">
//                                                 <p className="font-semibold text-slate-900 text-sm">Open Recruitment</p>
//                                                 <p className="text-xs text-slate-600 mt-0.5">Recruit volunteers</p>
//                                             </div>
//                                             <ChevronRight size={16} className="text-slate-500 mt-2 group-hover:text-slate-600 transition-colors" />
//                                         </button>
//                                     </div>
//                                 </div>

//                                 <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
//                                     <h3 className="font-bold text-lg mb-4">Department Overview</h3>
//                                     <div className="space-y-3">
//                                         <div className="flex items-center justify-between">
//                                             <span className="text-white/80">Total Students</span>
//                                             <span className="font-bold text-xl">{stats.departmentStudents}</span>
//                                         </div>
//                                         <div className="flex items-center justify-between">
//                                             <span className="text-white/80">My Events</span>
//                                             <span className="font-bold text-xl">{stats.myEvents}</span>
//                                         </div>
//                                         <div className="flex items-center justify-between">
//                                             <span className="text-white/80">Open Positions</span>
//                                             <span className="font-bold text-xl">{stats.activeRecruitments}</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {activeRoute === 'Events' && (
//                         <div className="space-y-6">
//                             <div className="flex items-center justify-between">
//                                 <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
//                                 <div className="flex items-center gap-3">
//                                     <select
//                                         value={eventFilter}
//                                         onChange={(e) => setEventFilter(e.target.value)}
//                                         className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     >
//                                         <option value="all">All Events</option>
//                                         <option value="ongoing">Ongoing</option>
//                                         <option value="upcoming">Upcoming</option>
//                                         <option value="completed">Completed</option>
//                                     </select>
//                                     <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
//                                         <Plus size={18} />
//                                         Create Event
//                                     </button>
//                                 </div>
//                             </div>

//                             {loading.events ? (
//                                 <div className="flex items-center justify-center py-12">
//                                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                                 </div>
//                             ) : filteredEvents.length > 0 ? (
//                                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                     {filteredEvents.map((event) => {
//                                         const status = getEventStatus(event);
//                                         const statusConfig = {
//                                             ongoing: { bg: 'bg-red-100', text: 'text-red-700', label: 'Live Now' },
//                                             upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Upcoming' },
//                                             completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' }
//                                         };
//                                         const config = statusConfig[status];

//                                         return (
//                                             <div key={event._id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all">
//                                                 <div className="flex items-start justify-between mb-3">
//                                                     <h3 className="font-bold text-slate-900 flex-1">{event.title}</h3>
//                                                     <span className={`px-2 py-0.5 ${config.bg} ${config.text} text-xs font-bold rounded-full`}>
//                                                         {config.label}
//                                                     </span>
//                                                 </div>
//                                                 <p className="text-sm text-slate-600 mb-4 line-clamp-2">{event.description}</p>
//                                                 <div className="space-y-2 mb-4">
//                                                     <div className="flex items-center gap-2 text-xs text-slate-700">
//                                                         <Calendar size={12} className="text-slate-500" />
//                                                         <span>{new Date(event.startDate).toLocaleDateString()}</span>
//                                                     </div>
//                                                     <div className="flex items-center gap-2 text-xs text-slate-700">
//                                                         <MapPin size={12} className="text-slate-500" />
//                                                         <span>{event.venue}</span>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex gap-2">
//                                                     <button className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center justify-center gap-1">
//                                                         <Edit size={14} />
//                                                         Edit
//                                                     </button>
//                                                     <button
//                                                         onClick={() => handleDeleteEvent(event._id)}
//                                                         className="flex-1 px-3 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
//                                                     >
//                                                         <Trash size={14} />
//                                                         Delete
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12">
//                                     <Calendar className="mx-auto text-slate-600 mb-4" size={48} />
//                                     <p className="text-slate-500">No events found</p>
//                                     <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                                         Create Your First Event
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {activeRoute === 'Event Requests' && (
//                         <div className="space-y-6">
//                             <div className="flex items-center justify-between">
//                                 <h1 className="text-2xl font-bold text-slate-900">Event Requests</h1>
//                                 <select
//                                     value={requestFilter}
//                                     onChange={(e) => setRequestFilter(e.target.value)}
//                                     className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 >
//                                     <option value="pending">Pending</option>
//                                     <option value="approved">Approved</option>
//                                     <option value="rejected">Rejected</option>
//                                     <option value="all">All Requests</option>
//                                 </select>
//                             </div>

//                             {loading.requests ? (
//                                 <div className="flex items-center justify-center py-12">
//                                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                                 </div>
//                             ) : filteredRequests.length > 0 ? (
//                                 <div className="space-y-4">
//                                     {filteredRequests.map((request) => (
//                                         <div key={request._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
//                                             <div className="flex items-start justify-between gap-4 mb-4">
//                                                 <div className="flex-1">
//                                                     <div className="flex items-center gap-2 mb-2">
//                                                         <h3 className="font-bold text-slate-900">{request.title}</h3>
//                                                         <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
//                                                                 request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
//                                                                     'bg-red-100 text-red-700'
//                                                             }`}>
//                                                             {request.status?.toUpperCase()}
//                                                         </span>
//                                                     </div>
//                                                     <p className="text-sm text-slate-600 mb-3">{request.description}</p>
//                                                     <div className="flex items-center gap-4 text-xs text-slate-500">
//                                                         <span className="flex items-center gap-1">
//                                                             <Calendar size={12} />
//                                                             {new Date(request.startDate).toLocaleDateString()}
//                                                         </span>
//                                                         <span className="flex items-center gap-1">
//                                                             <User size={12} />
//                                                             {request.requestedBy?.name || 'Unknown'}
//                                                         </span>
//                                                         <span className="flex items-center gap-1">
//                                                             <MapPin size={12} />
//                                                             {request.venue}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                                 {request.status === 'pending' && (
//                                                     <div className="flex gap-2">
//                                                         <button
//                                                             onClick={() => {
//                                                                 setSelectedItem(request);
//                                                                 setApprovalAction('approve');
//                                                                 setShowApprovalModal(true);
//                                                             }}
//                                                             className="px-4 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
//                                                         >
//                                                             <Check size={16} />
//                                                             Approve
//                                                         </button>
//                                                         <button
//                                                             onClick={() => {
//                                                                 setSelectedItem(request);
//                                                                 setApprovalAction('reject');
//                                                                 setShowApprovalModal(true);
//                                                             }}
//                                                             className="px-4 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
//                                                         >
//                                                             <XCircle size={16} />
//                                                             Reject
//                                                         </button>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             {request.reviewComment && (
//                                                 <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
//                                                     <p className="text-xs font-medium text-slate-700 mb-1">Review Comment:</p>
//                                                     <p className="text-sm text-slate-600">{request.reviewComment}</p>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12">
//                                     <FileText className="mx-auto text-slate-600 mb-4" size={48} />
//                                     <p className="text-slate-500">No event requests found</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {activeRoute === 'Recruitment' && (
//                         <div className="space-y-6">
//                             <div className="flex items-center justify-between">
//                                 <h1 className="text-2xl font-bold text-slate-900">Recruitment</h1>
//                                 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
//                                     <Plus size={18} />
//                                     Create Recruitment
//                                 </button>
//                             </div>

//                             {loading.recruitments ? (
//                                 <div className="flex items-center justify-center py-12">
//                                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                                 </div>
//                             ) : recruitments.length > 0 ? (
//                                 <div className="grid md:grid-cols-2 gap-4">
//                                     {recruitments.map((recruitment) => (
//                                         <div key={recruitment._id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
//                                             <div className="flex items-start justify-between mb-3">
//                                                 <h3 className="font-bold text-slate-900">{recruitment.title}</h3>
//                                                 <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${recruitment.status === 'open'
//                                                         ? 'bg-emerald-100 text-emerald-700'
//                                                         : 'bg-gray-100 text-gray-700'
//                                                     }`}>
//                                                     {recruitment.status?.toUpperCase()}
//                                                 </span>
//                                             </div>
//                                             <p className="text-sm text-slate-600 mb-4 line-clamp-2">{recruitment.description}</p>
//                                             <div className="flex items-center gap-4 text-xs text-slate-700 mb-4">
//                                                 <span>{recruitment.positions} Positions</span>
//                                                 <span>•</span>
//                                                 <span>{recruitment.applicants?.length || 0} Applicants</span>
//                                             </div>
//                                             <div className="flex gap-2">
//                                                 <button
//                                                     onClick={() => handleViewApplicants(recruitment)}
//                                                     className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
//                                                 >
//                                                     View Applicants
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleToggleRecruitmentStatus(recruitment._id, recruitment.status)}
//                                                     className="px-3 py-2 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 rounded-lg transition-colors text-sm font-medium"
//                                                 >
//                                                     {recruitment.status === 'open' ? 'Close' : 'Open'}
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDeleteRecruitment(recruitment._id)}
//                                                     className="px-3 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium"
//                                                 >
//                                                     <Trash size={14} />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12">
//                                     <UserCheck className="mx-auto text-slate-600 mb-4" size={48} />
//                                     <p className="text-slate-500">No recruitments found</p>
//                                     <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                                         Create First Recruitment
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {activeRoute === 'Students' && (
//                         <div className="space-y-6">
//                             <div className="flex items-center justify-between">
//                                 <h1 className="text-2xl font-bold text-slate-900">Department Students</h1>
//                                 <div className="flex items-center gap-3">
//                                     <div className="relative">
//                                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
//                                         <input
//                                             type="text"
//                                             placeholder="Search students..."
//                                             value={studentSearchQuery}
//                                             onChange={(e) => setStudentSearchQuery(e.target.value)}
//                                             className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                         />
//                                     </div>
//                                     <select
//                                         value={studentYearFilter}
//                                         onChange={(e) => setStudentYearFilter(e.target.value)}
//                                         className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     >
//                                         <option value="">All Years</option>
//                                         <option value="1">First Year</option>
//                                         <option value="2">Second Year</option>
//                                         <option value="3">Third Year</option>
//                                         <option value="4">Fourth Year</option>
//                                     </select>
//                                 </div>
//                             </div>

//                             {loading.students ? (
//                                 <div className="flex items-center justify-center py-12">
//                                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                                 </div>
//                             ) : filteredStudents.length > 0 ? (
//                                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//                                     <table className="w-full">
//                                         <thead className="bg-slate-50 border-b border-slate-200">
//                                             <tr>
//                                                 <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Name</th>
//                                                 <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Email</th>
//                                                 <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Year</th>
//                                                 <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="divide-y divide-slate-200">
//                                             {filteredStudents.map((student) => (
//                                                 <tr key={student._id} className="hover:bg-slate-50 transition-colors">
//                                                     <td className="px-6 py-4">
//                                                         <div className="flex items-center gap-3">
//                                                             <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
//                                                                 {student.name?.charAt(0)}
//                                                             </div>
//                                                             <span className="font-medium text-slate-900">{student.name}</span>
//                                                         </div>
//                                                     </td>
//                                                     <td className="px-6 py-4 text-sm text-slate-600">{student.email}</td>
//                                                     <td className="px-6 py-4 text-sm text-slate-600">{student.year || 'N/A'}</td>
//                                                     <td className="px-6 py-4">
//                                                         <button className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium flex items-center gap-1">
//                                                             <Eye size={14} />
//                                                             View Profile
//                                                         </button>
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12">
//                                     <Users className="mx-auto text-slate-600 mb-4" size={48} />
//                                     <p className="text-slate-500">No students found</p>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {activeRoute === 'Announcements' && (
//                         <div className="space-y-6">
//                             <div className="flex items-center justify-between">
//                                 <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
//                                 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
//                                     <Plus size={18} />
//                                     Create Announcement
//                                 </button>
//                             </div>

//                             {loading.announcements ? (
//                                 <div className="flex items-center justify-center py-12">
//                                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                                 </div>
//                             ) : announcements.length > 0 ? (
//                                 <div className="space-y-4">
//                                     {announcements.map((announcement) => (
//                                         <div key={announcement._id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
//                                             <div className="flex items-start justify-between">
//                                                 <div className="flex-1">
//                                                     <h3 className="font-bold text-slate-900 mb-2">{announcement.title}</h3>
//                                                     <p className="text-sm text-slate-600 mb-3">{announcement.content}</p>
//                                                     <div className="flex items-center gap-2 text-xs text-slate-500">
//                                                         <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
//                                                         <span>•</span>
//                                                         <span>{announcement.author || user.name}</span>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex gap-2">
//                                                     <button className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
//                                                         <Edit size={14} />
//                                                     </button>
//                                                     <button
//                                                         onClick={() => handleDeleteAnnouncement(announcement._id)}
//                                                         className="px-3 py-1.5 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium"
//                                                     >
//                                                         <Trash size={14} />
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12">
//                                     <Bell className="mx-auto text-slate-600 mb-4" size={48} />
//                                     <p className="text-slate-500">No announcements found</p>
//                                     <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                                         Create First Announcement
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     {activeRoute === 'Gallery' && (
//                         <div className="space-y-6">
//                             <div className="flex items-center justify-between">
//                                 <h1 className="text-2xl font-bold text-slate-900">Photo Gallery</h1>
//                                 <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
//                                     <Upload size={18} />
//                                     Upload Media
//                                 </button>
//                             </div>

//                             {loading.gallery ? (
//                                 <div className="flex items-center justify-center py-12">
//                                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                                 </div>
//                             ) : galleryItems.length > 0 ? (
//                                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                                     {galleryItems.map((item) => (
//                                         <div key={item._id} className="aspect-square rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer">
//                                             <img src={item.url} alt={item.title || 'Gallery item'} className="w-full h-full object-cover" />
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <div className="text-center py-12">
//                                     <Image className="mx-auto text-slate-600 mb-4" size={48} />
//                                     <p className="text-slate-500">No media found</p>
//                                     <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                                         Upload First Media
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </main>
//             </div>

//             {/* Approval Modal */}
//             {showApprovalModal && selectedItem && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fadeIn">
//                         <h3 className="text-xl font-bold text-slate-900 mb-4">
//                             {approvalAction === 'approve' ? 'Approve' : 'Reject'} Event Request
//                         </h3>
//                         <div className="mb-4">
//                             <p className="text-sm text-slate-600 mb-2">Event: {selectedItem.title}</p>
//                             <p className="text-sm text-slate-600">Requested by: {selectedItem.requestedBy?.name}</p>
//                         </div>
//                         <div className="mb-4">
//                             <label className="block text-sm font-medium text-slate-700 mb-2">
//                                 Comment (Optional)
//                             </label>
//                             <textarea
//                                 value={approvalComment}
//                                 onChange={(e) => setApprovalComment(e.target.value)}
//                                 rows={3}
//                                 className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                                 placeholder="Add a comment..."
//                             />
//                         </div>
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={() => {
//                                     setShowApprovalModal(false);
//                                     setApprovalComment('');
//                                     setSelectedItem(null);
//                                 }}
//                                 className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 onClick={() => {
//                                     if (approvalAction === 'approve') {
//                                         handleApproveRequest(selectedItem._id);
//                                     } else {
//                                         handleRejectRequest(selectedItem._id);
//                                     }
//                                 }}
//                                 className={`flex-1 px-4 py-2 rounded-lg transition-colors ${approvalAction === 'approve'
//                                         ? 'bg-emerald-600 text-white hover:bg-emerald-700'
//                                         : 'bg-red-600 text-white hover:bg-red-700'
//                                     }`}
//                             >
//                                 {approvalAction === 'approve' ? 'Approve' : 'Reject'}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Applicants Modal */}
//             {showApplicantsModal && selectedItem && (
//                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//                     <div className="bg-white rounded-2xl max-w-4xl w-full p-6 my-8 animate-fadeIn">
//                         <div className="flex items-center justify-between mb-6">
//                             <h3 className="text-xl font-bold text-slate-900">
//                                 Applicants - {selectedItem.recruitment?.title}
//                             </h3>
//                             <button
//                                 onClick={() => {
//                                     setShowApplicantsModal(false);
//                                     setSelectedItem(null);
//                                 }}
//                                 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                             >
//                                 <X size={20} />
//                             </button>
//                         </div>

//                         {selectedItem.applicants?.length > 0 ? (
//                             <div className="space-y-4 max-h-[60vh] overflow-y-auto">
//                                 {selectedItem.applicants.map((applicant) => (
//                                     <div key={applicant._id} className="border border-slate-200 rounded-lg p-4">
//                                         <div className="flex items-start justify-between mb-3">
//                                             <div className="flex-1">
//                                                 <h4 className="font-bold text-slate-900 mb-1">{applicant.user?.name || 'Unknown'}</h4>
//                                                 <p className="text-sm text-slate-600">{applicant.user?.email}</p>
//                                                 <p className="text-sm text-slate-600">{applicant.user?.branch}</p>
//                                             </div>
//                                             <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${applicant.status === 'selected' ? 'bg-emerald-100 text-emerald-700' :
//                                                     applicant.status === 'rejected' ? 'bg-red-100 text-red-700' :
//                                                         'bg-amber-100 text-amber-700'
//                                                 }`}>
//                                                 {applicant.status?.toUpperCase()}
//                                             </span>
//                                         </div>

//                                         {applicant.coverLetter && (
//                                             <div className="mb-3 p-3 bg-slate-50 rounded-lg">
//                                                 <p className="text-xs font-medium text-slate-700 mb-1">Cover Letter:</p>
//                                                 <p className="text-sm text-slate-600">{applicant.coverLetter}</p>
//                                             </div>
//                                         )}

//                                         <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
//                                             <span>Applied: {new Date(applicant.appliedAt || applicant.createdAt).toLocaleDateString()}</span>
//                                             {applicant.resume && (
//                                                 <a
//                                                     href={applicant.resume}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
//                                                 >
//                                                     <Download size={12} />
//                                                     Resume
//                                                 </a>
//                                             )}
//                                         </div>

//                                         {applicant.status === 'pending' && (
//                                             <div className="flex gap-2">
//                                                 <button
//                                                     onClick={() => handleUpdateApplicantStatus(selectedItem.recruitment._id, applicant._id, 'selected')}
//                                                     className="flex-1 px-3 py-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
//                                                 >
//                                                     <CheckCircle size={14} />
//                                                     Select
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleUpdateApplicantStatus(selectedItem.recruitment._id, applicant._id, 'rejected')}
//                                                     className="flex-1 px-3 py-2 bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1"
//                                                 >
//                                                     <XCircle size={14} />
//                                                     Reject
//                                                 </button>
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="text-center py-12">
//                                 <Users className="mx-auto text-slate-600 mb-4" size={48} />
//                                 <p className="text-slate-500">No applicants yet</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             )}

//             <style jsx>{`
//         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
//         * {
//           font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
//         }

//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out;
//         }

//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//         </div>
//     );
// };

// // ==================== STUDENT/ADMIN DASHBOARD (Keep existing code) ====================
// const StudentAdminDashboard = ({ user }) => {
//     const navigate = useNavigate();
//     const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//     const [activeRoute, setActiveRoute] = useState('Dashboard');
//     const [searchQuery, setSearchQuery] = useState('');
//     const [showProfileMenu, setShowProfileMenu] = useState(false);
//     const [currentTime, setCurrentTime] = useState(new Date());

//     // Admin Data
//     const [allUsers, setAllUsers] = useState([]);
//     const [pendingFaculty, setPendingFaculty] = useState([]);

//     useEffect(() => {
//         if (user.role === 'admin') {
//             fetchUsers();
//         }
//     }, [user.role]);

//     const fetchUsers = async () => {
//         try {
//             const response = await axiosInstance.get('/admin/users');
//             const usersData = response.data.data || response.data;
//             setAllUsers(usersData);
//             setPendingFaculty(usersData.filter(u => u.role === 'faculty' && !u.isApproved));
//         } catch (error) {
//             console.error("Failed to fetch users", error);
//         }
//     };

//     const handleApprove = async (id) => {
//         try {
//             await axiosInstance.put(`/admin/users/${id}/approve`);
//             setAllUsers(prev => prev.map(u => u._id === id ? { ...u, isApproved: true } : u));
//             setPendingFaculty(prev => prev.filter(u => u._id !== id));
//             alert("Faculty approved successfully");
//         } catch (err) {
//             alert("Failed to approve faculty");
//         }
//     };

//     const handleReject = async (id) => {
//         if (!window.confirm("Are you sure you want to reject and delete this request?")) return;
//         try {
//             await axiosInstance.delete(`/admin/users/${id}`);
//             setAllUsers(prev => prev.filter(u => u._id !== id));
//             setPendingFaculty(prev => prev.filter(u => u._id !== id));
//             alert("Request rejected");
//         } catch (err) {
//             alert("Failed to reject request");
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         navigate('/login');
//     };

//     // Mock data
//     const [stats] = useState({
//         ongoing: 1,
//         upcoming: 3,
//         finished: 3
//     });

//     const [liveEvent] = useState({
//         id: 1,
//         title: 'Annual Tech Fest 2024',
//         description: 'Join us for the biggest tech celebration of the year!',
//         date: 'Mar 15 - Mar 17, 2024',
//         venue: 'Main Auditorium',
//         department: 'Computer Department',
//         image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
//         attendance: { current: 245, total: 300 }
//     });

//     const [upcomingEvents] = useState([
//         {
//             id: 2,
//             title: 'Industry Expert Talk',
//             description: 'Expert insights on software industry trends.',
//             date: 'Mar 20, 2024',
//             venue: 'Seminar Hall',
//             image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=300&fit=crop',
//             spotsLeft: 61,
//             registrationOpen: true
//         },
//         {
//             id: 3,
//             title: 'Robotics Workshop',
//             description: 'Build your first robot in this hands-on workshop.',
//             date: 'Mar 25, 2024',
//             venue: 'Electronics Lab',
//             image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
//             spotsLeft: 8,
//             registrationOpen: true
//         },
//         {
//             id: 4,
//             title: 'Annual Sports Meet',
//             description: 'Compete with fellow students in various sports.',
//             date: 'Mar 28, 2024',
//             venue: 'Sports Ground',
//             image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
//             spotsLeft: 244,
//             registrationOpen: true
//         }
//     ]);

//     const [announcements] = useState([
//         {
//             id: 1,
//             title: 'Examination Schedule Released',
//             preview: 'The end semester examination schedule for March 2024 has been released. Students are advised to check the notice board and prepare accordingly.',
//             author: 'Dr. Priya Kulkarni',
//             authorRole: 'admin',
//             timestamp: 'almost 2 years ago',
//             important: true
//         },
//         {
//             id: 2,
//             title: 'Library Timings Extended',
//             preview: 'During examination period, the library will remain open from 8 AM to 10 PM. Students can utilize this facility for their studies.',
//             author: 'Prof. Amit Desai',
//             authorRole: 'faculty',
//             timestamp: 'almost 2 years ago',
//             important: false
//         },
//         {
//             id: 3,
//             title: 'Internship Opportunities',
//             preview: 'Multiple companies are offering summer internships. Interested students should submit their resumes to the T&P cell by March 20th.',
//             author: 'T&P Cell',
//             authorRole: 'faculty',
//             timestamp: 'almost 2 years ago',
//             important: true
//         },
//         {
//             id: 4,
//             title: 'Workshop Registration Open',
//             preview: 'Registrations for the upcoming Web Development workshop are now open. Limited seats available. Register through the portal.',
//             author: 'Prof. Sneha Patil',
//             authorRole: 'faculty',
//             timestamp: 'almost 2 years ago',
//             important: false
//         }
//     ]);

//     const [pastEvents] = useState([
//         {
//             id: 5,
//             title: 'Coding Bootcamp',
//             date: 'Feb 11, 2024',
//             department: 'Computer Department',
//             attended: 75,
//             image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=100&h=100&fit=crop',
//             hasPhotos: true
//         },
//         {
//             id: 6,
//             title: 'Republic Day Celebration',
//             date: 'Jan 26, 2024',
//             department: 'Administration',
//             attended: 500,
//             image: 'https://images.unsplash.com/photo-1610660848933-7162c5c64e7e?w=100&h=100&fit=crop',
//             hasPhotos: true
//         },
//         {
//             id: 7,
//             title: 'Project Exhibition',
//             date: 'Feb 21, 2024',
//             department: 'All Departments',
//             attended: 320,
//             image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=100&h=100&fit=crop',
//             hasPhotos: true
//         }
//     ]);

//     const [recentPhotos] = useState([
//         'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&h=200&fit=crop',
//         'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=200&h=200&fit=crop',
//         'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=200&h=200&fit=crop',
//         'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=200&h=200&fit=crop',
//         'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=200&h=200&fit=crop',
//         'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop'
//     ]);

//     useEffect(() => {
//         const timer = setInterval(() => setCurrentTime(new Date()), 60000);
//         return () => clearInterval(timer);
//     }, []);

//     const getGreeting = () => {
//         const hour = currentTime.getHours();
//         if (hour < 12) return 'Good Morning';
//         if (hour < 17) return 'Good Afternoon';
//         return 'Good Evening';
//     };

//     const navigation = [
//         { name: 'Dashboard', icon: Grid },
//         { name: 'Events', icon: Calendar },
//         { name: 'Announcements', icon: Bell },
//         { name: 'Gallery', icon: Image }
//     ];

//     const quickActions = user.role === 'student' ? [
//         { name: 'Request Event', icon: UserPlus, subtitle: 'Submit a new event proposal' },
//         { name: 'Volunteer', icon: Hand, subtitle: 'Apply for volunteer roles' },
//         { name: 'My Applications', icon: FileText, subtitle: 'Track your event applications' }
//     ] : user.role === 'faculty' ? [
//         { name: 'Create Event', icon: UserPlus, subtitle: 'Organize a new event' },
//         { name: 'Manage Events', icon: Calendar, subtitle: 'View and edit your events' },
//         { name: 'Post Announcement', icon: Bell, subtitle: 'Share important updates' }
//     ] : [
//         { name: 'Approve Events', icon: Award, subtitle: 'Review pending requests' },
//         { name: 'System Settings', icon: Settings, subtitle: 'Configure portal settings' },
//         { name: 'User Management', icon: Users, subtitle: 'Manage users and roles' }
//     ];

//     // Return your existing student/admin dashboard JSX here
//     // (Copy the entire return statement from your original Dashboard component)
//     return (
//         <div className="min-h-screen font-sans">
//             {/* YOUR EXISTING STUDENT/ADMIN DASHBOARD CODE GOES HERE */}
//             {/* I'm keeping this minimal since you already have this working */}
//             <div className="p-8">
//                 <h1 className="text-2xl font-bold text-slate-900">
//                     {user.role === 'admin' ? 'Admin' : 'Student'} Dashboard
//                 </h1>
//                 <p className="text-slate-600 mt-2">Your existing dashboard content...</p>
//             </div>

//             <style jsx>{`
//         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
//         * {
//           font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
//         }

//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(-10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out;
//         }

//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//         </div>
//     );
// };

// // Helper Components
// const StatsCard = ({ icon: Icon, label, count, color, iconBg, iconColor }) => {
//     return (
//         <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
//             <div className="flex items-center justify-between mb-4">
//                 <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
//                     <Icon size={24} className={iconColor} />
//                 </div>
//                 <ChevronRight size={20} className="text-slate-500 group-hover:text-slate-600 transition-colors" />
//             </div>
//             <div>
//                 <p className="text-slate-600 text-sm font-medium mb-1">{label}</p>
//                 <p className="text-3xl font-bold text-slate-900">{count}</p>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;
