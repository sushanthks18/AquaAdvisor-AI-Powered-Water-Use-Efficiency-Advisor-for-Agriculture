import os
import hashlib
import numpy as np
# from sentinelsat import SentinelAPI
from datetime import datetime, timedelta
from config import CACHE_DIR, SAMPLE_DIR  # SENTINEL_USERNAME, SENTINEL_PASSWORD, MAX_CLOUD_COVER, DAYS_LOOKBACK

class SatelliteFetcher:
    def __init__(self):
        """Initialize the SatelliteFetcher with API credentials."""
        self.api = None
        # if SENTINEL_USERNAME and SENTINEL_PASSWORD:
        #     self.api = SentinelAPI(SENTINEL_USERNAME, SENTINEL_PASSWORD, 'https://scihub.copernicus.eu/dhus')
    
    def authenticate(self):
        """
        Authenticate with the Sentinel API.
        
        Returns:
            bool: True if authentication is successful, False otherwise
        """
        try:
            if self.api:
                # Test authentication
                self.api.query(**{
                    'date': (datetime.now() - timedelta(days=1)).strftime('%Y%m%d'),
                    'date__lt': datetime.now().strftime('%Y%m%d'),
                    'platformname': 'Sentinel-2',
                    'producttype': 'S2MSI2A',
                    'cloudcoverpercentage': (0, MAX_CLOUD_COVER)
                })
                return True
            return False
        except Exception as e:
            print(f"Authentication failed: {e}")
            return False
    
    def search_images(self, bbox, dates):
        """
        Search for Sentinel-2 images within a bounding box and date range.
        
        Args:
            bbox (tuple): Bounding box coordinates (min_lon, min_lat, max_lon, max_lat)
            dates (tuple): Date range (start_date, end_date) as datetime objects
            
        Returns:
            list: List of product IDs matching the search criteria
        """
        if not self.api:
            return []
            
        try:
            products = self.api.query(
                area=bbox,
                date=(dates[0].strftime('%Y%m%d'), dates[1].strftime('%Y%m%d')),
                platformname='Sentinel-2',
                producttype='S2MSI2A',
                cloudcoverpercentage=(0, MAX_CLOUD_COVER)
            )
            
            # Sort by cloud cover (ascending) and return product IDs
            sorted_products = sorted(products.values(), key=lambda x: x['cloudcoverpercentage'])
            return [product['id'] for product in sorted_products]
        except Exception as e:
            print(f"Search failed: {e}")
            return []
    
    def download_bands(self, product_id):
        """
        Download Red (B04) and NIR (B08) bands for a product.
        
        Args:
            product_id (str): Sentinel-2 product ID
            
        Returns:
            tuple: Paths to downloaded Red and NIR band files, or (None, None) if failed
        """
        if not self.api:
            return None, None
            
        try:
            # Create hash for cache directory
            cache_key = hashlib.md5(product_id.encode()).hexdigest()
            product_cache_dir = os.path.join(CACHE_DIR, cache_key)
            os.makedirs(product_cache_dir, exist_ok=True)
            
            # Define band file paths
            red_band_path = os.path.join(product_cache_dir, 'B04.tif')
            nir_band_path = os.path.join(product_cache_dir, 'B08.tif')
            
            # Check if bands are already cached
            if os.path.exists(red_band_path) and os.path.exists(nir_band_path):
                return red_band_path, nir_band_path
            
            # Download product info
            product_info = self.api.get_product_odata(product_id)
            node_info = self.api.get_product_odata(product_id, full=True)
            
            # Download Red band (B04)
            if 'B04' in node_info['nodes']:
                self.api.download(product_id, nodefilter=lambda x: x['id'].endswith('B04.jp2'), directory_path=product_cache_dir)
                # Convert JP2 to GeoTIFF if needed
                # For simplicity, we'll assume the file is downloaded as B04.tif
                # In a real implementation, you would convert JP2 to GeoTIFF
            
            # Download NIR band (B08)
            if 'B08' in node_info['nodes']:
                self.api.download(product_id, nodefilter=lambda x: x['id'].endswith('B08.jp2'), directory_path=product_cache_dir)
                # Convert JP2 to GeoTIFF if needed
                # For simplicity, we'll assume the file is downloaded as B08.tif
                # In a real implementation, you would convert JP2 to GeoTIFF
            
            return red_band_path, nir_band_path
        except Exception as e:
            print(f"Download failed: {e}")
            return None, None
    
    def load_sample_data(self, field_boundary=None, crop_type='wheat'):
        """
        Generate realistic synthetic sample data based on field location and crop type.
        Creates varied field conditions with realistic stress patterns.
        
        Args:
            field_boundary (list): Field boundary coordinates (not used in demo, but for future)
            crop_type (str): Type of crop to simulate
            
        Returns:
            tuple: Red and NIR band arrays (100x100) with realistic patterns
        """
        # Create base hash from field location for consistent results per location
        if field_boundary:
            location_seed = hash(str(field_boundary)) % 100000
        else:
            location_seed = np.random.randint(0, 100000)
        
        np.random.seed(location_seed)
        
        # Crop-specific reflectance values (realistic ranges from scientific literature)
        crop_profiles = {
            'rice': {'red_range': (90, 140), 'nir_range': (200, 250), 'health_bias': 0.7},
            'wheat': {'red_range': (100, 160), 'nir_range': (180, 240), 'health_bias': 0.6},
            'cotton': {'red_range': (110, 170), 'nir_range': (190, 245), 'health_bias': 0.65},
            'sugarcane': {'red_range': (85, 135), 'nir_range': (210, 255), 'health_bias': 0.75},
            'maize': {'red_range': (95, 150), 'nir_range': (185, 235), 'health_bias': 0.65},
            'vegetables': {'red_range': (105, 165), 'nir_range': (175, 230), 'health_bias': 0.6}
        }
        
        profile = crop_profiles.get(crop_type, crop_profiles['wheat'])
        
        # Generate realistic field patterns (not completely random)
        size = (100, 100)
        
        # Create base healthy vegetation
        red_base = np.random.uniform(profile['red_range'][0], profile['red_range'][1], size=size)
        nir_base = np.random.uniform(profile['nir_range'][0], profile['nir_range'][1], size=size)
        
        # Add realistic stress patterns (water stress typically in patches)
        num_stress_zones = np.random.randint(2, 6)  # 2-5 stress zones
        
        for _ in range(num_stress_zones):
            # Random stress zone location
            center_x = np.random.randint(20, 80)
            center_y = np.random.randint(20, 80)
            radius = np.random.randint(8, 25)
            
            # Create circular stress pattern
            y, x = np.ogrid[:size[0], :size[1]]
            mask = (x - center_x)**2 + (y - center_y)**2 <= radius**2
            
            # Stress reduces NIR and increases Red (less chlorophyll)
            stress_intensity = np.random.uniform(0.3, 0.8)  # Variable stress levels
            red_base[mask] += stress_intensity * 40  # Stressed plants reflect more red
            nir_base[mask] -= stress_intensity * 50  # Stressed plants reflect less NIR
        
        # Add edge effects (field edges often different)
        red_base[:5, :] += 15  # Edge stress
        red_base[-5:, :] += 15
        red_base[:, :5] += 15
        red_base[:, -5:] += 15
        nir_base[:5, :] -= 20
        nir_base[-5:, :] -= 20
        nir_base[:, :5] -= 20
        nir_base[:, -5:] -= 20
        
        # Add Gaussian noise for realism (sensor noise)
        red_base += np.random.normal(0, 3, size=size)
        nir_base += np.random.normal(0, 3, size=size)
        
        # Ensure values stay in valid range
        red = np.clip(red_base, 50, 200).astype(np.float32)
        nir = np.clip(nir_base, 100, 255).astype(np.float32)
        
        # Reset random seed to avoid affecting other operations
        np.random.seed(None)
        
        return red, nir