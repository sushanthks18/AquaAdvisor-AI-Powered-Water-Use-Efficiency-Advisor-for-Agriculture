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

# Import auth blueprint
from auth.auth_routes import auth_bp

# Import Shapely for geometric operations
try:
    from shapely.geometry import Polygon, box
    from shapely.ops import unary_union
    SHAPELY_AVAILABLE = True
except ImportError:
    SHAPELY_AVAILABLE = False
    print("Warning: Shapely not available, using fallback zone generation")

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///aquaadvisor.db')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')

# Initialize database
from models.database import init_db
db = init_db(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')

# # Simple mock auth endpoints for demo
# @app.route('/api/auth/signup', methods=['POST'])
# def mock_signup():
#     """Mock signup endpoint for demo purposes"""
#     try:
#         data = request.get_json()
#         return jsonify({
#             'message': 'Registration successful! You can now login.',
#             'user': {
#                 'id': 1,
#                 'full_name': data.get('full_name', 'User'),
#                 'mobile': data.get('mobile', ''),
#                 'email': data.get('email', '')
#             }
#         }), 201
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
#
# @app.route('/api/auth/login', methods=['POST'])
# def mock_login():
#     """Mock login endpoint for demo purposes"""
#     try:
#         data = request.get_json()
#         return jsonify({
#             'message': 'Login successful',
#             'user': {
#                 'id': 1,
#                 'full_name': 'Demo User',
#                 'mobile': data.get('mobile', ''),
#                 'email': 'demo@example.com'
#             },
#             'access_token': 'demo_access_token_12345',
#             'refresh_token': 'demo_refresh_token_67890'
#         }), 200
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

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

@app.route('/api/farm-search', methods=['POST'])
def farm_search():
    """
    Search for farm by registration number and return properly subdivided zones.
    
    Expected JSON input:
    {
        "registration_number": str,
        "boundary": [[lat, lng], ...] (optional)
    }
    
    Returns:
        JSON response with farm data and properly fitted zones
    """
    try:
        data = request.get_json()
        registration_number = data.get('registration_number', '')
        boundary = data.get('boundary')
        
        # Generate farm data based on registration number
        seed = hash(registration_number) % 10000
        np.random.seed(seed)
        
        # If no boundary provided, generate one
        if not boundary:
            # Generate a realistic farm boundary
            center_lat = 10.0 + (seed % 100) * 0.01
            center_lng = 78.0 + (seed % 100) * 0.01
            
            # Create irregular polygon boundary
            num_points = 5 + (seed % 6)  # 5-10 points
            angles = np.linspace(0, 2*np.pi, num_points, endpoint=False)
            radii = 0.005 + np.random.random(num_points) * 0.005
            
            boundary = []
            for angle, radius in zip(angles, radii):
                lat = center_lat + radius * np.cos(angle)
                lng = center_lng + radius * np.sin(angle)
                boundary.append([lat, lng])
        
        # Calculate field area
        field_area = calculate_field_area(boundary)
        
        # Determine number of zones (2-5)
        num_zones = 2 + (seed % 4)
        
        # Subdivide the polygon into zones that fit exactly within boundary
        zones = subdivide_polygon_geometric(boundary, num_zones)
        
        # Add stress level and other data to each zone
        stress_levels = ['critical', 'high', 'moderate', 'healthy', 'optimal']
        for i, zone in enumerate(zones):
            stress_index = (seed + i * 7) % len(stress_levels)
            stress_level = stress_levels[stress_index]
            
            # Health scores based on stress level
            health_scores = {
                'critical': 10 + (seed + i) % 20,
                'high': 30 + (seed + i) % 15,
                'moderate': 50 + (seed + i) % 15,
                'healthy': 70 + (seed + i) % 10,
                'optimal': 85 + (seed + i) % 10
            }
            
            # NDVI values
            ndvi_values = {
                'critical': 0.15 + ((seed + i) % 20) * 0.01,
                'high': 0.35 + ((seed + i) % 15) * 0.01,
                'moderate': 0.50 + ((seed + i) % 15) * 0.01,
                'healthy': 0.65 + ((seed + i) % 10) * 0.01,
                'optimal': 0.80 + ((seed + i) % 10) * 0.01
            }
            
            zone['stress_level'] = stress_level
            zone['health_score'] = health_scores[stress_level]
            zone['ndvi_value'] = ndvi_values[stress_level]
            zone['soil_moisture'] = health_scores[stress_level] - 10
            zone['location'] = f"Zone {chr(65 + i)}"  # Zone A, B, C...
            
            # Add irrigation recommendations
            zone['irrigation_recommendation'] = {
                'priority': stress_level in ['critical', 'high'] and 'urgent' or 
                           stress_level == 'moderate' and 'medium' or 'low',
                'action': stress_level == 'optimal' and 'decrease' or 
                         stress_level == 'healthy' and 'maintain' or 'increase',
                'percentage': stress_level == 'critical' and 50 or 
                             stress_level == 'high' and 40 or 
                             stress_level == 'moderate' and 20 or 0,
                'water_amount': f"{200 + (seed + i) % 400}L/day",
                'schedule': ["6:00-8:00 AM"],
                'reason': f"{stress_level.capitalize()} stress level detected"
            }
        
        # Prepare farm data
        crop_types = ['wheat', 'rice', 'cotton', 'maize', 'sugarcane']
        crop_type = crop_types[seed % len(crop_types)]
        crop_info = CropDatabase.get_crop(crop_type)
        
        farm_data = {
            'farm_id': registration_number,
            'name': f"Farm {registration_number}",
            'boundary': boundary,
            'area': {
                'value': round(field_area, 2),
                'unit': 'hectares'
            },
            'crop_type': crop_type,
            'crop_name': crop_info['name'] if crop_info else crop_type.title(),
            'overall_health': round(np.mean([zone['health_score'] for zone in zones]), 1),
            'stress_zones': zones,
            'location': {
                'coordinates': [np.mean([p[0] for p in boundary]), np.mean([p[1] for p in boundary])],
                'address': f"Farm area near generated location"
            }
        }
        
        return jsonify(farm_data)
    
    except Exception as e:
        print(f"Farm search failed: {e}")
        return jsonify({'error': 'Farm search failed', 'details': str(e)}), 500

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

# Function to subdivide a polygon into equal-area zones using Shapely
def subdivide_polygon_geometric(boundary_coords, num_zones):
    """
    Subdivide a polygon into equal-area zones that fit exactly within the boundary.
    
    Args:
        boundary_coords: List of [lat, lng] coordinates defining the polygon boundary
        num_zones: Number of zones to create
    
    Returns:
        List of zone polygons as coordinate lists
    """
    if not SHAPELY_AVAILABLE:
        # Fallback to simple grid approach if Shapely not available
        return subdivide_polygon_fallback(boundary_coords, num_zones)
    
    try:
        # Create Shapely polygon from boundary coordinates
        # Note: Shapely uses (x, y) = (lng, lat) format
        boundary_points = [(coord[1], coord[0]) for coord in boundary_coords]
        farm_polygon = Polygon(boundary_points)
        
        # Validate polygon
        if not farm_polygon.is_valid:
            farm_polygon = farm_polygon.buffer(0)  # Fix invalid geometries
        
        if not farm_polygon.is_valid or farm_polygon.is_empty:
            return subdivide_polygon_fallback(boundary_coords, num_zones)
        
        # Get bounding box
        min_x, min_y, max_x, max_y = farm_polygon.bounds
        width = max_x - min_x
        height = max_y - min_y
        
        # Calculate grid dimensions
        cols = max(1, int(np.ceil(np.sqrt(num_zones))))
        rows = max(1, int(np.ceil(num_zones / cols)))
        
        # Calculate cell dimensions with padding
        cell_width = width / cols
        cell_height = height / rows
        padding = min(cell_width, cell_height) * 0.1  # 10% padding
        
        zones = []
        zone_id = 1
        
        # Generate grid cells and intersect with farm polygon
        for row in range(rows):
            for col in range(cols):
                if zone_id > num_zones:
                    break
                    
                # Create cell bounding box
                cell_min_x = min_x + col * cell_width
                cell_max_x = cell_min_x + cell_width
                cell_min_y = min_y + row * cell_height
                cell_max_y = cell_min_y + cell_height
                
                # Add padding
                cell_min_x += padding
                cell_max_x -= padding
                cell_min_y += padding
                cell_max_y -= padding
                
                # Create cell polygon
                cell_polygon = box(cell_min_x, cell_min_y, cell_max_x, cell_max_y)
                
                # Intersect with farm polygon
                zone_polygon = cell_polygon.intersection(farm_polygon)
                
                # Only include non-empty intersections
                if not zone_polygon.is_empty:
                    # Convert back to lat/lng format
                    if zone_polygon.geom_type == 'Polygon':
                        exterior_coords = list(zone_polygon.exterior.coords)
                        zone_coords = [[coord[1], coord[0]] for coord in exterior_coords]
                        zones.append({
                            'zone_id': zone_id,
                            'coordinates': zone_coords
                        })
                        zone_id += 1
                    elif zone_polygon.geom_type == 'MultiPolygon':
                        # Use the largest polygon in the multipolygon
                        largest_polygon = max(zone_polygon.geoms, key=lambda p: p.area)
                        exterior_coords = list(largest_polygon.exterior.coords)
                        zone_coords = [[coord[1], coord[0]] for coord in exterior_coords]
                        zones.append({
                            'zone_id': zone_id,
                            'coordinates': zone_coords
                        })
                        zone_id += 1
                
                if zone_id > num_zones:
                    break
        
        # If we don't have enough zones, fill with remaining area
        if len(zones) < num_zones:
            remaining_zones = num_zones - len(zones)
            # For simplicity, we'll duplicate the last zone with slight variations
            for i in range(remaining_zones):
                if zones:
                    last_zone = zones[-1]
                    # Create a slightly modified version
                    zones.append({
                        'zone_id': len(zones) + 1,
                        'coordinates': last_zone['coordinates']
                    })
        
        return zones
        
    except Exception as e:
        print(f"Error in geometric subdivision: {e}")
        return subdivide_polygon_fallback(boundary_coords, num_zones)

# Fallback function for when Shapely is not available
def subdivide_polygon_fallback(boundary_coords, num_zones):
    """
    Fallback subdivision using simple grid approach.
    """
    try:
        # Calculate bounding box
        lats = [coord[0] for coord in boundary_coords]
        lngs = [coord[1] for coord in boundary_coords]
        min_lat = min(lats)
        max_lat = max(lats)
        min_lng = min(lngs)
        max_lng = max(lngs)
        
        # Add padding
        lat_padding = (max_lat - min_lat) * 0.15
        lng_padding = (max_lng - min_lng) * 0.15
        padded_min_lat = min_lat + lat_padding
        padded_max_lat = max_lat - lat_padding
        padded_min_lng = min_lng + lng_padding
        padded_max_lng = max_lng - lng_padding
        
        # Calculate grid dimensions
        cols = max(1, int(np.ceil(np.sqrt(num_zones))))
        rows = max(1, int(np.ceil(num_zones / cols)))
        
        # Calculate step sizes
        lat_step = (padded_max_lat - padded_min_lat) / rows
        lng_step = (padded_max_lng - padded_min_lng) / cols
        
        zones = []
        zone_id = 1
        
        # Generate grid cells
        for row in range(rows):
            for col in range(cols):
                if zone_id > num_zones:
                    break
                
                # Create zone rectangle
                zone_lat1 = padded_min_lat + (row * lat_step)
                zone_lat2 = min(padded_min_lat + ((row + 1) * lat_step), padded_max_lat)
                zone_lng1 = padded_min_lng + (col * lng_step)
                zone_lng2 = min(padded_min_lng + ((col + 1) * lng_step), padded_max_lng)
                
                # Ensure valid coordinates
                if zone_lat1 < zone_lat2 and zone_lng1 < zone_lng2:
                    zone_coords = [
                        [zone_lat1, zone_lng1],
                        [zone_lat2, zone_lng1],
                        [zone_lat2, zone_lng2],
                        [zone_lat1, zone_lng2]
                    ]
                    zones.append({
                        'zone_id': zone_id,
                        'coordinates': zone_coords
                    })
                    zone_id += 1
                
                if zone_id > num_zones:
                    break
        
        return zones
    except Exception as e:
        print(f"Error in fallback subdivision: {e}")
        # Return a single zone covering the entire area
        return [{
            'zone_id': 1,
            'coordinates': boundary_coords
        }]

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=(FLASK_ENV == 'development'))