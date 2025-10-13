import api from '../api/axios'; // Import your custom configured axios instance (adjust path if needed)

export default {
  getOpportunities(params) {
    return api.get('/opportunities', { params });
  },
  getOpportunity(id) {
    return api.get(`/opportunities/${id}`);
  },
  createOpportunity(data) {
    return api.post('/opportunities', data);
  },
  updateOpportunity(id, data) {
    return api.put(`/opportunities/${id}`, data);
  },
  deleteOpportunity(id) {
    return api.delete(`/opportunities/${id}`);
  },
  applyToOpportunity(formData) {
    return api.post('/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getApplications(params) {
    return api.get('/applications', { params });
  },
  updateApplicationStatus(id, status) {
    return api.patch(`/applications/${id}/status`, { status });
  }
};