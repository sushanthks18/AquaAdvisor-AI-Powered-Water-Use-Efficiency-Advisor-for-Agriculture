"""
Financial Calculator Module
Calculates ROI and cost-benefit analysis for irrigation optimization.
"""

from crop_database import CropDatabase


class FinancialCalculator:
    """Calculator for financial impact of irrigation optimization."""
    
    # Default water rates (₹ per 1000 liters) by irrigation method
    WATER_RATES = {
        'flood': 50,
        'drip': 40,
        'sprinkler': 45
    }
    
    # Yield improvement percentages based on stress reduction
    YIELD_IMPROVEMENT = {
        'critical_to_healthy': 0.15,  # 15% improvement
        'high_to_healthy': 0.12,      # 12% improvement
        'moderate_to_healthy': 0.08,  # 8% improvement
        'maintain_healthy': 0.05      # 5% improvement
    }
    
    @classmethod
    def calculate_roi(cls, field_area_ha, crop_type, zone_stats, 
                      water_rate_per_1000l=50, irrigation_method='flood',
                      current_irrigation_cycles=10):
        """
        Calculate comprehensive ROI analysis.
        
        Args:
            field_area_ha (float): Field area in hectares
            crop_type (str): Type of crop
            zone_stats (dict): Stress zone statistics
            water_rate_per_1000l (float): Cost of water per 1000 liters
            irrigation_method (str): flood/drip/sprinkler
            current_irrigation_cycles (int): Current number of irrigation cycles
            
        Returns:
            dict: Complete ROI analysis
        """
        crop = CropDatabase.get_crop(crop_type)
        if not crop:
            return None
        
        # Calculate current water usage (inefficient)
        current_water_mm_per_cycle = crop['water_need_mm_per_week'] * crop['water_multiplier']
        current_water_liters = current_water_mm_per_cycle * 10000 * field_area_ha * current_irrigation_cycles
        current_water_cost = (current_water_liters / 1000) * water_rate_per_1000l
        
        # Calculate optimized water usage
        healthy_pct = zone_stats.get('Healthy', {}).get('percentage', 0)
        moderate_pct = zone_stats.get('Moderate', {}).get('percentage', 0)
        high_pct = zone_stats.get('High', {}).get('percentage', 0)
        critical_pct = zone_stats.get('Critical', {}).get('percentage', 0)
        
        # Zone-specific optimization
        # Healthy zones: 80% of normal water
        # Moderate zones: 100% of normal water
        # High zones: 120% of normal water
        # Critical zones: 140% of normal water
        optimized_multiplier = (
            (healthy_pct * 0.80 +
             moderate_pct * 1.00 +
             high_pct * 1.20 +
             critical_pct * 1.40) / 100
        )
        
        optimized_water_mm_per_cycle = crop['water_need_mm_per_week'] * optimized_multiplier
        optimized_water_liters = optimized_water_mm_per_cycle * 10000 * field_area_ha * current_irrigation_cycles
        optimized_water_cost = (optimized_water_liters / 1000) * water_rate_per_1000l
        
        # Water savings
        water_saved_liters = current_water_liters - optimized_water_liters
        water_saved_pct = (water_saved_liters / current_water_liters * 100) if current_water_liters > 0 else 0
        cost_saved = current_water_cost - optimized_water_cost
        
        # Calculate yield improvement
        # Based on stress reduction
        avg_stress_score = (
            critical_pct * 0.0 +
            high_pct * 0.3 +
            moderate_pct * 0.6 +
            healthy_pct * 1.0
        ) / 100
        
        # Determine yield improvement category
        if critical_pct > 20 or high_pct > 30:
            yield_improvement_pct = cls.YIELD_IMPROVEMENT['critical_to_healthy']
        elif high_pct > 15:
            yield_improvement_pct = cls.YIELD_IMPROVEMENT['high_to_healthy']
        elif moderate_pct > 30:
            yield_improvement_pct = cls.YIELD_IMPROVEMENT['moderate_to_healthy']
        else:
            yield_improvement_pct = cls.YIELD_IMPROVEMENT['maintain_healthy']
        
        # Adjust based on actual stress
        yield_improvement_pct = yield_improvement_pct * (1 - avg_stress_score)
        
        # Calculate revenue increase
        current_yield_quintal = crop['typical_yield_quintal_per_ha'] * field_area_ha
        improved_yield_quintal = current_yield_quintal * (1 + yield_improvement_pct)
        yield_increase_quintal = improved_yield_quintal - current_yield_quintal
        
        price_per_quintal = crop['price_per_quintal']
        revenue_increase = yield_increase_quintal * price_per_quintal
        
        # Current revenue
        current_revenue = current_yield_quintal * price_per_quintal
        current_total_cost = current_water_cost
        current_profit = current_revenue - current_total_cost
        
        # Optimized scenario
        optimized_revenue = improved_yield_quintal * price_per_quintal
        optimized_total_cost = optimized_water_cost
        optimized_profit = optimized_revenue - optimized_total_cost
        
        # Total benefit
        total_benefit = cost_saved + revenue_increase
        
        # ROI calculation
        # Assume minimal implementation cost for AI system (software only)
        implementation_cost = 5000  # ₹5000 for software/training
        roi_percentage = (total_benefit / implementation_cost * 100) if implementation_cost > 0 else 0
        
        return {
            'current_scenario': {
                'water_usage_liters': int(current_water_liters),
                'water_cost': int(current_water_cost),
                'yield_quintal': round(current_yield_quintal, 1),
                'revenue': int(current_revenue),
                'profit': int(current_profit)
            },
            'optimized_scenario': {
                'water_usage_liters': int(optimized_water_liters),
                'water_cost': int(optimized_water_cost),
                'yield_quintal': round(improved_yield_quintal, 1),
                'revenue': int(optimized_revenue),
                'profit': int(optimized_profit)
            },
            'savings': {
                'water_saved_liters': int(water_saved_liters),
                'water_saved_percentage': round(water_saved_pct, 1),
                'cost_saved': int(cost_saved),
                'yield_improvement_percentage': round(yield_improvement_pct * 100, 1),
                'yield_increase_quintal': round(yield_increase_quintal, 1),
                'revenue_increase': int(revenue_increase),
                'total_season_benefit': int(total_benefit)
            },
            'roi': {
                'implementation_cost': implementation_cost,
                'total_benefit': int(total_benefit),
                'roi_percentage': round(roi_percentage, 1),
                'payback_months': round((implementation_cost / total_benefit * 4) if total_benefit > 0 else 0, 1)
            },
            'inputs': {
                'field_area_ha': field_area_ha,
                'crop_type': crop_type,
                'crop_name': crop['name'],
                'water_rate_per_1000l': water_rate_per_1000l,
                'irrigation_method': irrigation_method,
                'irrigation_cycles': current_irrigation_cycles
            }
        }
    
    @classmethod
    def calculate_comparison(cls, field_area_ha, crop_type):
        """
        Calculate traditional vs AI-optimized comparison for demo.
        
        Args:
            field_area_ha (float): Field area in hectares
            crop_type (str): Type of crop
            
        Returns:
            dict: Comparison data
        """
        crop = CropDatabase.get_crop(crop_type)
        if not crop:
            return None
        
        # Traditional (uniform irrigation)
        traditional_water_mm = crop['water_need_mm_per_week'] * crop['water_multiplier'] * 1.5  # 50% over-watering
        traditional_water_liters = traditional_water_mm * 10000 * field_area_ha * 10  # 10 cycles
        traditional_cost = (traditional_water_liters / 1000) * 50
        traditional_yield = crop['typical_yield_quintal_per_ha'] * field_area_ha * 0.90  # 10% lower due to stress
        traditional_revenue = traditional_yield * crop['price_per_quintal']
        
        # AI-optimized (zone-based)
        optimized_water_mm = crop['water_need_mm_per_week'] * 1.0
        optimized_water_liters = optimized_water_mm * 10000 * field_area_ha * 10
        optimized_cost = (optimized_water_liters / 1000) * 50
        optimized_yield = crop['typical_yield_quintal_per_ha'] * field_area_ha * 1.05  # 5% higher
        optimized_revenue = optimized_yield * crop['price_per_quintal']
        
        return {
            'traditional': {
                'water_liters': int(traditional_water_liters),
                'cost': int(traditional_cost),
                'stress_percentage': 45,
                'yield_quintal_per_ha': round(traditional_yield / field_area_ha, 1)
            },
            'optimized': {
                'water_liters': int(optimized_water_liters),
                'cost': int(optimized_cost),
                'stress_percentage': 15,
                'yield_quintal_per_ha': round(optimized_yield / field_area_ha, 1)
            },
            'savings': {
                'water_liters': int(traditional_water_liters - optimized_water_liters),
                'cost': int(traditional_cost - optimized_cost),
                'water_percentage': round((traditional_water_liters - optimized_water_liters) / traditional_water_liters * 100, 1)
            }
        }
