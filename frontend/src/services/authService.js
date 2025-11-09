import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// For Vercel deployment, use mock endpoints if no VITE_API_URL is set
const USE_MOCK = !import.meta.env.VITE_API_URL;

// Mock data for Vercel deployment
const mockSignup = async (userData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    message: 'Registration successful! You can now login.',
    user: {
      id: 1,
      full_name: userData.full_name || 'Demo User',
      mobile: userData.mobile || '9999888877',
      email: userData.email || 'demo@example.com'
    }
  };
};

const mockLogin = async (mobile, password) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simple validation
  if (password === 'test123' || !password) {
    return {
      message: 'Login successful',
      user: {
        id: 1,
        full_name: 'Demo User',
        mobile: mobile || '9999888877',
        email: 'demo@example.com'
      },
      access_token: 'demo_access_token_12345',
      refresh_token: 'demo_refresh_token_67890'
    };
  } else {
    throw new Error('Invalid credentials');
  }
};

const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const authService = {
  signup: async (userData) => {
    if (USE_MOCK) {
      return mockSignup(userData);
    }
    const response = await authAPI.post('/auth/signup', userData);
    return response.data;
  },

  login: async (mobile, password) => {
    if (USE_MOCK) {
      return mockLogin(mobile, password);
    }
    const response = await authAPI.post('/auth/login', { mobile, password });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  sendOTP: async (mobile) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: 'OTP sent successfully' };
    }
    const response = await authAPI.post('/auth/send-otp', { mobile });
    return response.data;
  },

  loginWithOTP: async (mobile, otp_code) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = {
        message: 'Login successful',
        user: {
          id: 1,
          full_name: 'Demo User',
          mobile: mobile || '9999888877',
          email: 'demo@example.com'
        },
        access_token: 'demo_access_token_12345',
        refresh_token: 'demo_refresh_token_67890'
      };
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return data;
    }
    
    const response = await authAPI.post('/auth/login-otp', { mobile, otp_code });
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  verifyOTP: async (mobile, otp_code) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { valid: true, message: 'OTP verified successfully' };
    }
    const response = await authAPI.post('/auth/verify-otp', { mobile, otp_code });
    return response.data;
  },

  forgotPassword: async (mobile) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: 'Password reset instructions sent' };
    }
    const response = await authAPI.post('/auth/forgot-password', { mobile });
    return response.data;
  },

  resetPassword: async (mobile, otp_code, new_password) => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { message: 'Password reset successfully' };
    }
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
