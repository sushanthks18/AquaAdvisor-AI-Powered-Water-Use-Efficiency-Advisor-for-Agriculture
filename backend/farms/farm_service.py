from models.database import db
from models.farm import Farm
from sqlalchemy import or_

def create_farm(user_id, farm_data):
    """Create a new farm"""
    try:
        farm = Farm(
            user_id=user_id,
            farm_name=farm_data.get('farm_name'),
            registration_number=farm_data.get('registration_number'),
            survey_number=farm_data.get('survey_number'),
            district=farm_data.get('district'),
            boundary_coordinates=farm_data.get('boundary_coordinates'),
            area_hectares=farm_data.get('area_hectares'),
            verification_status='pending'
        )
        db.session.add(farm)
        db.session.commit()
        return farm, None
    except Exception as e:
        db.session.rollback()
        return None, str(e)

def get_user_farms(user_id):
    """Get all farms for a user"""
    farms = Farm.query.filter_by(user_id=user_id).order_by(Farm.created_at.desc()).all()
    return [farm.to_dict() for farm in farms]

def get_farm_by_id(farm_id, user_id):
    """Get a specific farm"""
    farm = Farm.query.filter_by(id=farm_id, user_id=user_id).first()
    return farm

def update_farm(farm_id, user_id, farm_data):
    """Update farm details"""
    try:
        farm = get_farm_by_id(farm_id, user_id)
        if not farm:
            return None, "Farm not found"
        
        if 'farm_name' in farm_data:
            farm.farm_name = farm_data['farm_name']
        if 'registration_number' in farm_data:
            farm.registration_number = farm_data['registration_number']
        if 'survey_number' in farm_data:
            farm.survey_number = farm_data['survey_number']
        if 'district' in farm_data:
            farm.district = farm_data['district']
        if 'boundary_coordinates' in farm_data:
            farm.boundary_coordinates = farm_data['boundary_coordinates']
        if 'area_hectares' in farm_data:
            farm.area_hectares = farm_data['area_hectares']
        
        db.session.commit()
        return farm, None
    except Exception as e:
        db.session.rollback()
        return None, str(e)

def delete_farm(farm_id, user_id):
    """Delete a farm"""
    try:
        farm = get_farm_by_id(farm_id, user_id)
        if not farm:
            return False, "Farm not found"
        
        db.session.delete(farm)
        db.session.commit()
        return True, "Farm deleted successfully"
    except Exception as e:
        db.session.rollback()
        return False, str(e)

def search_farms(user_id, query, search_type='name'):
    """Search farms by name, registration number, or district
    
    Args:
        user_id: User ID
        query: Search query string
        search_type: Type of search - 'name', 'location', 'registration'
    """
    search_pattern = f"%{query}%"
    
    # Build query based on search type
    if search_type == 'registration':
        # For registration/survey search, search ALL farms (not just user's)
        # This allows discovering existing farms by survey number
        farms = Farm.query.filter(
            or_(
                Farm.registration_number.ilike(search_pattern),
                Farm.survey_number.ilike(search_pattern)
            )
        ).all()
    elif search_type == 'location':
        # Search by location fields - search all farms
        farms = Farm.query.filter(
            Farm.district.ilike(search_pattern)
        ).all()
    else:
        # Default: search user's farms first, then all farms
        user_farms = Farm.query.filter(
            Farm.user_id == user_id,
            or_(
                Farm.farm_name.ilike(search_pattern),
                Farm.registration_number.ilike(search_pattern),
                Farm.district.ilike(search_pattern),
                Farm.survey_number.ilike(search_pattern)
            )
        ).all()
        
        # If no user farms found, search all farms
        if not user_farms:
            farms = Farm.query.filter(
                or_(
                    Farm.farm_name.ilike(search_pattern),
                    Farm.registration_number.ilike(search_pattern),
                    Farm.district.ilike(search_pattern),
                    Farm.survey_number.ilike(search_pattern)
                )
            ).limit(10).all()  # Limit to 10 results
        else:
            farms = user_farms
    
    # Sort: user's farms first, then others
    farms_list = [farm.to_dict() for farm in farms]
    farms_list.sort(key=lambda x: (x['user_id'] != user_id, x.get('farm_name', '')))
    
    return farms_list