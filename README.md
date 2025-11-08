<img width="1440" height="900" alt="Screenshot 2025-11-07 at 10 24 11 PM" src="https://github.com/user-attachments/assets/b0ccabfc-ae57-4965-990e-e12e4a4be9f7" /># AquaAdvisor: AI-Powered Water Use Efficiency Advisor for Agriculture

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


## Project Snapshots
<img width="1440" height="900" alt="Screenshot 2025-11-07 at 10 24 11 PM" src="https://github.com/user-attachments/assets/02e3299f-97ce-4e87-82a9-9e7d333f703e" />
<img width="1440" height="900" alt="Screenshot 2025-11-07 at 10 54 03 PM" src="https://github.com/user-attachments/assets/b897de01-3f1f-4135-9d4c-125c8fda7526" />
<img width="1440" height="900" alt="Screenshot 2025-11-07 at 10 54 28 PM" src="https://github.com/user-attachments/assets/6d6e9f7a-ebb2-4ce0-94e8-1cf6b8820f8d" />
<img width="1440" height="900" alt="Screenshot 2025-11-07 at 10 54 39 PM" src="https://github.com/user-attachments/assets/1a8f8a0b-81ad-415a-a46e-f31dc3ec7489" />
<img width="1440" height="900" alt="Screenshot 2025-11-07 at 10 55 43 PM" src="https://github.com/user-attachments/assets/f03a4cfe-6323-4ebf-8e32-3c35055150ed" />
<img width="1440" height="900" alt="Screenshot 2025-11-07 at 11 23 29 PM" src="https://github.com/user-attachments/assets/74f44245-212e-42bb-a840-a4521cc95562" />
<img width="1440" height="900" alt="Screenshot 2025-11-07 at 11 25 06 PM" src="https://github.com/user-attachments/assets/dc429ef1-9ba4-4a80-94b1-1ea68e8f64fa" />
<img width="1440" height="900" alt="Screenshot 2025-11-07 at 11 23 49 PM" src="https://github.com/user-attachments/assets/268b9ce4-7fb7-44e1-8327-846454a9903b" />
<img width="1440" height="900" align="center" alt="Screenshot 2025-11-07 at 10 58 24 PM" src="https://github.com/user-attachments/assets/45eb80ad-76c7-4fab-9742-f0cef12fd9b5" />


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
