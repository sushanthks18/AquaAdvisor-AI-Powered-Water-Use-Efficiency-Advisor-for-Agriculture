from models.database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), nullable=False)
    mobile = db.Column(db.String(20), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255))
    password_hash = db.Column(db.String(255), nullable=False)
    mobile_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    farms = db.relationship('Farm', backref='owner', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert user object to dictionary"""
        return {
            'id': self.id,
            'full_name': self.full_name,
            'mobile': self.mobile,
            'email': self.email,
            'mobile_verified': self.mobile_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }