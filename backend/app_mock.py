import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
from config import FLASK_ENV

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Simple mock auth endpoints for demo
@app.route('/api/auth/signup', methods=['POST'])
def mock_signup():
    """Mock signup endpoint for demo purposes"""
    try:
        data = request.get_json()
        return jsonify({
            'message': 'Registration successful! You can now login.',
            'user': {
                'id': 1,
                'full_name': data.get('full_name', 'User'),
                'mobile': data.get('mobile', ''),
                'email': data.get('email', '')
            }
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def mock_login():
    """Mock login endpoint for demo purposes"""
    try:
        data = request.get_json()
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': 1,
                'full_name': 'Demo User',
                'mobile': data.get('mobile', ''),
                'email': 'demo@example.com'
            },
            'access_token': 'demo_access_token_12345',
            'refresh_token': 'demo_refresh_token_67890'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'services': {
            'satellite_api': True,
            'weather_api': True
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=(FLASK_ENV == 'development'))