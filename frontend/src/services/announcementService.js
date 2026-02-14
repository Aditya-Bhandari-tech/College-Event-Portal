import api from './api';

export const announcementService = {
  // Get all announcements
  getAnnouncements: async (params) => {
    const response = await api.get('/announcements', { params });
    return response.data;
  },

  // Get single announcement
  getAnnouncement: async (announcementId) => {
    const response = await api.get(`/announcements/${announcementId}`);
    return response.data;
  },

  // Create announcement
  createAnnouncement: async (data) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },

  // Update announcement
  updateAnnouncement: async (announcementId, data) => {
    const response = await api.put(`/announcements/${announcementId}`, data);
    return response.data;
  },

  // Delete announcement
  deleteAnnouncement: async (announcementId) => {
    const response = await api.delete(`/announcements/${announcementId}`);
    return response.data;
  },
};