import random
import string
from datetime import datetime, timedelta
from models.database import db
from models.farm import OTPVerification
import os

def generate_otp():
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def create_otp(mobile, purpose='verification'):
    """Create and store OTP for mobile number"""
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Invalidate previous OTPs
    OTPVerification.query.filter_by(
        mobile=mobile,
        purpose=purpose,
        is_used=False
    ).update({'is_used': True})
    
    # Create new OTP
    otp_record = OTPVerification(
        mobile=mobile,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at
    )
    db.session.add(otp_record)
    db.session.commit()
    
    return otp_code

def verify_otp(mobile, otp_code, purpose='verification'):
    """Verify OTP for mobile number"""
    otp_record = OTPVerification.query.filter_by(
        mobile=mobile,
        otp_code=otp_code,
        purpose=purpose,
        is_used=False
    ).first()
    
    if not otp_record:
        return False, "Invalid OTP"
    
    if datetime.utcnow() > otp_record.expires_at:
        return False, "OTP has expired"
    
    # Mark as used
    otp_record.is_used = True
    db.session.commit()
    
    return True, "OTP verified successfully"

def send_otp_sms(mobile, otp_code):
    """Send OTP via SMS (Twilio integration)"""
    # For development, just print the OTP
    print(f"OTP for {mobile}: {otp_code}")
    
    # Production implementation:
    # from twilio.rest import Client
    # client = Client(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN'))
    # message = client.messages.create(
    #     body=f"Your AquaAdvisor OTP is: {otp_code}. Valid for 10 minutes.",
    #     from_=os.getenv('TWILIO_PHONE_NUMBER'),
    #     to=mobile
    # )
    
    return True