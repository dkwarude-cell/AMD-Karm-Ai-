import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000
});

// Drift endpoints
export const generateDrift = (studentId) =>
  api.post('/api/drift/generate', { student_id: studentId });

export const acceptDriftApi = (driftId, studentId) =>
  api.post(`/api/drift/${driftId}/accept`, null, { params: { student_id: studentId } });

export const skipDriftApi = (driftId, studentId) =>
  api.post(`/api/drift/${driftId}/skip`, null, { params: { student_id: studentId } });

export const logDriftOutcome = (driftId, wasInteresting, description, studentId) =>
  api.post(`/api/drift/${driftId}/outcome`, {
    was_interesting: wasInteresting,
    description
  }, { params: { student_id: studentId } });

// Bubble endpoints
export const getBubble = (studentId) =>
  api.get(`/api/bubble/${studentId}`);

export const getUnexplored = (studentId) =>
  api.get(`/api/bubble/${studentId}/unexplored`);

// Profile endpoints
export const createProfile = (profileData) =>
  api.post('/api/profile/create', profileData);

export const getProfile = (studentId) =>
  api.get(`/api/profile/${studentId}`);

export const updateProfile = (studentId, data) =>
  api.patch(`/api/profile/${studentId}`, data);

// Events
export const getEvents = (params = {}) =>
  api.get('/api/events/', { params });

// Discovery slots
export const getActiveSlots = () =>
  api.get('/api/discovery-slots/active');

export const createSlot = (slotData) =>
  api.post('/api/discovery-slots/create', slotData);

// Chat assistant (AI-powered)
export const chatAsk = (query, studentId, history = []) =>
  api.post('/api/chat/ask', { query, student_id: studentId, history });

export default api;
