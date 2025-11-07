# API Documentation

## Overview
The AquaAdvisor API provides endpoints for analyzing agricultural fields using satellite imagery and generating irrigation recommendations. The API is organized around REST principles and returns JSON responses.

## Base URL
```
http://localhost:5000/api
```

## Authentication
No authentication is required for the API endpoints. However, API keys for Sentinel Hub and OpenWeatherMap must be configured in the backend environment.

## Endpoints

### Health Check
#### `GET /api/health`
Check the health status of the API and its dependent services.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "services": {
    "satellite_api": true,
    "weather_api": true
  }
}
```

### Full Field Analysis
#### `POST /api/analyze`
Perform a complete analysis of a field including satellite data processing, weather integration, and recommendation generation.

**Request Body:**
```json
{
  "field_boundary": [
    [lat, lon],
    [lat, lon],
    ...
  ],
  "analysis_date": "YYYY-MM-DD",
  "use_sample": boolean
}
```

**Parameters:**
- `field_boundary` (required): Array of [latitude, longitude] coordinates defining the field boundary. The polygon must be closed (first and last points must be the same).
- `analysis_date` (optional): Date for which to perform the analysis. Defaults to current date.
- `use_sample` (optional): If true, uses sample satellite data instead of fetching from Sentinel Hub. Defaults to false.

**Response:**
```json
{
  "metadata": {
    "timestamp": "ISO 8601 timestamp",
    "analysis_date": "YYYY-MM-DD",
    "field_area_hectares": number,
    "health_score": number
  },
  "ndvi_map": "base64_encoded_png",
  "stress_map": "base64_encoded_png",
  "statistics": {
    "mean": number,
    "median": number,
    "std": number,
    "min": number,
    "max": number,
    "p25": number,
    "p75": number
  },
  "zone_distribution": {
    "Critical": {
      "percentage": number,
      "mean_ndvi": number,
      "color": "red"
    },
    "High": {
      "percentage": number,
      "mean_ndvi": number,
      "color": "orange"
    },
    "Moderate": {
      "percentage": number,
      "mean_ndvi": number,
      "color": "yellow"
    },
    "Healthy": {
      "percentage": number,
      "mean_ndvi": number,
      "color": "green"
    }
  },
  "quadrant_analysis": {
    "NW": {
      "mean_ndvi": number,
      "stressed_percentage": number
    },
    "NE": {
      "mean_ndvi": number,
      "stressed_percentage": number
    },
    "SW": {
      "mean_ndvi": number,
      "stressed_percentage": number
    },
    "SE": {
      "mean_ndvi": number,
      "stressed_percentage": number
    }
  },
  "weather": {
    "temperature": number,
    "humidity": number,
    "description": string,
    "wind_speed": number,
    "wind_direction": number
  },
  "water_deficit": {
    "deficit_mm": number,
    "status": "High|Moderate|Low",
    "et0_weekly": number,
    "rainfall": number
  },
  "recommendations": [
    {
      "priority": number,
      "urgency": "CRITICAL|HIGH|MODERATE|MAINTENANCE|INFO",
      "zone": string,
      "action": string,
      "reason": string,
      "water_amount": string,
      "timing": string,
      "cost_impact": string
    }
  ],
  "water_efficiency": {
    "savings_percentage": number,
    "savings_mm": number,
    "explanation": string
  }
}
```

### Quick Field Analysis
#### `POST /api/quick-analysis`
Perform a lightweight analysis using sample data for faster results.

**Request Body:**
```json
{
  "field_boundary": [
    [lat, lon],
    [lat, lon],
    ...
  ]
}
```

**Parameters:**
- `field_boundary` (required): Array of [latitude, longitude] coordinates defining the field boundary.

**Response:**
```json
{
  "metadata": {
    "timestamp": "ISO 8601 timestamp",
    "field_area_hectares": number,
    "health_score": number
  },
  "statistics": {
    "mean": number,
    "median": number,
    "std": number,
    "min": number,
    "max": number,
    "p25": number,
    "p75": number
  },
  "zone_distribution": {
    "Critical": {
      "percentage": number,
      "mean_ndvi": number,
      "color": "red"
    },
    "High": {
      "percentage": number,
      "mean_ndvi": number,
      "color": "orange"
    },
    "Moderate": {
      "percentage": number,
      "mean_ndvi": number,
      "color": "yellow"
    },
    "Healthy": {
      "percentage": number,
      "mean_ndvi": number,
      "color": "green"
    }
  },
  "weather": {
    "temperature": number,
    "humidity": number,
    "description": string,
    "wind_speed": number,
    "wind_direction": number
  },
  "water_deficit": {
    "deficit_mm": number,
    "status": "High|Moderate|Low",
    "et0_weekly": number,
    "rainfall": number
  },
  "recommendations": [
    {
      "priority": number,
      "urgency": "CRITICAL|HIGH|MODERATE|MAINTENANCE|INFO",
      "zone": string,
      "action": string,
      "reason": string,
      "water_amount": string,
      "timing": string,
      "cost_impact": string
    }
  ],
  "water_efficiency": {
    "savings_percentage": number,
    "savings_mm": number,
    "explanation": string
  }
}
```

## Error Handling

All errors are returned with appropriate HTTP status codes and JSON error objects:

```json
{
  "error": "Error message",
  "details": "Additional details about the error"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `500`: Internal Server Error

## Examples

### cURL
```bash
# Health check
curl -X GET http://localhost:5000/api/health

# Full analysis with sample data
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "field_boundary": [[36.6, -120.4], [36.6, -120.35], [36.55, -120.35], [36.55, -120.4], [36.6, -120.4]],
    "use_sample": true
  }'

# Quick analysis
curl -X POST http://localhost:5000/api/quick-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "field_boundary": [[36.6, -120.4], [36.6, -120.35], [36.55, -120.35], [36.55, -120.4], [36.6, -120.4]]
  }'
```

### Python
```python
import requests

# Health check
response = requests.get('http://localhost:5000/api/health')
print(response.json())

# Full analysis
data = {
    "field_boundary": [[36.6, -120.4], [36.6, -120.35], [36.55, -120.35], [36.55, -120.4], [36.6, -120.4]],
    "use_sample": True
}
response = requests.post('http://localhost:5000/api/analyze', json=data)
print(response.json())

# Quick analysis
data = {
    "field_boundary": [[36.6, -120.4], [36.6, -120.35], [36.55, -120.35], [36.55, -120.4], [36.6, -120.4]]
}
response = requests.post('http://localhost:5000/api/quick-analysis', json=data)
print(response.json())
```

### JavaScript
```javascript
// Health check
fetch('http://localhost:5000/api/health')
  .then(response => response.json())
  .then(data => console.log(data));

// Full analysis
const data = {
  field_boundary: [[36.6, -120.4], [36.6, -120.35], [36.55, -120.35], [36.55, -120.4], [36.6, -120.4]],
  use_sample: true
};
fetch('http://localhost:5000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
  .then(response => response.json())
  .then(data => console.log(data));

// Quick analysis
const quickData = {
  field_boundary: [[36.6, -120.4], [36.6, -120.35], [36.55, -120.35], [36.55, -120.4], [36.6, -120.4]]
};
fetch('http://localhost:5000/api/quick-analysis', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(quickData)
})
  .then(response => response.json())
  .then(data => console.log(data));
```