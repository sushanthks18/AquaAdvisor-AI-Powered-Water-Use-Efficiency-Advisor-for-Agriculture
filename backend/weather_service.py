import requests
import random
import math
from config import OPENWEATHER_API_KEY

class WeatherService:
    def get_current_weather(self, lat, lon):
        """
        Get current weather data from OpenWeatherMap API.
        
        Args:
            lat (float): Latitude
            lon (float): Longitude
            
        Returns:
            dict: Weather data including temperature, humidity, description, wind
        """
        if not OPENWEATHER_API_KEY:
            # Return sample data if API key is not configured
            return {
                'temperature': 25.5,
                'humidity': 65,
                'description': 'Clear sky',
                'wind_speed': 3.2,
                'wind_direction': 180
            }
        
        try:
            url = f"http://api.openweathermap.org/data/2.5/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': OPENWEATHER_API_KEY,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            weather = {
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'description': data['weather'][0]['description'],
                'wind_speed': data['wind']['speed'] if 'wind' in data else 0,
                'wind_direction': data['wind']['deg'] if 'wind' in data and 'deg' in data['wind'] else 0
            }
            
            return weather
        except Exception as e:
            print(f"Weather API request failed: {e}")
            # Return sample data on failure
            return {
                'temperature': 25.5,
                'humidity': 65,
                'description': 'Clear sky',
                'wind_speed': 3.2,
                'wind_direction': 180
            }
    
    def estimate_rainfall(self, lat, lon, days=7):
        """
        Estimate rainfall for a given period.
        
        Args:
            lat (float): Latitude
            lon (float): Longitude
            days (int): Number of days to estimate rainfall for
            
        Returns:
            float: Estimated total rainfall in mm
        """
        # In a real implementation, this would use historical data or forecasts
        # For demo purposes, we'll generate a random value between 0-50mm
        return random.uniform(0, 50)
    
    def calculate_et0(self, weather):
        """
        Calculate reference evapotranspiration using Hargreaves equation.
        
        Args:
            weather (dict): Weather data containing temperature
            
        Returns:
            float: Reference evapotranspiration (ET0) in mm/day
        """
        try:
            temp = weather['temperature']
            # Simplified Hargreaves equation: 0.0023 * (T + 17.8) * sqrt(T) * 5
            # Where T is average temperature in Celsius
            et0 = 0.0023 * (temp + 17.8) * math.sqrt(temp) * 5
            return max(0, et0)  # Ensure non-negative value
        except Exception as e:
            print(f"ET0 calculation failed: {e}")
            return 5.0  # Return default value on error
    
    def assess_water_deficit(self, lat, lon, ndvi_mean=None, zone_stats=None):
        """
        Assess water deficit based on ET0, rainfall, and NDVI stress levels.
        
        Args:
            lat (float): Latitude
            lon (float): Longitude
            ndvi_mean (float): Mean NDVI value of the field
            zone_stats (dict): Statistics for each stress zone
            
        Returns:
            dict: Water deficit assessment including status and mm
        """
        # Get weather data
        weather = self.get_current_weather(lat, lon)
        
        # Estimate rainfall for the next 7 days
        rainfall = self.estimate_rainfall(lat, lon, days=7)
        
        # Calculate ET0 for 7 days
        et0_daily = self.calculate_et0(weather)
        et0_weekly = et0_daily * 7
        
        # Calculate base deficit
        base_deficit = et0_weekly - rainfall
        
        # Adjust deficit based on NDVI stress (if provided)
        if ndvi_mean is not None and zone_stats is not None:
            # Higher stress zones need more water
            critical_pct = zone_stats.get('Critical', {}).get('percentage', 0) / 100
            high_pct = zone_stats.get('High', {}).get('percentage', 0) / 100
            moderate_pct = zone_stats.get('Moderate', {}).get('percentage', 0) / 100
            
            # Increase deficit based on stress levels
            stress_factor = 1.0 + (critical_pct * 0.8) + (high_pct * 0.5) + (moderate_pct * 0.2)
            deficit = base_deficit * stress_factor
            
            # Also factor in low NDVI (more water needed)
            if ndvi_mean < 0.3:
                deficit = deficit * 1.5  # 50% more water needed for very low NDVI
            elif ndvi_mean < 0.5:
                deficit = deficit * 1.2  # 20% more water needed for low NDVI
        else:
            deficit = base_deficit
        
        # Ensure minimum realistic deficit
        deficit = max(deficit, 10.0)  # Minimum 10mm deficit for agricultural fields
        
        # Determine status
        if deficit > 40:
            status = "High"
        elif deficit > 25:
            status = "Moderate"
        else:
            status = "Low"
        
        return {
            'deficit_mm': round(deficit, 1),
            'status': status,
            'et0_weekly': round(et0_weekly, 1),
            'rainfall': round(rainfall, 1)
        }