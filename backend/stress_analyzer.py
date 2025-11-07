import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend for thread safety
import matplotlib.pyplot as plt
import io
import base64
from config import NDVI_CRITICAL, NDVI_HIGH_STRESS, NDVI_MODERATE, NDVI_HEALTHY

class StressAnalyzer:
    def detect_stress_zones(self, ndvi, weather=None):
        """
        Detect water stress zones based on NDVI values.
        
        Args:
            ndvi (numpy.ndarray): NDVI array
            weather (dict, optional): Weather data for threshold adjustment
            
        Returns:
            numpy.ndarray: Stress zone classification array
                0: Critical stress
                1: High stress
                2: Moderate stress
                3: Healthy
        """
        # Adjust thresholds based on recent rainfall
        critical_threshold = NDVI_CRITICAL
        high_stress_threshold = NDVI_HIGH_STRESS
        moderate_threshold = NDVI_MODERATE
        
        if weather and 'rainfall' in weather and weather['rainfall'] > 20:
            # Reduce thresholds after significant rainfall
            critical_threshold *= 0.8
            high_stress_threshold *= 0.85
            moderate_threshold *= 0.9
        
        # Classify pixels into stress zones
        zones = np.zeros_like(ndvi, dtype=int)
        zones[ndvi < critical_threshold] = 0  # Critical stress
        zones[(ndvi >= critical_threshold) & (ndvi < high_stress_threshold)] = 1  # High stress
        zones[(ndvi >= high_stress_threshold) & (ndvi < moderate_threshold)] = 2  # Moderate stress
        zones[ndvi >= moderate_threshold] = 3  # Healthy
        
        return zones
    
    def calculate_zone_statistics(self, zones, ndvi):
        """
        Calculate statistics for each stress zone.
        
        Args:
            zones (numpy.ndarray): Stress zone classification array
            ndvi (numpy.ndarray): NDVI array
            
        Returns:
            dict: Statistics for each zone including percentage and mean NDVI
        """
        total_pixels = zones.size
        zone_stats = {}
        
        zone_names = ['Critical', 'High', 'Moderate', 'Healthy']
        zone_colors = ['red', 'orange', 'yellow', 'green']
        
        for i, name in enumerate(zone_names):
            zone_pixels = np.sum(zones == i)
            zone_percentage = (zone_pixels / total_pixels) * 100
            
            if zone_pixels > 0:
                zone_ndvi_mean = np.mean(ndvi[zones == i])
            else:
                zone_ndvi_mean = 0
            
            zone_stats[name] = {
                'percentage': float(zone_percentage),
                'mean_ndvi': float(zone_ndvi_mean),
                'color': zone_colors[i]
            }
        
        return zone_stats
    
    def analyze_quadrants(self, ndvi):
        """
        Divide NDVI map into quadrants and analyze each.
        
        Args:
            ndvi (numpy.ndarray): NDVI array
            
        Returns:
            dict: Statistics for each quadrant (NW, NE, SW, SE)
        """
        height, width = ndvi.shape
        
        # Calculate quadrant boundaries
        mid_h = height // 2
        mid_w = width // 2
        
        # Extract quadrants
        nw = ndvi[:mid_h, :mid_w]
        ne = ndvi[:mid_h, mid_w:]
        sw = ndvi[mid_h:, :mid_w]
        se = ndvi[mid_h:, mid_w:]
        
        quadrants = {
            'NW': nw,
            'NE': ne,
            'SW': sw,
            'SE': se
        }
        
        # Calculate statistics for each quadrant
        quadrant_stats = {}
        for name, quadrant in quadrants.items():
            # Calculate mean NDVI
            mean_ndvi = np.mean(quadrant)
            
            # Calculate percentage of stressed pixels (Critical + High stress)
            stressed_pixels = np.sum(quadrant < NDVI_MODERATE)
            total_pixels = quadrant.size
            stressed_percentage = (stressed_pixels / total_pixels) * 100 if total_pixels > 0 else 0
            
            quadrant_stats[name] = {
                'mean_ndvi': float(mean_ndvi),
                'stressed_percentage': float(stressed_percentage)
            }
        
        return quadrant_stats
    
    def create_stress_map(self, zones):
        """
        Create a visualization of stress zones.
        
        Args:
            zones (numpy.ndarray): Stress zone classification array
            
        Returns:
            str: Base64 encoded PNG image
        """
        # Define colors for each zone
        colors = np.array([
            [1.0, 0.0, 0.0],  # Red - Critical stress
            [1.0, 0.65, 0.0], # Orange - High stress
            [1.0, 1.0, 0.0],  # Yellow - Moderate stress
            [0.0, 1.0, 0.0]   # Green - Healthy
        ])
        
        # Create RGB image from zones
        rgb_image = colors[zones]
        
        # Create figure
        plt.figure(figsize=(10, 8))
        plt.imshow(rgb_image)
        plt.title('Water Stress Zones')
        plt.xlabel('Pixel')
        plt.ylabel('Pixel')
        
        # Create custom legend
        import matplotlib.patches as mpatches
        legend_patches = [
            mpatches.Patch(color='red', label='Critical Stress'),
            mpatches.Patch(color='orange', label='High Stress'),
            mpatches.Patch(color='yellow', label='Moderate Stress'),
            mpatches.Patch(color='green', label='Healthy')
        ]
        plt.legend(handles=legend_patches, loc='upper right')
        
        # Save to base64 string
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        plt.close()
        
        return image_base64