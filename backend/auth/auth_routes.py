from flask import Blueprint, request, jsonify
from auth.auth_service import (
    register_user, login_user, login_user_with_otp, 
    verify_login_otp, verify_mobile_number, reset_password
)
from auth.otp_service import create_otp, send_otp_sms
from auth.jwt_utils import verify_token, create_access_token, create_refresh_token, decode_token
from models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()
        full_name = data.get('full_name')
        mobile = data.get('mobile')
        password = data.get('password')
        email = data.get('email')
        
        if not all([full_name, mobile, password]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user, message = register_user(full_name, mobile, password, email)
        
        if not user:
            return jsonify({'error': message}), 400
        
        return jsonify({
            'message': message,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login with password"""
    try:
        data = request.get_json()
        mobile = data.get('mobile')
        password = data.get('password')
        
        if not all([mobile, password]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user, access_token, refresh_token, message = login_user(mobile, password)
        
        if not user:
            return jsonify({'error': message}), 401
        
        return jsonify({
            'message': message,
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    """Send OTP for login"""
    try:
        data = request.get_json()
        mobile = data.get('mobile')
        
        if not mobile:
            return jsonify({'error': 'Mobile number required'}), 400
        
        user, message = login_user_with_otp(mobile)
        
        if not user:
            return jsonify({'error': message}), 404
        
        return jsonify({'message': message}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login-otp', methods=['POST'])
def login_otp():
    """Login with OTP"""
    try:
        data = request.get_json()
        mobile = data.get('mobile')
        otp_code = data.get('otp_code')
        
        if not all([mobile, otp_code]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        user, access_token, refresh_token, message = verify_login_otp(mobile, otp_code)
        
        if not user:
            return jsonify({'error': message}), 401
        
        return jsonify({
            'message': message,
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """Verify mobile number with OTP"""
    try:
        data = request.get_json()
        mobile = data.get('mobile')
        otp_code = data.get('otp_code')
        
        if not all([mobile, otp_code]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        success, message = verify_mobile_number(mobile, otp_code)
        
        if not success:
            return jsonify({'error': message}), 400
        
        return jsonify({'message': message}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Send OTP for password reset"""
    try:
        data = request.get_json()
        mobile = data.get('mobile')
        
        if not mobile:
            return jsonify({'error': 'Mobile number required'}), 400
        
        user = User.query.filter_by(mobile=mobile).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        otp_code = create_otp(mobile, 'password_reset')
        send_otp_sms(mobile, otp_code)
        
        return jsonify({'message': 'OTP sent successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password_route():
    """Reset password with OTP"""
    try:
        data = request.get_json()
        mobile = data.get('mobile')
        otp_code = data.get('otp_code')
        new_password = data.get('new_password')
        
        if not all([mobile, otp_code, new_password]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        success, message = reset_password(mobile, new_password, otp_code)
        
        if not success:
            return jsonify({'error': message}), 400
        
        return jsonify({'message': message}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Refresh access token"""
    try:
        data = request.get_json()
        refresh_token = data.get('refresh_token')
        
        if not refresh_token:
            return jsonify({'error': 'Refresh token required'}), 400
        
        payload = decode_token(refresh_token)
        if not payload or payload.get('type') != 'refresh':
            return jsonify({'error': 'Invalid refresh token'}), 401
        
        access_token = create_access_token(payload['user_id'], payload['mobile'])
        
        return jsonify({'access_token': access_token}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """Get current user info"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        user = User.query.get(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout (client-side token removal)"""
    return jsonify({'message': 'Logged out successfully'}), 200