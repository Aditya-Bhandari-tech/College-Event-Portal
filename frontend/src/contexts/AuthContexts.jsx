import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextDefinition';
import { authService } from '../services/authService'; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 🔥 First check authService (from first code)
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        } else {
          // Existing localStorage fallback logic
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

  // 🔥 Enhanced login (supports authService logic)
  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);

      // Keep localStorage logic
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

    // Logout from authService
    authService.logout();

    // Keep existing cleanup
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};