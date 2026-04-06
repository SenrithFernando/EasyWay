const API_BASE_URL = '/api';

const buildHeaders = (includeJson = true) => {
  const token = localStorage.getItem('token');

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...buildHeaders(options.body !== undefined),
        ...(options.headers || {}),
      },
    });
  } catch (networkError) {
    const err = new Error(
      networkError.message?.includes('fetch')
        ? 'Cannot reach the server. Make sure the backend is running on the correct port.'
        : networkError.message || 'Network error.'
    );
    err.status = 0;
    throw err;
  }

  const text = await response.text();
  const payload = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};

  if (!response.ok) {
    const message =
      payload.message ||
      (payload.errors && typeof payload.errors === 'object' && Object.values(payload.errors).length
        ? Object.values(payload.errors).flat().join('. ')
        : null) ||
      `Request failed (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    error.errors = payload.errors || null;
    throw error;
  }

  return payload;
};

export const feedbackApi = {
  createFeedback: (body) =>
    request('/feedback', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  createDemoFeedback: (body) =>
    request('/feedback/demo', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateFeedback: (feedbackId, body) =>
    request(`/feedback/${feedbackId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteFeedback: (feedbackId) =>
    request(`/feedback/${feedbackId}`, {
      method: 'DELETE',
    }),

  getFeedbackById: (feedbackId) => request(`/feedback/${feedbackId}`),
  getMyFeedback: () => request('/feedback/me'),
  getFeedbackModuleInfo: () => request('/feedback/meta/module-info'),
  getVendorFeedback: (vendorId) => request(`/feedback/vendors/${vendorId}`),
  getVendorStats: (vendorId) => request(`/feedback/vendors/${vendorId}/stats`),
  getVendorDashboard: (vendorId, limit = 5) =>
    request(`/feedback/vendors/${vendorId}/dashboard?limit=${limit}`),
  getVendorRanking: () => request('/feedback/ranking/vendors'),
};
