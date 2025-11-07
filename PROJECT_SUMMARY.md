# AquaAdvisor - AI-Powered Water Use Efficiency Advisor

## Project Summary

This project implements a complete web application for analyzing satellite imagery to detect agricultural water stress and provide irrigation recommendations. The application consists of:

### Backend (Python/Flask)
- REST API for field analysis
- Satellite data processing (Sentinel-2, Landsat)
- NDVI calculation and visualization
- Water stress detection algorithms
- Weather data integration (OpenWeatherMap)
- Irrigation recommendation engine
- Sample data generation for demonstration

### Frontend (React/Vite)
- Interactive field boundary selection with Leaflet maps
- Real-time analysis progress visualization
- Comprehensive results dashboard
- NDVI and stress zone visualizations
- Recommendation cards with priority levels
- Water efficiency metrics

### Documentation
- Complete README with setup and usage instructions
- Detailed setup guide for all platforms
- API documentation with examples
- User manual with best practices
- Architecture documentation

### Additional Components
- Jupyter notebook for algorithm demonstration
- Docker configuration for deployment
- Setup scripts for easy installation
- Configuration templates

## File Structure

```
water-efficiency-advisor/
├── backend/                    # Python Flask API
│   ├── app.py                 # Main Flask + endpoints
│   ├── config.py              # Config management
│   ├── satellite_fetch.py     # Sentinel-2 retrieval
│   ├── ndvi_processor.py      # NDVI calculations
│   ├── stress_analyzer.py     # Water stress detection
│   ├── weather_service.py     # Weather API integration
│   ├── recommendation_engine.py # Irrigation advice
│   ├── utils.py               # Helpers
│   ├── requirements.txt
│   └── data/{cache,samples}/
├── frontend/                   # React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── FieldSelector.jsx
│   │   │   ├── AnalysisLoading.jsx
│   │   │   ├── ResultsDashboard.jsx
│   │   │   ├── NDVIVisualization.jsx
│   │   │   ├── StressZoneMap.jsx
│   │   │   ├── RecommendationCards.jsx
│   │   │   └── WaterEfficiency.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── notebooks/demo_analysis.ipynb
├── docs/{README,SETUP_GUIDE,API_DOCUMENTATION,USER_MANUAL,ARCHITECTURE}.md
├── scripts/{start,setup_backend,setup_frontend}.sh
├── .env.example
└── docker-compose.yml
```

## Key Features Implemented

1. **Complete Backend API**:
   - Health check endpoint
   - Full field analysis with satellite data processing
   - Quick analysis using sample data
   - Error handling and validation

2. **Advanced Image Processing**:
   - NDVI calculation from red and NIR bands
   - Gaussian smoothing for noise reduction
   - Statistical analysis of vegetation indices
   - Visualization generation with Matplotlib

3. **Water Stress Detection**:
   - Pixel classification into 4 stress zones
   - Zone statistics and distribution analysis
   - Quadrant-based field analysis
   - Weather-adjusted stress thresholds

4. **Intelligent Recommendations**:
   - Priority-based irrigation advice
   - Urgency levels (Critical, High, Moderate, etc.)
   - Water amount and timing suggestions
   - Cost impact assessment
   - Water savings calculation

5. **Interactive Frontend**:
   - Responsive design with Tailwind CSS
   - Interactive map with drawing tools
   - Real-time analysis progress
   - Comprehensive results dashboard
   - Chart visualizations with Recharts

6. **Documentation**:
   - Complete setup instructions
   - API usage examples
   - User manual with best practices
   - Architecture and design decisions

## Technologies Used

**Backend**: Flask, SentinelSat, Rasterio, NumPy, SciPy, Matplotlib, Requests
**Frontend**: React, Vite, Tailwind CSS, Leaflet, Recharts, Lucide React
**Data**: Sentinel-2, Landsat, OpenWeatherMap
**DevOps**: Docker, Shell scripts

## Deployment Options

1. **Local Development**:
   - Separate backend and frontend servers
   - Hot reloading for development
   - Environment-based configuration

2. **Production Deployment**:
   - Docker containerization
   - docker-compose for multi-service deployment
   - Production-ready configurations

## Next Steps

To run the application:

1. Set up the backend environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Configure API keys in a `.env` file

4. Start both servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   python app.py
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

The application will be available at http://localhost:3000