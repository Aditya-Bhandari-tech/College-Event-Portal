import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-semibold text-dark-900">
            {getGreeting()}, <span className="text-primary-600">{user?.name || 'Admin'}</span>
          </h1>
          <p className="text-sm text-dark-500 mt-1">Welcome back to your dashboard</p>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
            <input
              type="text"
              placeholder="Search events, announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Notification Bell */}
          <button className="relative p-2 text-dark-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Admin Avatar */}
          <div className="flex items-center gap-3 ml-2">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-dark-900">{user?.name || 'Admin'}</p>
              <p className="text-xs text-dark-500">Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;