// src/api/axios.js
import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5000/api', // Local development
  baseURL: 'https://college-event-portal-5mgc.onrender.com/api', // Deployed production
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global Response Interceptor for handling token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto-logout the user if their token is expired or unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; // Force redirect to login
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;