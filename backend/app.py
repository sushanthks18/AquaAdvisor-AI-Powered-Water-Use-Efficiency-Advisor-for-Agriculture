import os
import sys
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
from config import FLASK_ENV
from crop_database import CropDatabase
from financial_calculator import FinancialCalculator
from models.stress_predictor import StressPredictor
from satellite_fetch import SatelliteFetcher
from ndvi_processor import NDVIProcessor
from stress_analyzer import StressAnalyzer
from weather_service import WeatherService
from recommendation_engine import RecommendationEngine
from utils import calculate_field_area, validate_boundary
# from auth.auth_routes import auth_bp  # Temporarily disabled - needs database setup

app = Flask(__name__)
CORS(app)

# Register blueprints
# app.register_blueprint(auth_bp, url_prefix='/api/auth')  # Temporarily disabled

# Simple mock auth endpoints for demo
@app.route('/api/auth/signup', methods=['POST'])
def mock_signup():
    """Mock signup endpoint for demo purposes"""
    try:
        data = request.get_json()
        return jsonify({
            'message': 'Registration successful! You can now login.',
            'user': {
                'id': 1,
                'full_name': data.get('full_name', 'User'),
                'mobile': data.get('mobile', ''),
                'email': data.get('email', '')
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def mock_login():
    """Mock login endpoint for demo purposes"""
    try:
        data = request.get_json()
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': 1,
                'full_name': 'Demo User',
                'mobile': data.get('mobile', ''),
                'email': 'demo@example.com'
            },
            'access_token': 'demo_access_token_12345',
            'refresh_token': 'demo_refresh_token_67890'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize services
satellite_fetcher = SatelliteFetcher()
ndvi_processor = NDVIProcessor()
stress_analyzer = StressAnalyzer()
weather_service = WeatherService()
recommendation_engine = RecommendationEngine()

# Initialize ML stress predictor and train on startup for faster first request
print("Initializing ML stress predictor...")
stress_predictor = StressPredictor()
if stress_predictor.model is None:
    print("Pre-training ML model for faster responses...")
    import threading
    # Train in background thread to not block startup
    def train_in_background():
        stress_predictor.train_model()
    thread = threading.Thread(target=train_in_background)
    thread.daemon = True
    thread.start()

def get_stress_predictor():
    """Get the stress predictor instance."""
    return stress_predictor

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON response with status information
    """
    services = {
        'satellite_api': False,  # satellite_fetcher.authenticate(),
        'weather_api': bool(os.getenv('OPENWEATHER_API_KEY'))
    }
    
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'services': services
    })

@app.route('/api/crops', methods=['GET'])
def get_crops():
    """
    Get list of available crops.
    
    Returns:
        JSON response with crop list
    """
    crops = CropDatabase.get_all_crops()
    crop_details = {}
    
    for crop_type in crops:
        crop = CropDatabase.get_crop(crop_type)
        crop_details[crop_type] = {
            'name': crop['name'],
            'optimal_ndvi_range': crop['optimal_ndvi_range'],
            'water_need_mm_per_week': crop['water_need_mm_per_week'],
            'stress_tolerance': crop['stress_tolerance']
        }
    
    return jsonify({
        'crops': crops,
        'details': crop_details
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_field():
    """
    Main analysis endpoint.
    
    Expected JSON input:
    {
        "field_boundary": [[lat, lon], ...],
        "analysis_date": "YYYY-MM-DD",
        "use_sample": boolean
    }
    
    Returns:
        JSON response with analysis results
    """
    try:
        # Parse request data
        data = request.get_json()
        field_boundary = data.get('field_boundary')
        analysis_date = data.get('analysis_date')
        use_sample = data.get('use_sample', False)
        crop_type = data.get('crop_type', 'wheat')  # Default to wheat
        
        # Validate input
        if not field_boundary or not validate_boundary(field_boundary):
            return jsonify({'error': 'Invalid field boundary'}), 400
        
        if not analysis_date:
            analysis_date = datetime.now().strftime('%Y-%m-%d')
        
        # Calculate field area
        field_area = calculate_field_area(field_boundary)
        
        # Get field center for weather data
        center_lat = np.mean([point[0] for point in field_boundary])
        center_lon = np.mean([point[1] for point in field_boundary])
        
        # Step 1: Fetch satellite data or use sample
        if use_sample:
            red, nir = satellite_fetcher.load_sample_data(field_boundary, crop_type)
        else:
            # In a real implementation, you would:
            # 1. Convert boundary to bounding box
            # 2. Search for satellite images
            # 3. Download appropriate bands
            # For this demo, we'll use sample data with realistic variation
            red, nir = satellite_fetcher.load_sample_data(field_boundary, crop_type)
        
        # Step 2: Calculate NDVI
        ndvi = ndvi_processor.calculate_ndvi(red, nir)
        smoothed_ndvi = ndvi_processor.smooth_ndvi(ndvi)
        ndvi_stats = ndvi_processor.calculate_statistics(smoothed_ndvi)
        ndvi_map = ndvi_processor.create_ndvi_visualization(smoothed_ndvi)
        
        # Step 3: Get weather data
        weather = weather_service.get_current_weather(center_lat, center_lon)
        
        # Step 4: Detect stress zones
        stress_zones = stress_analyzer.detect_stress_zones(smoothed_ndvi, weather)
        zone_stats = stress_analyzer.calculate_zone_statistics(stress_zones, smoothed_ndvi)
        stress_map = stress_analyzer.create_stress_map(stress_zones)
        quadrant_analysis = stress_analyzer.analyze_quadrants(smoothed_ndvi)
        
        # Calculate water deficit with NDVI context
        water_deficit = weather_service.assess_water_deficit(
            center_lat, center_lon, 
            ndvi_mean=ndvi_stats['mean'],
            zone_stats=zone_stats
        )
        
        # Step 5: Generate recommendations
        recommendations = recommendation_engine.generate_recommendations(
            zone_stats, quadrant_analysis, water_deficit, ndvi_stats['mean'],
            crop_type=crop_type, field_area_ha=field_area
        )
        water_savings = recommendation_engine.calculate_water_savings(
            zone_stats, crop_type=crop_type, field_area_ha=field_area
        )
        
        # Get crop-specific NDVI assessment
        crop_ndvi_assessment = CropDatabase.assess_ndvi_for_crop(crop_type, ndvi_stats['mean'])
        crop_info = CropDatabase.get_crop(crop_type)
        
        # Step 6: Calculate ROI
        roi_analysis = FinancialCalculator.calculate_roi(
            field_area_ha=field_area,
            crop_type=crop_type,
            zone_stats=zone_stats,
            water_rate_per_1000l=50,
            irrigation_method='flood',
            current_irrigation_cycles=10
        )
        
        # Calculate health score (0-100)
        health_score = max(0, min(100, (ndvi_stats['mean'] + 1) * 50))
        
        # Prepare response
        result = {
            'metadata': {
                'timestamp': datetime.now().isoformat(),
                'analysis_date': analysis_date,
                'field_area_hectares': round(field_area, 2),
                'health_score': round(health_score, 1),
                'crop_type': crop_type,
                'crop_name': crop_info['name'] if crop_info else crop_type.title()
            },
            'ndvi_map': ndvi_map,
            'stress_map': stress_map,
            'statistics': ndvi_stats,
            'zone_distribution': zone_stats,
            'quadrant_analysis': quadrant_analysis,
            'weather': weather,
            'water_deficit': water_deficit,
            'recommendations': recommendations,
            'water_efficiency': water_savings,
            'crop_assessment': crop_ndvi_assessment,
            'crop_info': {
                'name': crop_info['name'] if crop_info else crop_type.title(),
                'optimal_ndvi_range': crop_info['optimal_ndvi_range'] if crop_info else [0.5, 0.8],
                'water_need_mm_per_week': crop_info['water_need_mm_per_week'] if crop_info else 40,
                'stress_tolerance': crop_info['stress_tolerance'] if crop_info else 'medium'
            },
            'roi_analysis': roi_analysis
        }
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Analysis failed: {e}")
        return jsonify({'error': 'Analysis failed', 'details': str(e)}), 500

@app.route('/api/quick-analysis', methods=['POST'])
def quick_analysis():
    """
    Lightweight sample-only analysis endpoint.
    
    Expected JSON input:
    {
        "field_boundary": [[lat, lon], ...]
    }
    
    Returns:
        JSON response with quick analysis results
    """
    try:
        # Parse request data
        data = request.get_json()
        field_boundary = data.get('field_boundary')
        crop_type = data.get('crop_type', 'wheat')
        
        # Validate input
        if not field_boundary or not validate_boundary(field_boundary):
            return jsonify({'error': 'Invalid field boundary'}), 400
        
        # Calculate field area
        field_area = calculate_field_area(field_boundary)
        
        # Get field center for weather data
        center_lat = np.mean([point[0] for point in field_boundary])
        center_lon = np.mean([point[1] for point in field_boundary])
        
        # Use sample data for quick analysis
        red, nir = satellite_fetcher.load_sample_data(field_boundary, crop_type)
        
        # Calculate NDVI
        ndvi = ndvi_processor.calculate_ndvi(red, nir)
        smoothed_ndvi = ndvi_processor.smooth_ndvi(ndvi)
        ndvi_stats = ndvi_processor.calculate_statistics(smoothed_ndvi)
        
        # Get weather data
        weather = weather_service.get_current_weather(center_lat, center_lon)
        
        # Detect stress zones
        stress_zones = stress_analyzer.detect_stress_zones(smoothed_ndvi, weather)
        zone_stats = stress_analyzer.calculate_zone_statistics(stress_zones, smoothed_ndvi)
        quadrant_analysis = stress_analyzer.analyze_quadrants(smoothed_ndvi)
        
        # Calculate water deficit with NDVI context
        water_deficit = weather_service.assess_water_deficit(
            center_lat, center_lon,
            ndvi_mean=ndvi_stats['mean'],
            zone_stats=zone_stats
        )
        
        # Generate recommendations
        recommendations = recommendation_engine.generate_recommendations(
            zone_stats, quadrant_analysis, water_deficit, ndvi_stats['mean'],
            crop_type=crop_type, field_area_ha=field_area
        )
        water_savings = recommendation_engine.calculate_water_savings(
            zone_stats, crop_type=crop_type, field_area_ha=field_area
        )
        
        # Calculate health score (0-100)
        health_score = max(0, min(100, (ndvi_stats['mean'] + 1) * 50))
        
        # Prepare response
        result = {
            'metadata': {
                'timestamp': datetime.now().isoformat(),
                'field_area_hectares': round(field_area, 2),
                'health_score': round(health_score, 1),
                'crop_type': crop_type
            },
            'statistics': ndvi_stats,
            'zone_distribution': zone_stats,
            'weather': weather,
            'water_deficit': water_deficit,
            'recommendations': recommendations[:3],  # Only top 3 for quick analysis
            'water_efficiency': water_savings
        }
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Quick analysis failed: {e}")
        return jsonify({'error': 'Quick analysis failed', 'details': str(e)}), 500

@app.route('/api/calculate-roi', methods=['POST'])
def calculate_roi():
    """
    Calculate ROI and cost-benefit analysis.
    
    Expected JSON input:
    {
        "field_area_ha": float,
        "crop_type": str,
        "zone_stats": dict,
        "water_rate_per_1000l": float (optional),
        "irrigation_method": str (optional),
        "irrigation_cycles": int (optional)
    }
    
    Returns:
        JSON response with ROI analysis
    """
    try:
        data = request.get_json()
        field_area_ha = data.get('field_area_ha', 1.0)
        crop_type = data.get('crop_type', 'wheat')
        zone_stats = data.get('zone_stats', {})
        water_rate = data.get('water_rate_per_1000l', 50)
        irrigation_method = data.get('irrigation_method', 'flood')
        irrigation_cycles = data.get('irrigation_cycles', 10)
        
        # Calculate ROI
        roi_analysis = FinancialCalculator.calculate_roi(
            field_area_ha=field_area_ha,
            crop_type=crop_type,
            zone_stats=zone_stats,
            water_rate_per_1000l=water_rate,
            irrigation_method=irrigation_method,
            current_irrigation_cycles=irrigation_cycles
        )
        
        if not roi_analysis:
            return jsonify({'error': 'Invalid crop type'}), 400
        
        return jsonify(roi_analysis)
    
    except Exception as e:
        print(f"ROI calculation failed: {e}")
        return jsonify({'error': 'ROI calculation failed', 'details': str(e)}), 500

@app.route('/api/demo-comparison', methods=['GET'])
def demo_comparison():
    """
    Get pre-loaded demo field comparisons.
    
    Returns:
        JSON response with demo comparison data
    """
    try:
        demos = [
            {
                'id': 'punjab_wheat',
                'name': 'Punjab Wheat Farm',
                'location': 'Punjab, India',
                'field_area_ha': 500,
                'crop_type': 'wheat',
                'comparison': FinancialCalculator.calculate_comparison(500, 'wheat'),
                'annual_savings': 1750000,  # ₹17.5L
                'water_saved_percentage': 35
            },
            {
                'id': 'maharashtra_cotton',
                'name': 'Maharashtra Cotton Farm',
                'location': 'Maharashtra, India',
                'field_area_ha': 200,
                'crop_type': 'cotton',
                'comparison': FinancialCalculator.calculate_comparison(200, 'cotton'),
                'annual_savings': 500000,  # ₹5L
                'water_saved_percentage': 30
            },
            {
                'id': 'tamilnadu_rice',
                'name': 'Tamil Nadu Rice Farm',
                'location': 'Tamil Nadu, India',
                'field_area_ha': 100,
                'crop_type': 'rice',
                'comparison': FinancialCalculator.calculate_comparison(100, 'rice'),
                'annual_savings': 350000,  # ₹3.5L
                'water_saved_percentage': 20
            }
        ]
        
        return jsonify({'demos': demos})
    
    except Exception as e:
        print(f"Demo comparison failed: {e}")
        return jsonify({'error': 'Demo comparison failed', 'details': str(e)}), 500

@app.route('/api/predict-future-stress', methods=['POST'])
def predict_future_stress():
    """
    Predict future water stress using ML model.
    
    Expected JSON input:
    {
        "current_ndvi": float,
        "weather_forecast": [
            {"temp": float, "humidity": float, "rainfall": float}, ...
        ]
    }
    
    Returns:
        JSON response with 7-day stress predictions
    """
    try:
        data = request.get_json()
        current_ndvi = data.get('current_ndvi', 0.5)
        weather_forecast = data.get('weather_forecast', [])
        
        # If no forecast provided, get from weather service
        if not weather_forecast:
            lat = data.get('lat', 28.6139)  # Default Delhi
            lon = data.get('lon', 77.2090)
            
            # Get 7-day forecast from weather service
            # Note: This is a simplified version. In production, use a proper forecast API
            current_weather = weather_service.get_current_weather(lat, lon)
            
            # Create simple forecast based on current weather
            weather_forecast = []
            for day in range(7):
                weather_forecast.append({
                    'temp': current_weather.get('temperature', 25) + np.random.uniform(-3, 3),
                    'humidity': current_weather.get('humidity', 60) + np.random.uniform(-10, 10),
                    'rainfall': max(0, np.random.exponential(scale=5))
                })
        
        # Get predictor and make prediction
        predictor = get_stress_predictor()
        prediction_result = predictor.predict_stress(current_ndvi, weather_forecast)
        
        return jsonify(prediction_result)
    
    except Exception as e:
        print(f"Stress prediction failed: {e}")
        # Fallback prediction
        fallback = {
            'daily_predictions': [],
            'summary': {
                'overall_risk': 'medium',
                'high_stress_days': 0,
                'average_stress_probability': 0.5,
                'recommendation': 'Weather-based prediction unavailable. Monitor field conditions closely.',
                'confidence': 0.5
            },
            'feature_importance': {
                'NDVI': 0.35,
                'Temperature': 0.25,
                'Humidity': 0.20,
                'Rainfall': 0.15,
                'Days Since Rain': 0.05
            }
        }
        return jsonify(fallback)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=(FLASK_ENV == 'development'))