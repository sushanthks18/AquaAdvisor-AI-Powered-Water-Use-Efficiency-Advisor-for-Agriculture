import axios from 'axios';

const API_BASE_URL = '/api';

const farmAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add auth token to requests
farmAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const farmService = {
  getMyFarms: async () => {
    const response = await farmAPI.get('/farms/my-farms');
    return response.data.farms;
  },

  getFarm: async (farmId) => {
    const response = await farmAPI.get(`/farms/${farmId}`);
    return response.data.farm;
  },

  registerFarm: async (farmData) => {
    const response = await farmAPI.post('/farms/register', farmData);
    return response.data;
  },

  updateFarm: async (farmId, farmData) => {
    const response = await farmAPI.put(`/farms/${farmId}`, farmData);
    return response.data;
  },

  deleteFarm: async (farmId) => {
    const response = await farmAPI.delete(`/farms/${farmId}`);
    return response.data;
  },

  searchFarms: async (query, searchType = 'name') => {
    const response = await farmAPI.post('/farms/search', { query, search_type: searchType });
    return response.data.farms;
  },

  selectFarm: async (farmId) => {
    const response = await farmAPI.post('/farms/select', { farm_id: farmId });
    return response.data;
  },

  verifySurvey: async (survey_number, district) => {
    const response = await farmAPI.post('/farms/verify-survey', { 
      survey_number, 
      district 
    });
    return response.data;
  }
};

export default farmService;