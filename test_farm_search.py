import requests
import json

# Test the farm search endpoint
data = {'registration_number': 'TEST123'}
response = requests.post('http://localhost:5000/api/farm-search', json=data)

print(f"Status Code: {response.status_code}")
print("Response:")
print(json.dumps(response.json(), indent=2))