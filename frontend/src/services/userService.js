import api from './api';

export const userService = {
  // Get dashboard summary
  getDashboardSummary: async () => {
    const response = await api.get('/admin/dashboard-summary');
    return response.data;
  },

  // Get all users with pagination
  getUsers: async (params) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  // Approve faculty
  approveFaculty: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/approve`);
    return response.data;
  },

  // Change user role
  changeUserRole: async (userId, role) => {
    const response = await api.patch(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    return response.data;
  },
};