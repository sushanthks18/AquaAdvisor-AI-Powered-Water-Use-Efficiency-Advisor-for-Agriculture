from crop_database import CropDatabase

class RecommendationEngine:
    def generate_recommendations(self, zone_stats, quadrants, deficit, ndvi_mean, crop_type='wheat', field_area_ha=1.0):
        """
        Generate irrigation recommendations based on analysis results.
        
        Args:
            zone_stats (dict): Statistics for each stress zone
            quadrants (dict): Analysis of field quadrants
            deficit (dict): Water deficit assessment
            ndvi_mean (float): Mean NDVI for the field
            crop_type (str): Type of crop being grown
            field_area_ha (float): Field area in hectares
            
        Returns:
            list: Top 5 recommendations with priority, urgency, zone, action, etc.
        """
        recommendations = []
        
        # Get crop information
        crop = CropDatabase.get_crop(crop_type)
        crop_name = crop['name'] if crop else crop_type.title()
        
        # Check for critical stress zones
        critical_pct = zone_stats.get('Critical', {}).get('percentage', 0)
        if critical_pct > 10:
            water_req = CropDatabase.calculate_water_requirement(crop_type, field_area_ha, 'critical')
            water_amount_str = f"{water_req['water_mm']}mm ({water_req['liters_per_hectare']:,} L/hectare)" if water_req else '50-60% increase'
            
            growth_advice = CropDatabase.get_growth_stage_advice(crop_type)
            
            recommendations.append({
                'priority': 1,
                'urgency': 'CRITICAL',
                'zone': 'Critical',
                'action': f'URGENT irrigation required for {crop_name}',
                'reason': f'{critical_pct:.1f}% of field in critical stress',
                'water_amount': water_amount_str,
                'timing': 'Within 24 hours',
                'cost_impact': 'High',
                'growth_stage_note': growth_advice
            })
        
        # Check for high stress zones
        high_pct = zone_stats.get('High', {}).get('percentage', 0)
        if high_pct > 20:
            water_req = CropDatabase.calculate_water_requirement(crop_type, field_area_ha, 'high')
            water_amount_str = f"{water_req['water_mm']}mm ({water_req['liters_per_hectare']:,} L/hectare)" if water_req else '30-40% increase'
            
            recommendations.append({
                'priority': 2,
                'urgency': 'HIGH',
                'zone': 'High',
                'action': f'Increase irrigation for {crop_name}',
                'reason': f'{high_pct:.1f}% of field in high stress',
                'water_amount': water_amount_str,
                'timing': 'Within 48 hours',
                'cost_impact': 'Medium'
            })
        
        # Check for water deficit
        if deficit.get('status') == 'High':
            deficit_mm = deficit.get('deficit_mm', 0)
            liters_needed = int(deficit_mm * 10000 * field_area_ha)
            
            recommendations.append({
                'priority': 3,
                'urgency': 'HIGH',
                'zone': 'Field-wide',
                'action': f'General irrigation increase for {crop_name}',
                'reason': f'Water deficit of {deficit_mm:.1f}mm detected',
                'water_amount': f'{deficit_mm:.1f}mm ({liters_needed:,} L total)',
                'timing': 'Within 72 hours',
                'cost_impact': 'High'
            })
        
        # Check for uneven distribution
        quadrant_stresses = [q['stressed_percentage'] for q in quadrants.values()]
        if len(quadrant_stresses) > 0:
            stress_std = sum((s - sum(quadrant_stresses)/len(quadrant_stresses))**2 for s in quadrant_stresses) / len(quadrant_stresses)
            if stress_std > 100:  # High variance indicates uneven distribution
                recommendations.append({
                    'priority': 4,
                    'urgency': 'MODERATE',
                    'zone': 'Variable',
                    'action': 'Check irrigation system',
                    'reason': 'Uneven water distribution detected',
                    'water_amount': 'System check',
                    'timing': 'Within 1 week',
                    'cost_impact': 'Low'
                })
        
        # Healthy field recommendation
        healthy_pct = zone_stats.get('Healthy', {}).get('percentage', 0)
        if healthy_pct > 50 and deficit.get('status') == 'Low':
            # Crop-specific NDVI assessment
            ndvi_assessment = CropDatabase.assess_ndvi_for_crop(crop_type, ndvi_mean)
            
            recommendations.append({
                'priority': 5,
                'urgency': 'INFO',
                'zone': 'Field-wide',
                'action': f'Maintain current schedule for {crop_name}',
                'reason': f'{healthy_pct:.1f}% of field healthy, NDVI optimal for {crop_name}',
                'water_amount': 'No change',
                'timing': 'Continue monitoring',
                'cost_impact': 'None',
                'ndvi_status': ndvi_assessment['status']
            })
        
        # Sort by priority (lowest number = highest priority)
        recommendations.sort(key=lambda x: x['priority'])
        
        # Return top 5 recommendations
        return recommendations[:5]
    
    def calculate_water_savings(self, zone_stats, crop_type='wheat', field_area_ha=1.0):
        """
        Calculate potential water savings and current efficiency.
        
        Args:
            zone_stats (dict): Statistics for each stress zone
            crop_type (str): Type of crop being grown
            field_area_ha (float): Field area in hectares
            
        Returns:
            dict: Water savings and efficiency information
        """
        healthy_pct = zone_stats.get('Healthy', {}).get('percentage', 0)
        moderate_pct = zone_stats.get('Moderate', {}).get('percentage', 0)
        high_pct = zone_stats.get('High', {}).get('percentage', 0)
        critical_pct = zone_stats.get('Critical', {}).get('percentage', 0)
        
        # Get crop-specific water needs
        crop = CropDatabase.get_crop(crop_type)
        base_water_mm = crop['water_need_mm_per_week'] if crop else 40
        
        # Calculate current efficiency based on field health
        # Healthy areas = 100% efficient, stressed areas = less efficient
        current_efficiency = (
            (healthy_pct * 1.0) +      # Healthy = 100% efficient
            (moderate_pct * 0.7) +     # Moderate = 70% efficient
            (high_pct * 0.4) +         # High stress = 40% efficient
            (critical_pct * 0.2)       # Critical = 20% efficient
        )
        
        # Calculate potential water savings through optimization
        # Even stressed fields can save water through precision irrigation
        
        # Calculate water waste from over-irrigation in healthy zones
        healthy_savings = healthy_pct * 0.15  # Can reduce 15% in healthy areas
        
        # Calculate potential savings from fixing critical/high stress areas
        # These areas currently waste water due to poor distribution
        stress_savings = (critical_pct + high_pct) * 0.25  # 25% of stressed area water is wasted
        
        # Total savings percentage
        savings_pct = healthy_savings + stress_savings
        
        # Calculate actual water amounts
        if savings_pct > 0:
            # Calculate based on crop water needs
            total_water_mm = base_water_mm * 4  # Monthly water (4 weeks)
            savings_mm = total_water_mm * (savings_pct / 100)
            savings_liters = savings_mm * 10000 * field_area_ha  # Convert to liters
        else:
            savings_mm = base_water_mm * 0.1  # Minimum 10% savings from optimization
            savings_pct = 10.0
            savings_liters = savings_mm * 10000 * field_area_ha
        
        # Calculate water waste (inverse of efficiency)
        water_waste_pct = 100 - current_efficiency
        
        # Create detailed explanation
        if healthy_pct > 50:
            explanation = f'By optimizing irrigation in {healthy_pct:.1f}% healthy zones, you can save {savings_pct:.1f}% water'
        elif critical_pct > 20 or high_pct > 20:
            explanation = f'Precision irrigation can save {savings_pct:.1f}% by fixing water distribution in stressed zones'
        else:
            explanation = f'Zone-based irrigation optimization can save {savings_pct:.1f}% water monthly'
        
        return {
            'savings_percentage': round(float(savings_pct), 1),
            'savings_mm': round(float(savings_mm), 1),
            'savings_liters': int(savings_liters),
            'current_efficiency': round(float(current_efficiency), 1),
            'water_waste_percentage': round(float(water_waste_pct), 1),
            'explanation': explanation
        }