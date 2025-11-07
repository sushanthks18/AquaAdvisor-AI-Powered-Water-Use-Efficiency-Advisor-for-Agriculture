"""
Crop Database Module
Contains crop-specific parameters for irrigation recommendations.
"""

class CropDatabase:
    """Database of crop-specific agricultural parameters."""
    
    CROPS = {
        'rice': {
            'name': 'Rice',
            'optimal_ndvi_range': (0.6, 0.85),
            'water_need_mm_per_week': 50,
            'critical_growth_stages': [
                'Transplanting (0-20 days)',
                'Tillering (21-45 days)',
                'Panicle Initiation (46-65 days)',
                'Flowering (66-85 days)',
                'Grain Filling (86-115 days)'
            ],
            'stress_tolerance': 'low',
            'price_per_quintal': 2000,
            'typical_yield_quintal_per_ha': 45,
            'water_multiplier': 1.5,  # Rice needs more water
            'drought_sensitivity': 0.9  # Very sensitive
        },
        'wheat': {
            'name': 'Wheat',
            'optimal_ndvi_range': (0.55, 0.80),
            'water_need_mm_per_week': 35,
            'critical_growth_stages': [
                'Germination (0-10 days)',
                'Crown Root Initiation (11-21 days)',
                'Tillering (22-60 days)',
                'Jointing (61-90 days)',
                'Heading/Flowering (91-110 days)',
                'Grain Filling (111-130 days)'
            ],
            'stress_tolerance': 'medium',
            'price_per_quintal': 2100,
            'typical_yield_quintal_per_ha': 42,
            'water_multiplier': 1.0,
            'drought_sensitivity': 0.6
        },
        'cotton': {
            'name': 'Cotton',
            'optimal_ndvi_range': (0.50, 0.75),
            'water_need_mm_per_week': 40,
            'critical_growth_stages': [
                'Germination (0-15 days)',
                'Seedling (16-35 days)',
                'Squaring (36-60 days)',
                'Flowering (61-95 days)',
                'Boll Development (96-140 days)',
                'Maturity (141-180 days)'
            ],
            'stress_tolerance': 'medium-high',
            'price_per_quintal': 6000,
            'typical_yield_quintal_per_ha': 25,
            'water_multiplier': 1.2,
            'drought_sensitivity': 0.5  # More tolerant
        },
        'sugarcane': {
            'name': 'Sugarcane',
            'optimal_ndvi_range': (0.65, 0.90),
            'water_need_mm_per_week': 55,
            'critical_growth_stages': [
                'Germination (0-30 days)',
                'Tillering (31-120 days)',
                'Grand Growth (121-270 days)',
                'Maturity (271-365 days)'
            ],
            'stress_tolerance': 'low',
            'price_per_quintal': 350,
            'typical_yield_quintal_per_ha': 700,
            'water_multiplier': 1.6,
            'drought_sensitivity': 0.85
        },
        'maize': {
            'name': 'Maize',
            'optimal_ndvi_range': (0.55, 0.80),
            'water_need_mm_per_week': 38,
            'critical_growth_stages': [
                'Germination (0-10 days)',
                'Vegetative (11-50 days)',
                'Tasseling (51-65 days)',
                'Silking (66-75 days)',
                'Grain Filling (76-110 days)',
                'Maturity (111-130 days)'
            ],
            'stress_tolerance': 'medium',
            'price_per_quintal': 1800,
            'typical_yield_quintal_per_ha': 55,
            'water_multiplier': 1.1,
            'drought_sensitivity': 0.7
        },
        'vegetables': {
            'name': 'Vegetables',
            'optimal_ndvi_range': (0.50, 0.75),
            'water_need_mm_per_week': 30,
            'critical_growth_stages': [
                'Seedling (0-15 days)',
                'Vegetative Growth (16-40 days)',
                'Flowering (41-60 days)',
                'Fruit Development (61-90 days)',
                'Harvest (91-120 days)'
            ],
            'stress_tolerance': 'low-medium',
            'price_per_quintal': 2500,
            'typical_yield_quintal_per_ha': 200,
            'water_multiplier': 0.9,
            'drought_sensitivity': 0.75
        }
    }
    
    @classmethod
    def get_crop(cls, crop_type):
        """
        Get crop information by type.
        
        Args:
            crop_type (str): Crop type identifier (lowercase)
            
        Returns:
            dict: Crop parameters or None if not found
        """
        return cls.CROPS.get(crop_type.lower())
    
    @classmethod
    def get_all_crops(cls):
        """
        Get list of all available crops.
        
        Returns:
            list: List of crop type identifiers
        """
        return list(cls.CROPS.keys())
    
    @classmethod
    def get_crop_names(cls):
        """
        Get list of all crop display names.
        
        Returns:
            dict: Dictionary mapping crop_type to display name
        """
        return {crop_type: crop_data['name'] for crop_type, crop_data in cls.CROPS.items()}
    
    @classmethod
    def calculate_water_requirement(cls, crop_type, field_area_ha, stress_level='medium'):
        """
        Calculate water requirement for a crop.
        
        Args:
            crop_type (str): Crop type identifier
            field_area_ha (float): Field area in hectares
            stress_level (str): Stress level (low, medium, high, critical)
            
        Returns:
            dict: Water requirement in mm and liters
        """
        crop = cls.get_crop(crop_type)
        if not crop:
            return None
        
        # Base water need per week
        base_water_mm = crop['water_need_mm_per_week']
        
        # Adjust based on stress level
        stress_multipliers = {
            'healthy': 0.8,
            'moderate': 1.0,
            'high': 1.3,
            'critical': 1.5
        }
        
        multiplier = stress_multipliers.get(stress_level.lower(), 1.0)
        required_mm = base_water_mm * multiplier
        
        # Convert to liters per hectare (1mm = 10,000 liters/ha)
        liters_per_ha = required_mm * 10000
        total_liters = liters_per_ha * field_area_ha
        
        return {
            'water_mm': round(required_mm, 1),
            'liters_per_hectare': int(liters_per_ha),
            'total_liters': int(total_liters),
            'stress_level': stress_level
        }
    
    @classmethod
    def assess_ndvi_for_crop(cls, crop_type, ndvi_value):
        """
        Assess NDVI value against crop-specific optimal range.
        
        Args:
            crop_type (str): Crop type identifier
            ndvi_value (float): NDVI value to assess
            
        Returns:
            dict: Assessment including status and deviation
        """
        crop = cls.get_crop(crop_type)
        if not crop:
            return {'status': 'unknown', 'deviation': 0}
        
        min_ndvi, max_ndvi = crop['optimal_ndvi_range']
        optimal_mid = (min_ndvi + max_ndvi) / 2
        
        if ndvi_value < min_ndvi - 0.15:
            status = 'critical'
        elif ndvi_value < min_ndvi:
            status = 'high'
        elif ndvi_value < min_ndvi + 0.05:
            status = 'moderate'
        elif ndvi_value <= max_ndvi:
            status = 'healthy'
        else:
            status = 'moderate'  # Too much vegetation can also indicate issues
        
        deviation = ndvi_value - optimal_mid
        
        return {
            'status': status,
            'deviation': round(deviation, 3),
            'optimal_range': crop['optimal_ndvi_range'],
            'current_ndvi': round(ndvi_value, 3)
        }
    
    @classmethod
    def get_growth_stage_advice(cls, crop_type, days_after_planting=None):
        """
        Get growth stage-specific advice.
        
        Args:
            crop_type (str): Crop type identifier
            days_after_planting (int): Days since planting (optional)
            
        Returns:
            str: Growth stage advice
        """
        crop = cls.get_crop(crop_type)
        if not crop:
            return "No specific advice available"
        
        stages = crop['critical_growth_stages']
        
        if days_after_planting is None:
            return f"Critical growth stages: {', '.join(stages[:3])}"
        
        # Return relevant stage based on days (simplified logic)
        stage_index = min(len(stages) - 1, days_after_planting // 30)
        return f"Current stage: {stages[stage_index]}"
