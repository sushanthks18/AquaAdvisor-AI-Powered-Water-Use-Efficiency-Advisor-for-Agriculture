# AI-Powered Water Use Efficiency Advisor

## Problem
Agricultural irrigation consumes approximately 70% of the world's freshwater, yet much of it is wasted due to inefficient watering practices. Farmers often over-irrigate or under-irrigate crops, leading to reduced yields, water waste, and increased costs.

## Solution
AquaAdvisor is an AI-powered web application that analyzes satellite imagery to detect water stress in agricultural fields and provides actionable irrigation recommendations. By leveraging Sentinel-2 satellite data and machine learning algorithms, farmers can optimize their irrigation schedules to save water, improve crop yields, and reduce operational costs.

## Features
- **Satellite Imagery Analysis**: Processes Sentinel-2 and Landsat satellite data to assess vegetation health
- **Water Stress Detection**: Identifies areas of water stress using NDVI (Normalized Difference Vegetation Index) analysis
- **Actionable Recommendations**: Provides prioritized irrigation advice based on field conditions
- **Weather Integration**: Incorporates weather data for more accurate recommendations
- **Water Savings Calculation**: Estimates potential water savings through optimized irrigation
- **Interactive Maps**: Visualizes stress zones and NDVI data on interactive field maps
- **No Hardware Required**: Works entirely with satellite data - no sensors needed in the field

## Tech Stack
### Backend
- Flask 2.3.3
- SentinelSat 1.2.1
- Rasterio 1.3.8
- NumPy 1.24.3
- Matplotlib 3.7.2
- OpenWeatherMap API

### Frontend
- React 18.2.0
- Vite 4.4.9
- Tailwind CSS 3.3.3
- Leaflet 1.9.4
- Recharts 2.8.0
- Lucide React 0.263.1

## Quick Start
1. Clone the repository
2. Set up the backend environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```
4. Configure environment variables (see SETUP_GUIDE.md)
5. Start the backend:
   ```bash
   python app.py
   ```
6. Start the frontend:
   ```bash
   npm run dev
   ```
7. Open http://localhost:3000 in your browser

## How It Works
1. **Field Selection**: Users draw or upload their field boundaries on an interactive map
2. **Satellite Data Retrieval**: The system fetches recent Sentinel-2 imagery for the selected area
3. **NDVI Calculation**: Vegetation health is assessed using the NDVI formula: (NIR-Red)/(NIR+Red)
4. **Stress Zone Detection**: Pixels are classified into 4 stress categories based on NDVI thresholds
5. **Weather Analysis**: Current and forecasted weather data is retrieved to adjust recommendations
6. **Recommendation Generation**: Actionable irrigation advice is generated based on stress zones and weather
7. **Visualization**: Results are displayed through interactive maps and charts

## API Setup
1. Obtain Sentinel Hub credentials from https://scihub.copernicus.eu/
2. Get an OpenWeatherMap API key from https://openweathermap.org/api
3. Create a `.env` file in the backend directory with your credentials:
   ```
   SENTINEL_USERNAME=your_username
   SENTINEL_PASSWORD=your_password
   OPENWEATHER_API_KEY=your_key
   ```

## Usage
### Web Interface
1. Navigate to the application in your browser
2. Select "Get Started" to begin field analysis
3. Draw your field boundaries on the map or use the sample field
4. Choose between Quick Analysis (faster, limited results) or Full Analysis
5. Review the results including stress maps, recommendations, and water savings

### API Endpoints
- `GET /api/health` - System health check
- `POST /api/analyze` - Full field analysis
- `POST /api/quick-analysis` - Lightweight field analysis

## Data Sources & Limitations
### Data Sources
- **Sentinel-2**: 10m resolution, 5-day revisit cycle, free access
- **Landsat 8/9**: 30m resolution, 16-day revisit cycle, free access
- **OpenWeatherMap**: Weather data and forecasts

### Limitations
- Cloud cover can affect satellite imagery quality
- Recommendations are based on vegetation indices, not direct soil moisture measurements
- Weather forecasts have inherent uncertainty

## Scientific Background
The application is based on the principle that water-stressed vegetation reflects light differently than healthy vegetation. The NDVI (Normalized Difference Vegetation Index) is calculated using near-infrared (NIR) and red light reflectance:

NDVI = (NIR - Red) / (NIR + Red)

Values range from -1 to 1:
- -1 to 0: Water, bare soil, or dead vegetation
- 0 to 0.3: Sparse vegetation or water stress
- 0.3 to 0.6: Moderate vegetation
- 0.6 to 1: Dense, healthy vegetation

## Future Enhancements
- Integration with IoT soil moisture sensors
- Machine learning models for yield prediction
- Mobile application for field use
- Support for additional satellite data sources
- Advanced irrigation scheduling algorithms
- Multi-language support

## License
This project is licensed under the MIT License - see the LICENSE file for details.