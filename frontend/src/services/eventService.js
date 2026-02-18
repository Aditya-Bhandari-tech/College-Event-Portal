import api from './api';

export const eventService = {
  // Get all events
  getEvents: async (params) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get single event
  getEvent: async (eventId) => {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  },

  // Create event
  createEvent: async (data) => {
    const response = await api.post('/events', data);
    return response.data;
  },

  // Update event
  updateEvent: async (eventId, data) => {
    const response = await api.put(`/events/${eventId}`, data);
    return response.data;
  },

  // Delete event
  deleteEvent: async (eventId) => {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  },

  // Get event requests
  getEventRequests: async (params) => {
    const response = await api.get('/event-requests', { params });
    return response.data;
  },

  // Approve event request
  approveEventRequest: async (requestId, comment) => {
    const response = await api.patch(`/event-requests/${requestId}/approve`, { comment });
    return response.data;
  },

  // Reject event request
  rejectEventRequest: async (requestId, comment) => {
    const response = await api.patch(`/event-requests/${requestId}/reject`, { comment });
    return response.data;
  },

  // Upload gallery images to an event
  uploadGalleryImages: async (eventId, formData) => {
    const response = await api.post(`/events/${eventId}/gallery`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Delete a gallery image from an event
  deleteGalleryImage: async (eventId, publicId) => {
    const response = await api.delete(`/events/${eventId}/gallery/${publicId}`);
    return response.data;
  },

  // Get all events that have gallery images
  getEventsWithImages: async () => {
    const response = await api.get('/events');
    const events = response.data.data || [];
    return events.filter(e => e.images && e.images.length > 0);
  },
};