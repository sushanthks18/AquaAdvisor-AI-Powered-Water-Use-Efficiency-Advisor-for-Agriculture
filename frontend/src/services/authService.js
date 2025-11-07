import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const authService = {
  signup: async (userData) => {
    const response = await authAPI.post('/auth/signup', userData);
    return response.data;
  },

  login: async (mobile, password) => {
    const response = await authAPI.post('/auth/login', { mobile, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  sendOTP: async (mobile) => {
    const response = await authAPI.post('/auth/send-otp', { mobile });
    return response.data;
  },

  loginWithOTP: async (mobile, otp_code) => {
    const response = await authAPI.post('/auth/login-otp', { mobile, otp_code });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  verifyOTP: async (mobile, otp_code) => {
    const response = await authAPI.post('/auth/verify-otp', { mobile, otp_code });
    return response.data;
  },

  forgotPassword: async (mobile) => {
    const response = await authAPI.post('/auth/forgot-password', { mobile });
    return response.data;
  },

  resetPassword: async (mobile, otp_code, new_password) => {
    const response = await authAPI.post('/auth/reset-password', { 
      mobile, 
      otp_code, 
      new_password 
    });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('access_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  }
};

export default authService;