"""
Irrigation Zone Mapping - Color-coded zones with farmer-friendly instructions
"""
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta


def generate_irrigation_zones(ndvi_field: np.ndarray, stress_zones: np.ndarray, 
                              field_boundary: list, area_hectares: float) -> Dict:
    """
    Generate color-coded irrigation zones with actionable recommendations.
    
    Args:
        ndvi_field: 2D array of NDVI values
        stress_zones: 2D array of stress classification (0=critical, 1=high, 2=moderate, 3=healthy)
        field_boundary: Farm boundary coordinates
        area_hectares: Total farm area in hectares
    
    Returns:
        Dict with zone information and farmer-friendly instructions
    """
    # Calculate area for each zone
    total_pixels = stress_zones.size
    area_per_hectare = area_hectares / total_pixels
    area_acres = area_hectares * 2.47105  # Convert to acres
    
    # Count pixels in each zone
    critical_count = np.sum(stress_zones == 0)
    high_count = np.sum(stress_zones == 1)
    moderate_count = np.sum(stress_zones == 2)
    healthy_count = np.sum(stress_zones == 3)
    
    # Calculate areas
    critical_area = (critical_count / total_pixels) * area_acres
    high_area = (high_count / total_pixels) * area_acres
    moderate_area = (moderate_count / total_pixels) * area_acres
    healthy_area = (healthy_count / total_pixels) * area_acres
    
    # Calculate water requirements (mm to liters conversion)
    # 1mm of water per hectare = 10,000 liters
    area_hectares_per_zone = area_hectares / total_pixels
    
    critical_water_liters = critical_count * area_hectares_per_zone * 60 * 10000  # 60mm
    high_water_liters = high_count * area_hectares_per_zone * 40 * 10000  # 40mm
    moderate_water_liters = moderate_count * area_hectares_per_zone * 25 * 10000  # 25mm
    
    total_water_liters = critical_water_liters + high_water_liters + moderate_water_liters
    
    # Generate zones with bilingual instructions
    zones = {
        'red': {
            'color': '#DC2626',
            'color_name': 'Red',
            'priority': 1,
            'area_acres': round(critical_area, 2),
            'area_hectares': round(critical_area / 2.47105, 2),
            'percentage': round((critical_count / total_pixels) * 100, 1),
            'water_mm': 60,
            'water_liters': int(critical_water_liters),
            'timing': 'TODAY',
            'timing_days': 0,
            'english': {
                'title': '🔴 Critical - Water Immediately',
                'action': 'Give 60mm water TODAY',
                'reason': 'Crops are very dry, leaves turning yellow/brown',
                'location': 'Critical stress areas'
            },
            'hindi': {
                'title': '🔴 तुरंत पानी दें',
                'action': 'आज ही 60 मिमी पानी दें',
                'reason': 'फसल बहुत सूखी है, पत्ते पीले/भूरे हो रहे हैं',
                'location': 'गंभीर तनाव क्षेत्र'
            },
            'tamil': {
                'title': '🔴 உடனடியாக நீர் கொடுக்கவும்',
                'action': 'இன்றே 60 மிமீ நீர் கொடுக்கவும்',
                'reason': 'பயிர் மிகவும் வறண்டுள்ளது, இலைகள் மஞ்சள்/பழுப்பு நிறமாகிறது',
                'location': 'கடுமையான அழுத்த பகுதிகள்'
            }
        },
        'orange': {
            'color': '#EA580C',
            'color_name': 'Orange',
            'priority': 2,
            'area_acres': round(high_area, 2),
            'area_hectares': round(high_area / 2.47105, 2),
            'percentage': round((high_count / total_pixels) * 100, 1),
            'water_mm': 40,
            'water_liters': int(high_water_liters),
            'timing': 'Within 2 days',
            'timing_days': 2,
            'english': {
                'title': '🟠 High Priority - Water Soon',
                'action': 'Give 40mm water in 2 days',
                'reason': 'Soil moisture is low, crops showing stress',
                'location': 'High stress zones'
            },
            'hindi': {
                'title': '🟠 जल्द पानी दें',
                'action': '2 दिन में 40 मिमी पानी दें',
                'reason': 'मिट्टी में नमी कम है, फसल में तनाव दिख रहा है',
                'location': 'उच्च तनाव क्षेत्र'
            },
            'tamil': {
                'title': '🟠 விரைவில் நீர் கொடுக்கவும்',
                'action': '2 நாட்களில் 40 மிமீ நீர் கொடுக்கவும்',
                'reason': 'மண் ஈரப்பதம் குறைவாக உள்ளது, பயிர் அழுத்தம் காட்டுகிறது',
                'location': 'உயர் அழுத்த மண்டலங்கள்'
            }
        },
        'yellow': {
            'color': '#EAB308',
            'color_name': 'Yellow',
            'priority': 3,
            'area_acres': round(moderate_area, 2),
            'area_hectares': round(moderate_area / 2.47105, 2),
            'percentage': round((moderate_count / total_pixels) * 100, 1),
            'water_mm': 25,
            'water_liters': int(moderate_water_liters),
            'timing': 'Within 4 days',
            'timing_days': 4,
            'english': {
                'title': '🟡 Moderate - Schedule Irrigation',
                'action': 'Give 25mm water in 4 days',
                'reason': 'Crops starting to show stress, preventive watering needed',
                'location': 'Moderate stress areas'
            },
            'hindi': {
                'title': '🟡 सामान्य - पानी की योजना बनाएं',
                'action': '4 दिन में 25 मिमी पानी दें',
                'reason': 'फसल में थोड़ा तनाव दिख रहा है, रोकथाम के लिए पानी चाहिए',
                'location': 'मध्यम तनाव क्षेत्र'
            },
            'tamil': {
                'title': '🟡 மிதமான - நீர் திட்டமிடவும்',
                'action': '4 நாட்களில் 25 மிமீ நீர் கொடுக்கவும்',
                'reason': 'பயிர் சிறிது அழுத்தம் காட்டுகிறது, தடுப்பு நீர் தேவை',
                'location': 'மிதமான அழுத்த பகுதிகள்'
            }
        },
        'green': {
            'color': '#16A34A',
            'color_name': 'Green',
            'priority': 4,
            'area_acres': round(healthy_area, 2),
            'area_hectares': round(healthy_area / 2.47105, 2),
            'percentage': round((healthy_count / total_pixels) * 100, 1),
            'water_mm': 0,
            'water_liters': 0,
            'timing': 'No watering needed',
            'timing_days': 7,
            'english': {
                'title': '🟢 Healthy - No Irrigation Needed',
                'action': 'No water needed now',
                'reason': 'Crops are healthy with adequate soil moisture',
                'location': 'Healthy zones'
            },
            'hindi': {
                'title': '🟢 स्वस्थ - पानी की जरूरत नहीं',
                'action': 'अभी पानी की आवश्यकता नहीं',
                'reason': 'फसल स्वस्थ है और मिट्टी में पर्याप्त नमी है',
                'location': 'स्वस्थ क्षेत्र'
            },
            'tamil': {
                'title': '🟢 ஆரோக்கியம் - நீர் தேவையில்லை',
                'action': 'இப்போது நீர் தேவையில்லை',
                'reason': 'பயிர் ஆரோக்கியமாக உள்ளது, போதுமான மண் ஈரப்பதம்',
                'location': 'ஆரோக்கியமான மண்டலங்கள்'
            }
        }
    }
    
    # Generate irrigation schedule
    today = datetime.now()
    irrigation_schedule = []
    
    if zones['red']['area_acres'] > 0.1:
        irrigation_schedule.append({
            'date': today.strftime('%Y-%m-%d'),
            'day_name': 'Today',
            'zones': ['red'],
            'priority': 'URGENT',
            'water_liters': zones['red']['water_liters']
        })
    
    if zones['orange']['area_acres'] > 0.1:
        irrigation_schedule.append({
            'date': (today + timedelta(days=2)).strftime('%Y-%m-%d'),
            'day_name': 'In 2 days',
            'zones': ['orange'],
            'priority': 'HIGH',
            'water_liters': zones['orange']['water_liters']
        })
    
    if zones['yellow']['area_acres'] > 0.1:
        irrigation_schedule.append({
            'date': (today + timedelta(days=4)).strftime('%Y-%m-%d'),
            'day_name': 'In 4 days',
            'zones': ['yellow'],
            'priority': 'MEDIUM',
            'water_liters': zones['yellow']['water_liters']
        })
    
    # Step-by-step irrigation instructions
    irrigation_steps = []
    step_num = 1
    
    if zones['red']['area_acres'] > 0.1:
        irrigation_steps.append({
            'step': step_num,
            'zone': 'red',
            'action': f"Start with RED zones ({zones['red']['area_acres']} acres)",
            'water': f"{zones['red']['water_liters']:,} liters",
            'timing': 'TODAY - Morning or Evening'
        })
        step_num += 1
    
    if zones['orange']['area_acres'] > 0.1:
        irrigation_steps.append({
            'step': step_num,
            'zone': 'orange',
            'action': f"Then water ORANGE zones ({zones['orange']['area_acres']} acres)",
            'water': f"{zones['orange']['water_liters']:,} liters",
            'timing': 'Within 2 days'
        })
        step_num += 1
    
    if zones['yellow']['area_acres'] > 0.1:
        irrigation_steps.append({
            'step': step_num,
            'zone': 'yellow',
            'action': f"Schedule YELLOW zones ({zones['yellow']['area_acres']} acres)",
            'water': f"{zones['yellow']['water_liters']:,} liters",
            'timing': 'Within 4 days (weekend)'
        })
        step_num += 1
    
    irrigation_steps.append({
        'step': step_num,
        'zone': 'green',
        'action': f"Skip GREEN zones ({zones['green']['area_acres']} acres)",
        'water': 'No water needed',
        'timing': 'Already healthy'
    })
    
    return {
        'zones': zones,
        'total_water_liters': int(total_water_liters),
        'total_water_cubic_meters': round(total_water_liters / 1000, 2),
        'irrigation_schedule': irrigation_schedule,
        'irrigation_steps': irrigation_steps,
        'priority_summary': {
            'urgent_area': zones['red']['area_acres'],
            'high_priority_area': zones['orange']['area_acres'],
            'medium_priority_area': zones['yellow']['area_acres'],
            'healthy_area': zones['green']['area_acres']
        },
        'water_savings': {
            'potential_savings_liters': int(zones['green']['area_acres'] / 2.47105 * 40 * 10000),
            'savings_explanation': f"Saving water by not irrigating {zones['green']['area_acres']} acres of healthy crops"
        }
    }


def create_zone_geojson(stress_zones: np.ndarray, field_boundary: list) -> Dict:
    """
    Create GeoJSON overlays for colored irrigation zones.
    
    Returns:
        GeoJSON FeatureCollection with colored zone polygons
    """
    # This would need actual polygon extraction from the stress zone raster
    # For now, return simplified zone representation
    
    features = []
    colors = {
        0: {'color': '#DC2626', 'label': '🔴 Critical'},
        1: {'color': '#EA580C', 'label': '🟠 High'},
        2: {'color': '#EAB308', 'label': '🟡 Moderate'},
        3: {'color': '#16A34A', 'label': '🟢 Healthy'}
    }
    
    # Simple representation - in production, would extract actual polygons
    for zone_id, zone_info in colors.items():
        if np.sum(stress_zones == zone_id) > 0:
            features.append({
                'type': 'Feature',
                'properties': {
                    'zone': zone_id,
                    'fillColor': zone_info['color'],
                    'fillOpacity': 0.5,
                    'label': zone_info['label']
                },
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [field_boundary]
                }
            })
    
    return {
        'type': 'FeatureCollection',
        'features': features
    }
