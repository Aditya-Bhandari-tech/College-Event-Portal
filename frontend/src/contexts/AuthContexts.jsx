import React, { useState, useEffect, useMemo } from 'react';
import { AuthContext } from './AuthContextDefinition';
import { authService } from '../services/authService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          const token = localStorage.getItem('token');
          if (token) {
            const userData = localStorage.getItem('user');
            setUser(userData ? JSON.parse(userData) : null);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    authService.logout(); // clears localStorage
  };

  const syncUser = () => {
    const userData = localStorage.getItem('user');
    setUser(userData ? JSON.parse(userData) : null);
  };

  // Stable context value — only changes when user or loading actually change
  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    syncUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

