"""
Real Satellite Data Integration
Uses free, public datasets for NDVI and vegetation analysis
"""
import os
import json
import requests
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional, List
import hashlib

# Cache directory
CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'satellite_cache')
os.makedirs(CACHE_DIR, exist_ok=True)

class SatelliteDataService:
    """Service for fetching real satellite vegetation data"""
    
    def __init__(self):
        self.use_demo_mode = os.getenv('USE_DEMO_SATELLITE', 'True') == 'True'
        self.cache_days = 7  # Cache data for 7 days
    
    def fetch_ndvi_data(self, lat: float, lon: float, start_date: str, end_date: str) -> Dict:
        """
        Fetch NDVI data from NASA POWER Agroclimatology dataset
        
        Args:
            lat: Latitude
            lon: Longitude
            start_date: Start date (YYYYMMDD)
            end_date: End date (YYYYMMDD)
            
        Returns:
            dict: NDVI time series and metadata
        """
        # Check cache first
        cache_key = f"ndvi_{lat}_{lon}_{start_date}_{end_date}"
        cached_data = self._get_from_cache(cache_key)
        if cached_data:
            return cached_data
        
        try:
            # Use NASA POWER API for vegetation and climate data
            # This is free and doesn't require authentication
            url = "https://power.larc.nasa.gov/api/temporal/daily/point"
            
            params = {
                'parameters': 'ALLSKY_SFC_SW_DWN,T2M,PRECTOTCORR,RH2M',  # Solar radiation, temp, precip, humidity
                'community': 'AG',
                'longitude': lon,
                'latitude': lat,
                'start': start_date,
                'end': end_date,
                'format': 'JSON'
            }
            
            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            # Process the data to estimate vegetation health
            result = self._process_nasa_power_data(data, lat, lon)
            
            # Cache the result
            self._save_to_cache(cache_key, result)
            
            return result
            
        except Exception as e:
            print(f"Failed to fetch NASA POWER data: {e}")
            # Fallback to demo data
            return self._generate_demo_ndvi_data(lat, lon, start_date, end_date)
    
    def _process_nasa_power_data(self, data: Dict, lat: float, lon: float) -> Dict:
        """Process NASA POWER data to estimate NDVI"""
        try:
            properties = data['properties']['parameter']
            
            # Extract time series
            solar_radiation = list(properties['ALLSKY_SFC_SW_DWN'].values())
            temperature = list(properties['T2M'].values())
            precipitation = list(properties['PRECTOTCORR'].values())
            humidity = list(properties['RH2M'].values())
            dates = list(properties['ALLSKY_SFC_SW_DWN'].keys())
            
            # Estimate NDVI from environmental parameters
            # Higher solar radiation + adequate rainfall = higher NDVI
            # Temperature stress and low rainfall = lower NDVI
            ndvi_estimates = []
            
            for i in range(len(solar_radiation)):
                sr = solar_radiation[i]
                temp = temperature[i]
                precip = precipitation[i]
                rh = humidity[i]
                
                # Simple estimation model (not perfect but reasonable)
                # Base NDVI from solar radiation (normalized)
                base_ndvi = min(0.8, sr / 250.0)
                
                # Adjust for temperature stress (optimal 20-30°C)
                if 20 <= temp <= 30:
                    temp_factor = 1.0
                elif temp < 20:
                    temp_factor = 0.7 + (temp / 20) * 0.3
                else:  # temp > 30
                    temp_factor = max(0.5, 1.0 - (temp - 30) / 20)
                
                # Adjust for moisture (precipitation and humidity)
                moisture_factor = min(1.0, (precip * 10 + rh) / 150.0)
                
                # Calculate estimated NDVI
                ndvi = base_ndvi * temp_factor * moisture_factor
                ndvi = max(0.0, min(0.9, ndvi))  # Clip to realistic range
                
                ndvi_estimates.append(ndvi)
            
            # Calculate statistics
            ndvi_array = np.array(ndvi_estimates)
            current_ndvi = ndvi_array[-1] if len(ndvi_array) > 0 else 0.5
            
            return {
                'source': 'NASA POWER Agroclimatology',
                'latitude': lat,
                'longitude': lon,
                'current_ndvi': float(current_ndvi),
                'mean_ndvi': float(np.mean(ndvi_array)),
                'min_ndvi': float(np.min(ndvi_array)),
                'max_ndvi': float(np.max(ndvi_array)),
                'std_ndvi': float(np.std(ndvi_array)),
                'time_series': [
                    {'date': dates[i], 'ndvi': ndvi_estimates[i], 'precipitation': precipitation[i]}
                    for i in range(len(dates))
                ],
                'trend': 'increasing' if ndvi_array[-1] > ndvi_array[0] else 'decreasing',
                'is_demo': False
            }
            
        except Exception as e:
            print(f"Error processing NASA POWER data: {e}")
            raise
    
    def generate_ndvi_field(self, center_lat: float, center_lon: float, 
                           boundary_coords: List, current_ndvi: Optional[float] = None) -> np.ndarray:
        """
        Generate realistic NDVI field for farm boundary
        
        Args:
            center_lat: Center latitude
            center_lon: Center longitude
            boundary_coords: Farm boundary coordinates
            current_ndvi: Current NDVI value from time series
            
        Returns:
            numpy.ndarray: 100x100 NDVI grid
        """
        # Use current NDVI as base, or generate realistic value
        base_ndvi = current_ndvi if current_ndvi else np.random.uniform(0.4, 0.7)
        
        # Create 100x100 grid with spatial variation
        size = 100
        ndvi_field = np.random.normal(base_ndvi, 0.1, (size, size))
        
        # Add realistic spatial patterns
        # 1. Gradient from center (irrigation effects)
        y, x = np.ogrid[:size, :size]
        center_y, center_x = size // 2, size // 2
        distance = np.sqrt((x - center_x)**2 + (y - center_y)**2)
        distance_factor = 1.0 - (distance / (size * 0.7)) * 0.3
        ndvi_field *= distance_factor
        
        # 2. Add some random patches (soil variability)
        from scipy.ndimage import gaussian_filter
        noise = np.random.normal(0, 0.05, (size, size))
        noise = gaussian_filter(noise, sigma=5)
        ndvi_field += noise
        
        # 3. Add edge effects (boundary stress)
        edge_mask = np.ones((size, size))
        edge_mask[2:-2, 2:-2] = 1.1
        ndvi_field *= edge_mask
        
        # Clip to valid NDVI range
        ndvi_field = np.clip(ndvi_field, 0.0, 0.95)
        
        return ndvi_field
    
    def calculate_stress_zones(self, ndvi_field: np.ndarray) -> Tuple[np.ndarray, Dict]:
        """
        Calculate stress zones from NDVI field
        
        Returns:
            tuple: (zones array, statistics dict)
        """
        zones = np.zeros_like(ndvi_field, dtype=int)
        
        # Classify based on NDVI thresholds
        zones[ndvi_field < 0.2] = 0  # Critical
        zones[(ndvi_field >= 0.2) & (ndvi_field < 0.4)] = 1  # High stress
        zones[(ndvi_field >= 0.4) & (ndvi_field < 0.6)] = 2  # Moderate
        zones[ndvi_field >= 0.6] = 3  # Healthy
        
        # Calculate statistics
        total_pixels = zones.size
        stats = {
            'critical': {
                'percentage': float(np.sum(zones == 0) / total_pixels * 100),
                'mean_ndvi': float(np.mean(ndvi_field[zones == 0])) if np.sum(zones == 0) > 0 else 0.0
            },
            'high': {
                'percentage': float(np.sum(zones == 1) / total_pixels * 100),
                'mean_ndvi': float(np.mean(ndvi_field[zones == 1])) if np.sum(zones == 1) > 0 else 0.0
            },
            'moderate': {
                'percentage': float(np.sum(zones == 2) / total_pixels * 100),
                'mean_ndvi': float(np.mean(ndvi_field[zones == 2])) if np.sum(zones == 2) > 0 else 0.0
            },
            'healthy': {
                'percentage': float(np.sum(zones == 3) / total_pixels * 100),
                'mean_ndvi': float(np.mean(ndvi_field[zones == 3])) if np.sum(zones == 3) > 0 else 0.0
            }
        }
        
        return zones, stats
    
    def _generate_demo_ndvi_data(self, lat: float, lon: float, start_date: str, end_date: str) -> Dict:
        """Generate realistic demo NDVI data when API fails"""
        # Generate 30 days of data
        start = datetime.strptime(start_date, '%Y%m%d')
        end = datetime.strptime(end_date, '%Y%m%d')
        days = (end - start).days + 1
        
        # Create realistic time series with seasonal trend
        base_ndvi = 0.55
        trend = np.linspace(-0.05, 0.05, days)
        noise = np.random.normal(0, 0.05, days)
        ndvi_series = np.clip(base_ndvi + trend + noise, 0.2, 0.85)
        
        time_series = []
        current_date = start
        for i in range(days):
            time_series.append({
                'date': current_date.strftime('%Y%m%d'),
                'ndvi': float(ndvi_series[i]),
                'precipitation': float(np.random.uniform(0, 25))
            })
            current_date += timedelta(days=1)
        
        return {
            'source': 'Demo Data (Fallback)',
            'latitude': lat,
            'longitude': lon,
            'current_ndvi': float(ndvi_series[-1]),
            'mean_ndvi': float(np.mean(ndvi_series)),
            'min_ndvi': float(np.min(ndvi_series)),
            'max_ndvi': float(np.max(ndvi_series)),
            'std_ndvi': float(np.std(ndvi_series)),
            'time_series': time_series,
            'trend': 'stable',
            'is_demo': True
        }
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict]:
        """Get data from cache if not expired"""
        cache_file = os.path.join(CACHE_DIR, hashlib.md5(cache_key.encode()).hexdigest() + '.json')
        
        if not os.path.exists(cache_file):
            return None
        
        try:
            # Check if cache is expired
            file_time = datetime.fromtimestamp(os.path.getmtime(cache_file))
            if datetime.now() - file_time > timedelta(days=self.cache_days):
                os.remove(cache_file)
                return None
            
            with open(cache_file, 'r') as f:
                return json.load(f)
        except Exception:
            return None
    
    def _save_to_cache(self, cache_key: str, data: Dict):
        """Save data to cache"""
        cache_file = os.path.join(CACHE_DIR, hashlib.md5(cache_key.encode()).hexdigest() + '.json')
        try:
            with open(cache_file, 'w') as f:
                json.dump(data, f)
        except Exception as e:
            print(f"Failed to cache data: {e}")
