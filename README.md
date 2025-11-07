# AquaAdvisor: AI-Powered Water Use Efficiency Advisor for Agriculture

## 🌾 Problem
Agricultural irrigation consumes approximately 70% of the world's freshwater, yet much of it is wasted due to inefficient watering practices. Farmers often over-irrigate or under-irrigate crops, leading to reduced yields, water waste, and increased costs.

## 💡 Solution
AquaAdvisor is an AI-powered web application that analyzes satellite imagery to detect water stress in agricultural fields and provides actionable irrigation recommendations. By leveraging Sentinel-2 satellite data and machine learning algorithms, farmers can optimize their irrigation schedules to save water, improve crop yields, and reduce operational costs.

## 🚀 Key Features
- **Satellite Imagery Analysis**: Processes Sentinel-2 and Landsat satellite data to assess vegetation health
- **Water Stress Detection**: Identifies areas of water stress using NDVI (Normalized Difference Vegetation Index) analysis
- **Actionable Recommendations**: Provides prioritized irrigation advice based on field conditions
- **Weather Integration**: Incorporates weather data for more accurate recommendations
- **Water Savings Calculation**: Estimates potential water savings through optimized irrigation
- **Interactive Maps**: Visualizes stress zones and NDVI data on interactive field maps
- **No Hardware Required**: Works entirely with satellite data - no sensors needed in the field
- **Multi-language Support**: Available in English, Hindi, and Tamil

## 🛠 Tech Stack
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

## 📖 Documentation
For detailed information, please refer to the documentation in the [docs](docs/) directory:
- [Setup Guide](docs/SETUP_GUIDE.md)
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Architecture](docs/ARCHITECTURE.md)
- [User Manual](docs/USER_MANUAL.md)

## 🚀 Quick Start
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

## 🌐 Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5002
- **Test Credentials**: Mobile: 9999888877, Password: test123

## 📊 How It Works
1. **Field Selection**: Users draw or upload their field boundaries on an interactive map
2. **Satellite Data Retrieval**: The system fetches recent Sentinel-2 imagery for the selected area
3. **NDVI Calculation**: Vegetation health is assessed using the NDVI formula: (NIR-Red)/(NIR+Red)
4. **Stress Zone Detection**: Pixels are classified into 4 stress categories based on NDVI thresholds
5. **Weather Analysis**: Current and forecasted weather data is retrieved to adjust recommendations
6. **Recommendation Generation**: Actionable irrigation advice is generated based on stress zones and weather
7. **Visualization**: Results are displayed through interactive maps and charts

## 📈 Scientific Background
The application is based on the principle that water-stressed vegetation reflects light differently than healthy vegetation. The NDVI (Normalized Difference Vegetation Index) is calculated using near-infrared (NIR) and red light reflectance:

**NDVI = (NIR - Red) / (NIR + Red)**

Values range from -1 to 1:
- -1 to 0: Water, bare soil, or dead vegetation
- 0 to 0.3: Sparse vegetation or water stress
- 0.3 to 0.6: Moderate vegetation
- 0.6 to 1: Dense, healthy vegetation

## 📞 Contact
For questions or support, please open an issue on GitHub.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
