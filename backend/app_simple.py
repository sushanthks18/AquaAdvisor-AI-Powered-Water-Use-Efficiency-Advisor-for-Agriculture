import os
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
from config import FLASK_ENV

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///aquaadvisor.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')

# Initialize database
from models.database import init_db
db = init_db(app)

# Import and register blueprints
from auth.auth_routes import auth_bp
from farms.farm_routes import farms_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(farms_bp, url_prefix='/api/farms')

# Import middleware
from middleware.auth_middleware import token_required

# Import satellite services
from satellite.satellite_service import SatelliteDataService
from satellite.ndvi_visualizer import NDVIVisualizer
from satellite.irrigation_zones import generate_irrigation_zones, create_zone_geojson
from satellite.land_validator import validate_farm_location, classify_land_use

# Initialize services
satellite_service = SatelliteDataService()
ndvi_visualizer = NDVIVisualizer()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'services': {
            'satellite_api': True,
            'weather_api': True
        }
    })

@app.route('/api/analyze', methods=['POST'])
@token_required
def analyze_field(current_user):
    """Main analysis endpoint (protected) - NOW WITH REAL SATELLITE DATA."""
    try:
        # Parse request data
        data = request.get_json()
        field_boundary = data.get('field_boundary')
        analysis_date = data.get('analysis_date')
        include_historical = data.get('include_historical', True)
        days_back = data.get('days_back', 30)
        
        if not field_boundary:
            return jsonify({'error': 'Field boundary is required'}), 400
        
        # Calculate field center for satellite data
        lats = [coord[0] for coord in field_boundary]
        lons = [coord[1] for coord in field_boundary]
        center_lat = sum(lats) / len(lats)
        center_lon = sum(lons) / len(lons)
        
        # Fetch REAL satellite NDVI data from NASA POWER
        if not analysis_date:
            end_date = datetime.now()
        else:
            end_date = datetime.strptime(analysis_date, '%Y-%m-%d')
        
        start_date = end_date - timedelta(days=days_back)
        
        # Fetch real NDVI time series
        ndvi_data = satellite_service.fetch_ndvi_data(
            center_lat, center_lon,
            start_date.strftime('%Y%m%d'),
            end_date.strftime('%Y%m%d')
        )
        
        # Generate NDVI field for the farm
        ndvi_field = satellite_service.generate_ndvi_field(
            center_lat, center_lon,
            field_boundary,
            ndvi_data['current_ndvi']
        )
        
        # Calculate field area first (needed for irrigation zones)
        from satellite.land_validator import calculate_polygon_area
        field_area = calculate_polygon_area(field_boundary)
        
        # CRITICAL: Validate farm location (ensure it's agricultural land, NOT buildings/urban)
        is_valid, validation_msg = validate_farm_location(field_boundary, None)  # Pre-validation without NDVI
        
        # If location appears invalid before NDVI check, warn user
        if not is_valid:
            print(f"⚠️ WARNING: {validation_msg}")
        
        # Fetch REAL satellite NDVI data from NASA POWER
        if not analysis_date:
            end_date = datetime.now()
        else:
            end_date = datetime.strptime(analysis_date, '%Y-%m-%d')
        
        start_date = end_date - timedelta(days=days_back)
        
        # Fetch real NDVI time series
        ndvi_data = satellite_service.fetch_ndvi_data(
            center_lat, center_lon,
            start_date.strftime('%Y%m%d'),
            end_date.strftime('%Y%m%d')
        )
        
        # VALIDATE with actual NDVI data - ensure agricultural land
        is_valid, validation_msg = validate_farm_location(field_boundary, ndvi_data)
        land_use_type = classify_land_use(field_boundary, ndvi_data['current_ndvi'])
        
        # In demo mode, allow analysis to proceed but warn about low NDVI
        # In production, reject clearly urban areas (NDVI < 0.05)
        if ndvi_data['current_ndvi'] < 0.05:
            # For demo purposes, still proceed but with strong warning
            validation_msg = f"⚠️ Very low vegetation detected (NDVI: {ndvi_data['current_ndvi']:.2f}). Results may be less accurate."
            land_use_type = 'sparse_vegetation'  # Override classification
        elif ndvi_data['current_ndvi'] < 0.2:
            validation_msg = f"Low vegetation detected (NDVI: {ndvi_data['current_ndvi']:.2f}). May be fallow/bare farmland."
        else:
            validation_msg = "Agricultural land validated"
        
        # Calculate stress zones
        zones, zone_stats = satellite_service.calculate_stress_zones(ndvi_field)
        
        # NEW: Generate detailed irrigation zones with bilingual instructions
        irrigation_zone_details = generate_irrigation_zones(
            ndvi_field, zones, field_boundary, field_area
        )
        
        # Generate zone GeoJSON for map overlay
        zone_geojson = create_zone_geojson(zones, field_boundary)
        
        # Generate visualizations
        ndvi_map_base64 = ndvi_visualizer.create_ndvi_heatmap(ndvi_field)
        stress_map_base64 = ndvi_visualizer.create_stress_zone_map(zones, zone_stats)
        
        # Generate trend chart if historical data requested
        trend_chart_base64 = None
        if include_historical and len(ndvi_data['time_series']) > 0:
            trend_chart_base64 = ndvi_visualizer.create_trend_chart(ndvi_data['time_series'])
        
        # Generate GeoJSON
        ndvi_geojson = ndvi_visualizer.generate_geojson(field_boundary, ndvi_field, zones)
        
        # Calculate field statistics
        stats = {
            'mean': float(np.mean(ndvi_field)),
            'median': float(np.median(ndvi_field)),
            'std': float(np.std(ndvi_field)),
            'min': float(np.min(ndvi_field)),
            'max': float(np.max(ndvi_field)),
            'p25': float(np.percentile(ndvi_field, 25)),
            'p75': float(np.percentile(ndvi_field, 75))
        }
        
        # Format zone distribution for frontend
        zone_distribution = {
            'Critical': {
                'percentage': zone_stats['critical']['percentage'],
                'mean_ndvi': zone_stats['critical']['mean_ndvi'],
                'color': 'red'
            },
            'High': {
                'percentage': zone_stats['high']['percentage'],
                'mean_ndvi': zone_stats['high']['mean_ndvi'],
                'color': 'orange'
            },
            'Moderate': {
                'percentage': zone_stats['moderate']['percentage'],
                'mean_ndvi': zone_stats['moderate']['mean_ndvi'],
                'color': 'yellow'
            },
            'Healthy': {
                'percentage': zone_stats['healthy']['percentage'],
                'mean_ndvi': zone_stats['healthy']['mean_ndvi'],
                'color': 'green'
            }
        }
        
        # Sample quadrant analysis (enhanced with real data)
        quadrant_analysis = {
            'NW': {
                'mean_ndvi': float(np.mean(ndvi_field[:50, :50])),
                'stressed_percentage': float(np.sum(zones[:50, :50] < 2) / 2500 * 100)
            },
            'NE': {
                'mean_ndvi': float(np.mean(ndvi_field[:50, 50:])),
                'stressed_percentage': float(np.sum(zones[:50, 50:] < 2) / 2500 * 100)
            },
            'SW': {
                'mean_ndvi': float(np.mean(ndvi_field[50:, :50])),
                'stressed_percentage': float(np.sum(zones[50:, :50] < 2) / 2500 * 100)
            },
            'SE': {
                'mean_ndvi': float(np.mean(ndvi_field[50:, 50:])),
                'stressed_percentage': float(np.sum(zones[50:, 50:] < 2) / 2500 * 100)
            }
        }
        
        # Sample weather data (can be enhanced with real API)
        weather = {
            'temperature': round(np.random.uniform(20, 35), 1),
            'humidity': round(np.random.uniform(40, 80)),
            'description': 'Clear sky',
            'wind_speed': round(np.random.uniform(2, 10), 1),
            'wind_direction': round(np.random.uniform(0, 360))
        }
        
        # Calculate water deficit based on NDVI
        avg_ndvi = stats['mean']
        if avg_ndvi < 0.3:
            deficit_status = 'High'
            deficit_mm = round(np.random.uniform(30, 50), 1)
        elif avg_ndvi < 0.5:
            deficit_status = 'Moderate'
            deficit_mm = round(np.random.uniform(15, 30), 1)
        else:
            deficit_status = 'Low'
            deficit_mm = round(np.random.uniform(5, 15), 1)
        
        water_deficit = {
            'deficit_mm': deficit_mm,
            'status': deficit_status,
            'et0_weekly': round(np.random.uniform(20, 60), 1),
            'rainfall': round(np.random.uniform(0, 30), 1)
        }
        
        # Generate recommendations based on REAL stress zones
        recommendations = []
        
        if zone_stats['critical']['percentage'] > 5:
            recommendations.append({
                'priority': 1,
                'urgency': 'HIGH',
                'zone': 'Critical',
                'action': 'Immediate irrigation required in critical zones',
                'reason': f'{zone_stats["critical"]["percentage"]:.1f}% of field in critical stress (NDVI < 0.2)',
                'water_amount': '40-50mm within 24 hours',
                'timing': 'Immediate',
                'cost_impact': 'High'
            })
        
        if zone_stats['high']['percentage'] > 10:
            recommendations.append({
                'priority': 2,
                'urgency': 'MODERATE',
                'zone': 'High',
                'action': 'Increase irrigation in high stress areas',
                'reason': f'{zone_stats["high"]["percentage"]:.1f}% of field in high stress (NDVI 0.2-0.4)',
                'water_amount': '25-35mm within 48 hours',
                'timing': 'Within 2 days',
                'cost_impact': 'Medium'
            })
        
        if zone_stats['moderate']['percentage'] > 20:
            recommendations.append({
                'priority': 3,
                'urgency': 'INFO',
                'zone': 'Moderate',
                'action': 'Monitor moderate stress zones',
                'reason': f'{zone_stats["moderate"]["percentage"]:.1f}% of field in moderate stress',
                'water_amount': '15-25mm weekly',
                'timing': 'Continue regular schedule',
                'cost_impact': 'Low'
            })
        
        if zone_stats['healthy']['percentage'] > 30:
            recommendations.append({
                'priority': 4,
                'urgency': 'INFO',
                'zone': 'Field-wide',
                'action': 'Maintain current irrigation in healthy zones',
                'reason': f'{zone_stats["healthy"]["percentage"]:.1f}% of field is healthy (NDVI > 0.6)',
                'water_amount': 'No change needed',
                'timing': 'Continue monitoring',
                'cost_impact': 'None'
            })
        
        # Calculate potential water savings
        water_efficiency = {
            'savings_percentage': round(zone_stats['healthy']['percentage'] * 0.4, 1),
            'savings_mm': round(zone_stats['healthy']['percentage'] * 0.4 * 0.5, 1),
            'explanation': f'Potential savings by reducing irrigation in {zone_stats["healthy"]["percentage"]:.1f}% healthy areas'
        }
        
        # Calculate health score from NDVI
        health_score = max(0, min(100, (stats['mean'] + 1) * 50))
        
        # Prepare response
        result = {
            'metadata': {
                'timestamp': datetime.now().isoformat(),
                'analysis_date': end_date.strftime('%Y-%m-%d'),
                'field_area_hectares': field_area,
                'field_area_acres': round(field_area * 2.47105, 2),
                'health_score': round(health_score, 1),
                'data_source': ndvi_data['source'],
                'is_demo': ndvi_data.get('is_demo', False),
                'land_use': land_use_type,
                'is_agricultural': is_valid,
                'validation_message': validation_msg
            },
            'ndvi_map': f'data:image/png;base64,{ndvi_map_base64}',
            'stress_map': f'data:image/png;base64,{stress_map_base64}',
            'trend_chart': f'data:image/png;base64,{trend_chart_base64}' if trend_chart_base64 else None,
            'ndvi_geojson': ndvi_geojson,
            'zone_geojson': zone_geojson,
            'statistics': stats,
            'zone_distribution': zone_distribution,
            'quadrant_analysis': quadrant_analysis,
            'weather': weather,
            'water_deficit': water_deficit,
            'recommendations': recommendations,
            'water_efficiency': water_efficiency,
            'historical_trend': ndvi_data['time_series'] if include_historical else None,
            # NEW: Detailed irrigation zones with bilingual instructions
            'irrigation_zones': irrigation_zone_details['zones'],
            'irrigation_schedule': irrigation_zone_details['irrigation_schedule'],
            'irrigation_steps': irrigation_zone_details['irrigation_steps'],
            'total_water_liters': irrigation_zone_details['total_water_liters'],
            'water_savings': irrigation_zone_details['water_savings']
        }
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Analysis failed', 'details': str(e)}), 500

@app.route('/api/quick-analysis', methods=['POST'])
@token_required
def quick_analysis(current_user):
    """Lightweight sample-only analysis endpoint (protected)."""
    try:
        # Parse request data
        data = request.get_json()
        field_boundary = data.get('field_boundary')
        
        if not field_boundary:
            return jsonify({'error': 'Field boundary is required'}), 400
        
        # Sample statistics
        stats = {
            'mean': round(np.random.uniform(0.2, 0.8), 3),
            'median': round(np.random.uniform(0.2, 0.8), 3),
            'std': round(np.random.uniform(0.1, 0.3), 3),
            'min': round(np.random.uniform(-0.2, 0.4), 3),
            'max': round(np.random.uniform(0.6, 1.0), 3),
            'p25': round(np.random.uniform(0.1, 0.5), 3),
            'p75': round(np.random.uniform(0.5, 0.9), 3)
        }
        
        # Sample zone distribution
        zone_stats = {
            'Critical': {
                'percentage': round(np.random.uniform(5, 20), 1),
                'mean_ndvi': round(np.random.uniform(0.0, 0.3), 3),
                'color': 'red'
            },
            'High': {
                'percentage': round(np.random.uniform(10, 30), 1),
                'mean_ndvi': round(np.random.uniform(0.3, 0.5), 3),
                'color': 'orange'
            },
            'Moderate': {
                'percentage': round(np.random.uniform(20, 40), 1),
                'mean_ndvi': round(np.random.uniform(0.5, 0.6), 3),
                'color': 'yellow'
            },
            'Healthy': {
                'percentage': round(np.random.uniform(20, 50), 1),
                'mean_ndvi': round(np.random.uniform(0.6, 0.9), 3),
                'color': 'green'
            }
        }
        
        # Sample weather data
        weather = {
            'temperature': round(np.random.uniform(20, 35), 1),
            'humidity': round(np.random.uniform(40, 80)),
            'description': 'Clear sky',
            'wind_speed': round(np.random.uniform(2, 10), 1),
            'wind_direction': round(np.random.uniform(0, 360))
        }
        
        # Sample water deficit
        water_deficit = {
            'deficit_mm': round(np.random.uniform(5, 50), 1),
            'status': np.random.choice(['High', 'Moderate', 'Low']),
            'et0_weekly': round(np.random.uniform(20, 60), 1),
            'rainfall': round(np.random.uniform(0, 30), 1)
        }
        
        # Sample recommendations (limited)
        recommendations = [
            {
                'priority': 1,
                'urgency': 'HIGH',
                'zone': 'Critical',
                'action': 'Increase irrigation in critical zones',
                'reason': '25% of field in critical stress',
                'water_amount': '30-40% increase',
                'timing': 'Within 48 hours',
                'cost_impact': 'Medium'
            }
        ]
        
        # Sample water efficiency
        water_efficiency = {
            'savings_percentage': round(np.random.uniform(15, 35), 1),
            'savings_mm': round(np.random.uniform(10, 30), 1),
            'explanation': 'Potential water savings based on 40% healthy vegetation'
        }
        
        # Calculate field area (simplified)
        field_area = round(np.random.uniform(5, 50), 2)
        
        # Calculate health score
        health_score = max(0, min(100, (stats['mean'] + 1) * 50))
        
        # Prepare response
        result = {
            'metadata': {
                'timestamp': datetime.now().isoformat(),
                'field_area_hectares': field_area,
                'health_score': round(health_score, 1)
            },
            'statistics': stats,
            'zone_distribution': zone_stats,
            'weather': weather,
            'water_deficit': water_deficit,
            'recommendations': recommendations,
            'water_efficiency': water_efficiency
        }
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Quick analysis failed: {e}")
        return jsonify({'error': 'Quick analysis failed', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=(FLASK_ENV == 'development'))

# For Vercel serverless deployment
app = app