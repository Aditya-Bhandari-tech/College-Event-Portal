import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Megaphone,
  UserCheck,
  FileCheck,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Events', path: '/admin/events', icon: Calendar },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Announcements', path: '/admin/announcements', icon: Megaphone },
    { name: 'Recruitment', path: '/admin/recruitment', icon: UserCheck },
    { name: 'Event Requests', path: '/admin/event-requests', icon: FileCheck },
    { name: 'Profile', path: '/admin/profile', icon: User },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center font-bold text-lg">
            EP
          </div>
          <span className="text-lg font-semibold">Event Portal</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3 px-3">
          Main Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-dark-300 hover:bg-dark-800 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center font-semibold text-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
            <p className="text-xs text-dark-400">Admin</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-dark-300 hover:bg-dark-800 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;