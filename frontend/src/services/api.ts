import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
if (!baseURL) throw new Error("VITE_API_URL is not defined in env!");

const API = axios.create({
  baseURL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    API.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    API.post('/auth/login', data),
};

// Note APIs
export const noteAPI = {
  getAllNotes: () => API.get('/notes'),
  getNoteById: (id: string) => API.get(`/notes/${id}`),
  createNote: (data: { title: string; content: string; tags: string[] }) =>
    API.post('/notes', data),
  updateNote: (id: string, data: any) => API.put(`/notes/${id}`, data),
  deleteNote: (id: string) => API.delete(`/notes/${id}`),
  getTags: () => API.get('/notes/tags'),
};
