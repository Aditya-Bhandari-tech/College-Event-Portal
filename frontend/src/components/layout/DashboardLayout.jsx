import React from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Access Denied</h1>
          <p className="text-dark-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;