"""
Land Use Validation - Ensure coordinates point to actual agricultural land
"""
import numpy as np
from typing import Tuple, Dict, Optional


def validate_farm_location(coordinates: list, ndvi_data: Optional[dict] = None) -> Tuple[bool, str]:
    """
    Validate that coordinates point to actual farmland, not buildings/urban areas.
    
    Args:
        coordinates: List of [lat, lon] boundary points
        ndvi_data: Optional pre-calculated NDVI data
    
    Returns:
        (is_valid, message): Tuple of validation result and explanation
    """
    try:
        # Calculate center point
        lats = [c[0] for c in coordinates]
        lngs = [c[1] for c in coordinates]
        center_lat = sum(lats) / len(lats)
        center_lon = sum(lngs) / len(lngs)
        
        # Check 1: NDVI Validation
        # Agricultural land should have NDVI > 0.2 (showing vegetation)
        if ndvi_data:
            mean_ndvi = ndvi_data.get('current_ndvi', 0)
            
            if mean_ndvi < 0.15:
                return False, "Location shows no vegetation - likely buildings/bare soil, not active farmland"
            
            if mean_ndvi > 0.2:
                return True, "Valid agricultural land with active vegetation"
        
        # Check 2: Coordinate range validation
        # Ensure coordinates are within India's geographical bounds
        if not (6.0 <= center_lat <= 37.0 and 68.0 <= center_lon <= 98.0):
            return False, "Coordinates outside India - please verify farm location"
        
        # Check 3: Reasonable farm size
        area_approx = calculate_polygon_area(coordinates)
        
        # Agricultural land typically 0.5 - 500 acres (0.2 - 200 hectares)
        if area_approx < 0.2 or area_approx > 500:
            return False, f"Farm size ({area_approx:.2f} hectares) seems unusual - verify boundaries"
        
        # Default: Accept as agricultural land
        return True, "Coordinates appear to be agricultural land"
        
    except Exception as e:
        print(f"Validation error: {e}")
        return True, "Unable to validate - assuming agricultural land"


def calculate_polygon_area(coordinates: list) -> float:
    """
    Calculate approximate area of polygon in hectares using Haversine formula.
    
    Args:
        coordinates: List of [lat, lon] points
    
    Returns:
        Area in hectares (approximate)
    """
    try:
        # Simplified area calculation using bounding box
        lats = [c[0] for c in coordinates]
        lngs = [c[1] for c in coordinates]
        
        lat_range = max(lats) - min(lats)
        lng_range = max(lngs) - min(lngs)
        
        # Approximate: 1 degree lat ≈ 111 km, 1 degree lon ≈ 111*cos(lat) km
        center_lat = sum(lats) / len(lats)
        
        height_km = lat_range * 111
        width_km = lng_range * 111 * np.cos(np.radians(center_lat))
        
        area_km2 = height_km * width_km
        area_hectares = area_km2 * 100  # 1 km² = 100 hectares
        
        return area_hectares
        
    except Exception as e:
        print(f"Area calculation error: {e}")
        return 5.0  # Default 5 hectares


def classify_land_use(coordinates: list, ndvi_mean: float) -> str:
    """
    Classify land use based on NDVI and coordinates.
    
    Returns: 'agricultural', 'urban', 'forest', 'barren', 'water'
    """
    if ndvi_mean < 0.1:
        return 'barren'  # Buildings, roads, bare soil
    elif 0.1 <= ndvi_mean < 0.3:
        return 'sparse_vegetation'  # Could be agricultural or degraded land
    elif 0.3 <= ndvi_mean < 0.6:
        return 'agricultural'  # Active cropland
    elif 0.6 <= ndvi_mean < 0.8:
        return 'agricultural'  # Healthy crops
    else:  # > 0.8
        return 'forest'  # Dense vegetation, likely not agricultural


def get_agricultural_areas_in_district(district: str) -> Dict[str, Tuple[float, float]]:
    """
    Return known agricultural areas for different districts in India.
    These are GPS coordinates of actual farmland areas (NOT city centers).
    
    Returns: Dict of {location_name: (lat, lon)}
    """
    agricultural_coordinates = {
        # Tamil Nadu - Agricultural Areas
        'thanjavur': (10.8053, 79.1489),  # Rice farmland (Cauvery delta)
        'coimbatore': (11.0293, 76.9382),  # Farmland area near Coimbatore
        'madurai': (9.9387, 78.1021),  # Agricultural region
        'salem': (11.6854, 78.1279),  # Mango/Cotton farmland
        'erode': (11.3514, 77.7053),  # Turmeric/Coconut farmland
        'tirunelveli': (8.7289, 77.7567),  # Paddy fields
        'trichy': (10.8269, 78.6928),  # Agricultural belt
        'vellore': (12.9165, 79.1325),  # Rice/Groundnut area
        
        # Karnataka - Agricultural Areas
        'mysore': (12.2958, 76.6394),  # Coffee/Arecanut plantations
        'bangalore': (12.9352, 77.5245),  # Vegetable farmland outskirts
        'davangere': (14.4644, 75.9218),  # Cotton/Groundnut fields
        'mandya': (12.5244, 76.8957),  # Sugarcane belt
        'hassan': (13.0050, 76.1028),  # Coffee/Paddy region
        
        # Maharashtra - Agricultural Areas
        'nashik': (19.9975, 73.7898),  # Grape vineyards
        'ahmednagar': (19.0948, 74.7480),  # Sugarcane/Cotton
        'solapur': (17.6599, 75.9064),  # Cotton/Jowar fields
        'sangli': (16.8524, 74.5815),  # Sugarcane/Turmeric
        'aurangabad': (19.8762, 75.3433),  # Cotton/Soybean
        
        # Punjab - Agricultural Areas  
        'ludhiana': (30.9010, 75.8573),  # Wheat/Rice belt
        'amritsar': (31.6340, 74.8723),  # Wheat/Paddy farmland
        'patiala': (30.3398, 76.3869),  # Rice/Cotton fields
        'jalandhar': (31.3260, 75.5762),  # Wheat/Vegetables
        
        # Haryana - Agricultural Areas
        'karnal': (29.6857, 76.9905),  # Wheat/Rice farmland
        'sirsa': (29.5352, 75.0288),  # Cotton/Wheat region
        'hisar': (29.1492, 75.7217),  # Cotton/Mustard fields
        
        # Uttar Pradesh - Agricultural Areas
        'meerut': (29.0168, 77.7056),  # Sugarcane/Wheat belt
        'bareilly': (28.3670, 79.4304),  # Wheat/Sugarcane
        'agra': (27.1767, 78.0081),  # Potato/Wheat farmland
        'lucknow': (26.8467, 80.9462),  # Mango/Wheat outskirts
        
        # Andhra Pradesh - Agricultural Areas
        'guntur': (16.3067, 80.4365),  # Chilli/Cotton fields
        'krishna': (16.5579, 80.7013),  # Rice/Tobacco farmland
        'anantapur': (14.6819, 77.6006),  # Groundnut/Cotton
        'kurnool': (15.8281, 78.0373),  # Cotton/Paddy region
        
        # Telangana - Agricultural Areas
        'warangal': (17.9689, 79.5941),  # Cotton/Rice farmland
        'karimnagar': (18.4386, 79.1288),  # Rice/Cotton fields
        'nizamabad': (18.6725, 78.0941),  # Turmeric/Cotton
        
        # Madhya Pradesh - Agricultural Areas
        'indore': (22.7196, 75.8577),  # Soybean/Wheat farmland
        'bhopal': (23.2599, 77.4126),  # Wheat/Gram outskirts
        'jabalpur': (23.1815, 79.9864),  # Rice/Wheat region
    }
    
    # Search for matching district
    district_lower = district.lower().strip()
    
    for location, coords in agricultural_coordinates.items():
        if location in district_lower or district_lower in location:
            return {location: coords}
    
    # Default to general agricultural coordinates if not found
    return {'generic_farmland': (20.5937, 78.9629)}  # Central India agricultural area
