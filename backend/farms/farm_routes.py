from flask import Blueprint, request, jsonify
from middleware.auth_middleware import token_required
from farms.farm_service import (
    create_farm, get_user_farms, get_farm_by_id,
    update_farm, delete_farm, search_farms
)
from farms.land_records_integration import verify_survey_number, fetch_land_boundaries

farms_bp = Blueprint('farms', __name__)

@farms_bp.route('/my-farms', methods=['GET'])
@token_required
def get_my_farms(current_user):
    """Get all farms for the current user"""
    try:
        farms = get_user_farms(current_user.id)
        return jsonify({'farms': farms}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@farms_bp.route('/register', methods=['POST'])
@token_required
def register_farm(current_user):
    """Register a new farm"""
    try:
        data = request.get_json()
        
        required_fields = ['farm_name', 'boundary_coordinates']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        farm, error = create_farm(current_user.id, data)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Farm registered successfully',
            'farm': farm.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@farms_bp.route('/<int:farm_id>', methods=['GET'])
@token_required
def get_farm(current_user, farm_id):
    """Get a specific farm"""
    try:
        farm = get_farm_by_id(farm_id, current_user.id)
        
        if not farm:
            return jsonify({'error': 'Farm not found'}), 404
        
        return jsonify({'farm': farm.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@farms_bp.route('/<int:farm_id>', methods=['PUT'])
@token_required
def update_farm_route(current_user, farm_id):
    """Update farm details"""
    try:
        data = request.get_json()
        
        farm, error = update_farm(farm_id, current_user.id, data)
        
        if error:
            return jsonify({'error': error}), 400
        
        return jsonify({
            'message': 'Farm updated successfully',
            'farm': farm.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@farms_bp.route('/<int:farm_id>', methods=['DELETE'])
@token_required
def delete_farm_route(current_user, farm_id):
    """Delete a farm"""
    try:
        success, message = delete_farm(farm_id, current_user.id)
        
        if not success:
            return jsonify({'error': message}), 400
        
        return jsonify({'message': message}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@farms_bp.route('/search', methods=['POST'])
@token_required
def search_farms_route(current_user):
    """Search farms with location fallback"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        search_type = data.get('search_type', 'name')  # 'name', 'location', 'registration'
        
        if not query:
            # Return all farms if no query
            farms = get_user_farms(current_user.id)
        else:
            farms = search_farms(current_user.id, query, search_type)
        
        # If no farms found and it's a location/name search, create a demo farm for that location
        if not farms and search_type in ['name', 'location']:
            from farms.land_records_integration import create_demo_farm_from_location
            demo_farm = create_demo_farm_from_location(query)
            if demo_farm:
                farms = [demo_farm]
        
        return jsonify({'farms': farms}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@farms_bp.route('/select', methods=['POST'])
@token_required
def select_farm_route(current_user):
    """Mark a farm as selected for analysis"""
    try:
        data = request.get_json()
        farm_id = data.get('farm_id')
        
        if not farm_id:
            return jsonify({'error': 'farm_id is required'}), 400
        
        # Handle demo farms (id = 0 or negative)
        if farm_id == 0 or farm_id < 0:
            return jsonify({
                'success': True,
                'message': 'Demo farm selected'
            }), 200
        
        farm = get_farm_by_id(farm_id, current_user.id)
        
        if not farm:
            return jsonify({'error': 'Farm not found or access denied'}), 404
        
        return jsonify({
            'success': True,
            'farm': farm.to_dict()
        }), 200
        
    except Exception as e:
        print(f"Error in select_farm_route: {e}")
        return jsonify({'error': str(e)}), 500

@farms_bp.route('/verify-survey', methods=['POST'])
@token_required
def verify_survey(current_user):
    """Verify survey number with land records"""
    try:
        data = request.get_json()
        survey_number = data.get('survey_number')
        district = data.get('district')
        taluk = data.get('taluk')
        village = data.get('village')
        
        if not all([survey_number, district]):
            return jsonify({'error': 'Survey number and district are required'}), 400
        
        # Verify with land records (real API or mock)
        verification_data = verify_survey_number(
            survey_number=survey_number,
            district=district,
            taluk=taluk,
            village=village
        )
        
        if not verification_data.get('verified'):
            return jsonify({
                'verified': False,
                'error': verification_data.get('error', 'Survey number not found'),
                'survey_number': survey_number,
                'district': district
            }), 404
        
        # Fetch boundaries if verified
        boundaries = fetch_land_boundaries(
            survey_number=survey_number,
            district=district,
            taluk=taluk,
            village=village
        )
        
        result = {
            **verification_data,
            'boundary_coordinates': boundaries.get('coordinates', []),
            'area_hectares': boundaries.get('area_hectares', verification_data.get('area_hectares', 0)),
            'boundary_source': boundaries.get('source', 'Government Records')
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500