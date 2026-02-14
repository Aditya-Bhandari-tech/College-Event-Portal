import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextDefinition';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if there's a stored token
        const token = localStorage.getItem('token');
        if (token) {
          // You can add logic here to validate the token
          // For now, we'll just check if it exists
          const userData = localStorage.getItem('user');
          setUser(userData ? JSON.parse(userData) : null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
