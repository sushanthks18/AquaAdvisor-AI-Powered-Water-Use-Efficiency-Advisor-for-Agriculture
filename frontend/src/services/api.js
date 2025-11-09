import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// For Vercel deployment, use mock endpoints if no VITE_API_URL is set
const USE_MOCK = !import.meta.env.VITE_API_URL;

// Mock data for field analysis
const mockFieldAnalysis = async (data) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Generate mock analysis data
  const mockData = {
    field_id: "FARM001",
    metadata: {
      analysis_date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      field_area_hectares: data.field_area || 10,
      crop_type: data.crop_type || "wheat",
      crop_name: "Wheat",
      lat: data.center_lat || 28.6139,
      lon: data.center_lng || 77.2090
    },
    statistics: {
      mean: 0.65,
      std: 0.15,
      min: 0.2,
      max: 0.9,
      healthy_percentage: 65,
      stressed_percentage: 35
    },
    ndvi_map: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    stress_map: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
    irrigation_zones: [
      {
        zoneId: "A",
        location: "Northwest",
        stressLevel: "healthy",
        healthScore: 85,
        ndviValue: 0.75,
        soilMoisture: 75,
        irrigationRecommendation: {
          priority: "low",
          action: "maintain",
          percentage: 0,
          waterAmount: "250L/day",
          schedule: ["6:00-8:00 AM"],
          reason: "Optimal conditions"
        }
      },
      {
        zoneId: "B",
        location: "Northeast",
        stressLevel: "moderate",
        healthScore: 55,
        ndviValue: 0.45,
        soilMoisture: 45,
        irrigationRecommendation: {
          priority: "medium",
          action: "increase",
          percentage: 20,
          waterAmount: "400L/day",
          schedule: ["6:00-8:00 AM", "4:00-6:00 PM"],
          reason: "Moderate stress detected"
        }
      },
      {
        zoneId: "C",
        location: "South",
        stressLevel: "high",
        healthScore: 30,
        ndviValue: 0.25,
        soilMoisture: 25,
        irrigationRecommendation: {
          priority: "high",
          action: "increase",
          percentage: 40,
          waterAmount: "600L/day",
          schedule: ["5:00-7:00 AM", "12:00-2:00 PM", "5:00-7:00 PM"],
          reason: "High stress detected"
        }
      }
    ],
    irrigation_schedule: [
      {
        day: "today",
        day_name: "Today",
        date: new Date().toISOString().split('T')[0],
        water_liters: 1200,
        priority: "HIGH"
      },
      {
        day: "tomorrow",
        day_name: "Tomorrow",
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        water_liters: 1000,
        priority: "MEDIUM"
      }
    ],
    irrigation_steps: [
      "Water Zone C (High Stress) - 600L in the morning",
      "Water Zone B (Moderate Stress) - 400L in the afternoon",
      "Maintain Zone A (Healthy) - 250L as scheduled"
    ],
    total_water_liters: 1250,
    water_savings: {
      current_usage: 2500,
      optimized_usage: 1250,
      savings_liters: 1250,
      savings_percentage: 50
    },
    recommendations: [
      {
        id: 1,
        priority: 1,
        urgency: "HIGH",
        zone: "C",
        action: "Increase irrigation by 40%",
        reason: "Critical water stress detected in southern zone",
        impact: "Prevent crop yield loss"
      },
      {
        id: 2,
        priority: 2,
        urgency: "MODERATE",
        zone: "B",
        action: "Increase irrigation by 20%",
        reason: "Moderate stress in northeastern zone",
        impact: "Improve growth conditions"
      },
      {
        id: 3,
        priority: 3,
        urgency: "INFO",
        zone: "A",
        action: "Maintain current schedule",
        reason: "Healthy conditions in northwest zone",
        impact: "No action needed"
      }
    ],
    water_efficiency: {
      current_efficiency: 50,
      potential_efficiency: 85,
      improvement_percentage: 35
    },
    roi_analysis: {
      current_scenario: {
        water_usage_liters: 2500000,
        water_cost: 125000,
        yield_quintal: 450,
        revenue: 2250000
      },
      optimized_scenario: {
        water_usage_liters: 1250000,
        water_cost: 62500,
        yield_quintal: 472.5,
        revenue: 2362500
      },
      savings: {
        water_saved_liters: 1250000,
        water_saved_percentage: 50,
        cost_saved: 62500,
        yield_improvement_percentage: 5,
        yield_increase_quintal: 22.5,
        revenue_increase: 112500,
        total_season_benefit: 175000
      },
      roi: {
        implementation_cost: 5000,
        total_benefit: 175000,
        roi_percentage: 3500,
        payback_months: 0.3
      }
    },
    weather: {
      temperature: 32,
      humidity: 45,
      description: "Clear sky",
      forecast: [
        { day: "Today", temp: 32, condition: "Clear" },
        { day: "Tomorrow", temp: 34, condition: "Sunny" }
      ]
    }
  };
  
  return { data: mockData };
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const analyzeField = async (data) => {
  if (USE_MOCK) {
    return mockFieldAnalysis(data);
  }
  return api.post('/analyze', data);
};

export const quickAnalysis = async (data) => {
  if (USE_MOCK) {
    return mockFieldAnalysis(data);
  }
  return api.post('/quick-analysis', data);
};

export const checkHealth = () => {
  if (USE_MOCK) {
    return Promise.resolve({ data: { status: 'ok', message: 'Service is running' } });
  }
  return api.get('/health');
};

export default api;
