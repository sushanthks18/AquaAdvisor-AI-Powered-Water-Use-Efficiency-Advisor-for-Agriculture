from flask_bcrypt import Bcrypt
from models.user import User
from models.database import db
from auth.jwt_utils import create_access_token, create_refresh_token
from auth.otp_service import create_otp, verify_otp, send_otp_sms
import phonenumbers

bcrypt = Bcrypt()

def validate_mobile(mobile):
    """Validate mobile number format"""
    try:
        # Simple validation - just check if it's numeric and reasonable length
        cleaned = ''.join(filter(str.isdigit, mobile))
        return 10 <= len(cleaned) <= 15
    except:
        return False

def register_user(full_name, mobile, password, email=None):
    """Register a new user"""
    # Validate mobile
    if not validate_mobile(mobile):
        return None, "Invalid mobile number"
    
    # Check if user exists
    existing_user = User.query.filter_by(mobile=mobile).first()
    if existing_user:
        return None, "Mobile number already registered"
    
    # Hash password
    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # Create user
    user = User(
        full_name=full_name,
        mobile=mobile,
        email=email,
        password_hash=password_hash,
        mobile_verified=True  # Skip OTP verification for now
    )
    db.session.add(user)
    db.session.commit()
    
    # Skip OTP for now - causes timeout issues
    # otp_code = create_otp(mobile, 'verification')
    # send_otp_sms(mobile, otp_code)
    
    return user, "Registration successful. You can now login."

def login_user(mobile, password):
    """Login user with mobile and password"""
    user = User.query.filter_by(mobile=mobile).first()
    
    if not user:
        return None, None, None, "User not found"
    
    if not bcrypt.check_password_hash(user.password_hash, password):
        return None, None, None, "Invalid password"
    
    # Generate tokens
    access_token = create_access_token(user.id, user.mobile)
    refresh_token = create_refresh_token(user.id, user.mobile)
    
    return user, access_token, refresh_token, "Login successful"

def login_user_with_otp(mobile):
    """Send OTP for login"""
    user = User.query.filter_by(mobile=mobile).first()
    
    if not user:
        return None, "User not found"
    
    # Generate and send OTP
    otp_code = create_otp(mobile, 'login')
    send_otp_sms(mobile, otp_code)
    
    return user, "OTP sent successfully"

def verify_login_otp(mobile, otp_code):
    """Verify OTP and login"""
    success, message = verify_otp(mobile, otp_code, 'login')
    
    if not success:
        return None, None, None, message
    
    user = User.query.filter_by(mobile=mobile).first()
    if not user:
        return None, None, None, "User not found"
    
    # Generate tokens
    access_token = create_access_token(user.id, user.mobile)
    refresh_token = create_refresh_token(user.id, user.mobile)
    
    return user, access_token, refresh_token, "Login successful"

def verify_mobile_number(mobile, otp_code):
    """Verify user's mobile number"""
    success, message = verify_otp(mobile, otp_code, 'verification')
    
    if not success:
        return False, message
    
    user = User.query.filter_by(mobile=mobile).first()
    if user:
        user.mobile_verified = True
        db.session.commit()
    
    return True, "Mobile number verified successfully"

def reset_password(mobile, new_password, otp_code):
    """Reset user password"""
    success, message = verify_otp(mobile, otp_code, 'password_reset')
    
    if not success:
        return False, message
    
    user = User.query.filter_by(mobile=mobile).first()
    if not user:
        return False, "User not found"
    
    user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
    db.session.commit()
    
    return True, "Password reset successfully"