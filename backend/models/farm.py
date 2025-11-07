from models.database import db
from datetime import datetime
import json

class Farm(db.Model):
    __tablename__ = 'farms'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    farm_name = db.Column(db.String(255), nullable=False)
    registration_number = db.Column(db.String(100))
    survey_number = db.Column(db.String(100))
    district = db.Column(db.String(255))
    boundary_coordinates = db.Column(db.JSON)
    area_hectares = db.Column(db.Numeric(10, 2))
    verification_status = db.Column(db.String(50), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert farm object to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'farm_name': self.farm_name,
            'registration_number': self.registration_number,
            'survey_number': self.survey_number,
            'district': self.district,
            'boundary_coordinates': self.boundary_coordinates,
            'area': float(self.area_hectares) if self.area_hectares else None,
            'area_hectares': float(self.area_hectares) if self.area_hectares else None,
            'verification_status': self.verification_status,
            'verified': self.verification_status == 'verified',
            'village': None,  # Placeholder for future enhancement
            'taluk': None,  # Placeholder for future enhancement
            'crop_type': None,  # Placeholder for future enhancement
            'last_analysis_date': None,  # Placeholder for future enhancement
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class OTPVerification(db.Model):
    __tablename__ = 'otp_verification'
    
    id = db.Column(db.Integer, primary_key=True)
    mobile = db.Column(db.String(20), nullable=False)
    otp_code = db.Column(db.String(6), nullable=False)
    purpose = db.Column(db.String(50), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)