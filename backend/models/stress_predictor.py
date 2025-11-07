"""
ML-based Water Stress Prediction Model
Uses RandomForestClassifier to predict future stress based on current conditions and weather forecast.
"""

import numpy as np
import pickle
import os
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


class StressPredictor:
    """Machine Learning model for predicting water stress."""
    
    def __init__(self, model_path='models/stress_model.pkl'):
        """
        Initialize the stress predictor.
        
        Args:
            model_path (str): Path to save/load the model
        """
        self.model_path = model_path
        self.model = None
        self.feature_importance = None
        
        # Load model if it exists
        if os.path.exists(model_path):
            self.load_model()
    
    def generate_synthetic_data(self, n_samples=5000):
        """
        Generate synthetic training data with realistic patterns.
        
        Args:
            n_samples (int): Number of samples to generate
            
        Returns:
            tuple: (X_features, y_labels)
        """
        np.random.seed(42)
        
        # Features: NDVI, temperature, humidity, rainfall, days_since_rain
        X = np.zeros((n_samples, 5))
        y = np.zeros(n_samples, dtype=int)
        
        for i in range(n_samples):
            # Generate correlated features
            # NDVI: 0.1 to 0.9
            ndvi = np.random.uniform(0.1, 0.9)
            
            # Temperature: 15°C to 45°C (higher temp = more stress)
            temp = np.random.uniform(15, 45)
            
            # Humidity: 20% to 90% (lower humidity = more stress)
            humidity = np.random.uniform(20, 90)
            
            # Rainfall last 7 days: 0mm to 100mm
            rainfall = np.random.exponential(scale=15)
            rainfall = min(rainfall, 100)
            
            # Days since last rain: 0 to 30
            days_since_rain = np.random.poisson(lam=7)
            days_since_rain = min(days_since_rain, 30)
            
            # Create realistic correlations
            if rainfall > 20:
                # Recent good rain
                ndvi = min(ndvi + np.random.uniform(0.1, 0.3), 0.9)
                days_since_rain = max(0, days_since_rain - 5)
                humidity = min(humidity + np.random.uniform(10, 20), 90)
            
            if temp > 35:
                # High temperature stress
                ndvi = max(ndvi - np.random.uniform(0.1, 0.25), 0.1)
                humidity = max(humidity - np.random.uniform(10, 20), 20)
            
            if days_since_rain > 15:
                # Prolonged drought
                ndvi = max(ndvi - np.random.uniform(0.15, 0.35), 0.1)
                humidity = max(humidity - np.random.uniform(15, 25), 20)
            
            # Store features
            X[i] = [ndvi, temp, humidity, rainfall, days_since_rain]
            
            # Determine stress level (0=low, 1=medium, 2=high)
            stress_score = 0
            
            # NDVI contribution
            if ndvi < 0.3:
                stress_score += 3
            elif ndvi < 0.5:
                stress_score += 2
            elif ndvi < 0.6:
                stress_score += 1
            
            # Temperature contribution
            if temp > 38:
                stress_score += 2
            elif temp > 32:
                stress_score += 1
            
            # Humidity contribution
            if humidity < 35:
                stress_score += 2
            elif humidity < 50:
                stress_score += 1
            
            # Rainfall contribution
            if rainfall < 5:
                stress_score += 2
            elif rainfall < 15:
                stress_score += 1
            
            # Days since rain contribution
            if days_since_rain > 20:
                stress_score += 2
            elif days_since_rain > 10:
                stress_score += 1
            
            # Map to stress levels
            if stress_score >= 7:
                y[i] = 2  # High stress
            elif stress_score >= 4:
                y[i] = 1  # Medium stress
            else:
                y[i] = 0  # Low stress
        
        return X, y
    
    def train_model(self, X=None, y=None):
        """
        Train the Random Forest model.
        
        Args:
            X (numpy.array): Feature matrix (optional, generates synthetic if None)
            y (numpy.array): Label vector (optional, generates synthetic if None)
            
        Returns:
            dict: Training metrics
        """
        # Generate synthetic data if not provided
        if X is None or y is None:
            print("Generating synthetic training data...")
            X, y = self.generate_synthetic_data(n_samples=5000)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Train Random Forest
        print("Training Random Forest model...")
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Feature importance
        self.feature_importance = {
            'NDVI': float(self.model.feature_importances_[0]),
            'Temperature': float(self.model.feature_importances_[1]),
            'Humidity': float(self.model.feature_importances_[2]),
            'Rainfall': float(self.model.feature_importances_[3]),
            'Days Since Rain': float(self.model.feature_importances_[4])
        }
        
        print(f"Model trained! Accuracy: {accuracy:.2%}")
        print(f"Feature importance: {self.feature_importance}")
        
        # Save model
        self.save_model()
        
        return {
            'accuracy': float(accuracy),
            'feature_importance': self.feature_importance,
            'train_samples': len(X_train),
            'test_samples': len(X_test)
        }
    
    def predict_stress(self, current_ndvi, weather_forecast):
        """
        Predict stress for the next 7 days.
        
        Args:
            current_ndvi (float): Current NDVI value
            weather_forecast (list): List of 7-day weather forecasts
                Each item: {'temp': float, 'humidity': float, 'rainfall': float}
            
        Returns:
            dict: Prediction results with probabilities and risk levels
        """
        if self.model is None:
            raise ValueError("Model not loaded. Please train or load a model first.")
        
        predictions = []
        days_since_rain = 0
        cumulative_rainfall = 0
        
        for day_idx, forecast in enumerate(weather_forecast[:7]):
            temp = forecast.get('temp', 25)
            humidity = forecast.get('humidity', 60)
            rainfall = forecast.get('rainfall', 0)
            
            # Update days since rain
            if rainfall > 5:
                days_since_rain = 0
                cumulative_rainfall = rainfall
            else:
                days_since_rain += 1
                cumulative_rainfall = max(0, cumulative_rainfall - 2)  # Evaporation
            
            # Estimate NDVI for future day (simple degradation model)
            # NDVI degrades with stress, improves with rain
            estimated_ndvi = current_ndvi
            if rainfall > 10:
                estimated_ndvi = min(0.9, estimated_ndvi + 0.02 * (day_idx + 1))
            elif temp > 35 or days_since_rain > 7:
                estimated_ndvi = max(0.1, estimated_ndvi - 0.015 * (day_idx + 1))
            
            # Prepare features
            features = np.array([[
                estimated_ndvi,
                temp,
                humidity,
                cumulative_rainfall,
                days_since_rain
            ]])
            
            # Predict
            stress_class = self.model.predict(features)[0]
            stress_proba = self.model.predict_proba(features)[0]
            
            # Map to risk levels
            risk_levels = ['low', 'medium', 'high']
            risk_level = risk_levels[stress_class]
            
            predictions.append({
                'day': day_idx + 1,
                'stress_class': int(stress_class),
                'stress_probability': float(stress_proba[stress_class]),
                'risk_level': risk_level,
                'confidence_score': float(max(stress_proba)),
                'estimated_ndvi': round(estimated_ndvi, 3),
                'temp': temp,
                'humidity': humidity,
                'rainfall': rainfall,
                'days_since_rain': days_since_rain
            })
        
        # Overall summary
        high_stress_days = sum(1 for p in predictions if p['stress_class'] == 2)
        avg_stress_prob = np.mean([p['stress_probability'] for p in predictions])
        
        # Determine overall risk
        if high_stress_days >= 3:
            overall_risk = 'high'
            recommendation = 'URGENT: High stress risk detected. Increase irrigation immediately.'
        elif high_stress_days >= 1:
            overall_risk = 'medium'
            recommendation = 'MODERATE: Monitor closely and prepare for additional irrigation.'
        else:
            overall_risk = 'low'
            recommendation = 'LOW: Continue current irrigation schedule. Monitor conditions.'
        
        return {
            'daily_predictions': predictions,
            'summary': {
                'overall_risk': overall_risk,
                'high_stress_days': high_stress_days,
                'average_stress_probability': round(avg_stress_prob, 3),
                'recommendation': recommendation,
                'confidence': round(np.mean([p['confidence_score'] for p in predictions]), 3)
            },
            'feature_importance': self.feature_importance
        }
    
    def save_model(self):
        """Save the trained model to disk."""
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        
        with open(self.model_path, 'wb') as f:
            pickle.dump({
                'model': self.model,
                'feature_importance': self.feature_importance
            }, f)
        
        print(f"Model saved to {self.model_path}")
    
    def load_model(self):
        """Load a trained model from disk."""
        try:
            with open(self.model_path, 'rb') as f:
                data = pickle.load(f)
                self.model = data['model']
                self.feature_importance = data['feature_importance']
            print(f"Model loaded from {self.model_path}")
        except FileNotFoundError:
            print(f"Model file not found at {self.model_path}")
        except Exception as e:
            print(f"Error loading model: {e}")


# Train model on module import if it doesn't exist
def initialize_model():
    """Initialize and train the model if it doesn't exist."""
    model_path = 'models/stress_model.pkl'
    
    if not os.path.exists(model_path):
        print("Training initial stress prediction model...")
        predictor = StressPredictor(model_path)
        predictor.train_model()
        return predictor
    else:
        return StressPredictor(model_path)


if __name__ == '__main__':
    # Train and test the model
    predictor = initialize_model()
    
    # Test prediction
    test_forecast = [
        {'temp': 35, 'humidity': 45, 'rainfall': 0},
        {'temp': 36, 'humidity': 42, 'rainfall': 0},
        {'temp': 37, 'humidity': 40, 'rainfall': 0},
        {'temp': 34, 'humidity': 50, 'rainfall': 15},
        {'temp': 30, 'humidity': 65, 'rainfall': 5},
        {'temp': 28, 'humidity': 70, 'rainfall': 0},
        {'temp': 29, 'humidity': 68, 'rainfall': 0}
    ]
    
    result = predictor.predict_stress(current_ndvi=0.45, weather_forecast=test_forecast)
    print("\n=== Test Prediction ===")
    print(f"Overall Risk: {result['summary']['overall_risk']}")
    print(f"Recommendation: {result['summary']['recommendation']}")
