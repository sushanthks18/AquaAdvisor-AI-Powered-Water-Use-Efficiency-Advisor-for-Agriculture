import requests
import json

# Test the farm search endpoint with a different registration number
data = {'registration_number': 'FARM001'}
response = requests.post('http://localhost:5000/api/farm-search', json=data)

print(f"Status Code: {response.status_code}")
result = response.json()
print(f"Number of zones: {len(result['stress_zones'])}")
print("Zone details:")
for i, zone in enumerate(result['stress_zones']):
    print(f"  Zone {zone['zone_id']}: {zone['stress_level']} - {len(zone['coordinates'])} coordinates")