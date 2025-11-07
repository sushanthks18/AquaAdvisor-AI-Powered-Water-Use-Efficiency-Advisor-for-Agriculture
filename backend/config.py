import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Credentials
SENTINEL_USERNAME = os.getenv('SENTINEL_USERNAME')
SENTINEL_PASSWORD = os.getenv('SENTINEL_PASSWORD')
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')

# Directory Configuration
CACHE_DIR = os.path.join(os.path.dirname(__file__), 'data', 'cache')
SAMPLE_DIR = os.path.join(os.path.dirname(__file__), 'data', 'samples')

# Create directories if they don't exist
os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(SAMPLE_DIR, exist_ok=True)

# Processing Parameters
MAX_CLOUD_COVER = 20  # Maximum cloud cover percentage
DAYS_LOOKBACK = 30    # Days to look back for satellite imagery

# NDVI Thresholds
NDVI_CRITICAL = 0.3
NDVI_HIGH_STRESS = 0.5
NDVI_MODERATE = 0.6
NDVI_HEALTHY = 0.6

# Application Settings
FLASK_ENV = os.getenv('FLASK_ENV', 'development')