import api from './api';

export const recruitmentService = {
  // Get all recruitments
  getRecruitments: async (params) => {
    const response = await api.get('/recruitments', { params });
    return response.data;
  },

  // Get single recruitment
  getRecruitment: async (recruitmentId) => {
    const response = await api.get(`/recruitments/${recruitmentId}`);
    return response.data;
  },

  // Create recruitment
  createRecruitment: async (data) => {
    const response = await api.post('/recruitments', data);
    return response.data;
  },

  // Update recruitment
  updateRecruitment: async (recruitmentId, data) => {
    const response = await api.put(`/recruitments/${recruitmentId}`, data);
    return response.data;
  },

  // Delete recruitment
  deleteRecruitment: async (recruitmentId) => {
    const response = await api.delete(`/recruitments/${recruitmentId}`);
    return response.data;
  },

  // Get applicants for a recruitment
  getApplicants: async (recruitmentId) => {
    const response = await api.get(`/recruitments/${recruitmentId}/applicants`);
    return response.data;
  },

  // Update applicant status
  updateApplicantStatus: async (recruitmentId, applicantId, status) => {
    const response = await api.patch(
      `/recruitments/${recruitmentId}/applicants/${applicantId}`,
      { status }
    );
    return response.data;
  },
};