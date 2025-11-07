import hashlib
import json
import numpy as np
from datetime import datetime

def calculate_field_area(boundary):
    """
    Calculate the approximate area of a field based on its boundary coordinates.
    
    Args:
        boundary (list): List of [lat, lon] coordinates defining the field boundary
        
    Returns:
        float: Approximate area in hectares
    """
    # This is a simplified calculation using the shoelace formula
    # For a production system, you would use a more accurate geospatial library
    
    if len(boundary) < 3:
        return 0
    
    # Convert to numpy array for easier manipulation
    coords = np.array(boundary)
    
    # Shoelace formula for polygon area
    x = coords[:, 1]  # longitude
    y = coords[:, 0]  # latitude
    
    area = 0.5 * np.abs(np.dot(x, np.roll(y, 1)) - np.dot(y, np.roll(x, 1)))
    
    # Convert to hectares (simplified - in reality, this would depend on location)
    # 1 degree latitude ≈ 111 km, but this varies with longitude
    # For a rough estimate, we'll use a constant
    area_hectares = area * 100  # Simplified conversion
    
    return area_hectares

def generate_cache_key(data):
    """
    Generate a cache key for data using MD5 hash.
    
    Args:
        data (dict): Data to generate cache key for
        
    Returns:
        str: MD5 hash of the data as hex string
    """
    data_str = json.dumps(data, sort_keys=True)
    return hashlib.md5(data_str.encode()).hexdigest()

def format_timestamp():
    """
    Get current timestamp formatted for display.
    
    Returns:
        str: Formatted timestamp
    """
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def validate_boundary(boundary):
    """
    Validate field boundary coordinates.
    
    Args:
        boundary (list): List of [lat, lon] coordinates
        
    Returns:
        bool: True if boundary is valid, False otherwise
    """
    if not boundary or len(boundary) < 3:
        return False
    
    # Check that all points are valid coordinates
    for point in boundary:
        if not isinstance(point, list) or len(point) != 2:
            return False
        lat, lon = point
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return False
    
    # Check that the polygon is closed (first and last points are the same)
    first_point = boundary[0]
    last_point = boundary[-1]
    if first_point[0] != last_point[0] or first_point[1] != last_point[1]:
        return False
    
    return True