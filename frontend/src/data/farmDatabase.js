// Mock farm database with realistic data
export const mockFarmDatabase = [
  {
    farmId: "FARM001",
    name: "Rajesh Farm",
    location: {
      address: "Thanjavur Rural, Tamil Nadu",
      coordinates: { lat: 10.8234, lng: 79.1956 } // Rural rice fields
    },
    area: { value: 12.5, unit: "acres" },
    cropType: "Rice",
    boundary: [ // Irregular organic shape (like real farm)
      { lat: 10.8234, lng: 79.1956 },
      { lat: 10.8268, lng: 79.1962 },
      { lat: 10.8275, lng: 79.2008 },
      { lat: 10.8242, lng: 79.2015 },
      { lat: 10.8230, lng: 79.1990 }
    ],
    stressZones: [
      {
        zoneId: 1,
        location: "NE Corner",
        stressLevel: "critical",
        healthScore: 15,
        ndviValue: 0.25,
        soilMoisture: 15,
        coordinates: [
          { lat: 10.7883, lng: 79.1400 },
          { lat: 10.7895, lng: 79.1400 },
          { lat: 10.7895, lng: 79.1420 },
          { lat: 10.7883, lng: 79.1420 }
        ],
        irrigationRecommendation: {
          priority: "urgent",
          action: "increase",
          percentage: 50,
          waterAmount: "600L/day",
          schedule: ["5:30-8:00 AM", "5:00-7:30 PM"],
          reason: "Severe water stress detected"
        }
      },
      {
        zoneId: 2,
        location: "NW Corner",
        stressLevel: "high",
        healthScore: 35,
        ndviValue: 0.42,
        soilMoisture: 28,
        coordinates: [
          { lat: 10.7883, lng: 79.1378 },
          { lat: 10.7895, lng: 79.1378 },
          { lat: 10.7895, lng: 79.1400 },
          { lat: 10.7883, lng: 79.1400 }
        ],
        irrigationRecommendation: {
          priority: "high",
          action: "increase",
          percentage: 40,
          waterAmount: "500L/day",
          schedule: ["6:00-8:00 AM", "5:30-7:00 PM"],
          reason: "High water stress"
        }
      },
      {
        zoneId: 3,
        location: "Center",
        stressLevel: "moderate",
        healthScore: 55,
        ndviValue: 0.58,
        soilMoisture: 45,
        coordinates: [
          { lat: 10.7870, lng: 79.1389 },
          { lat: 10.7883, lng: 79.1389 },
          { lat: 10.7883, lng: 79.1410 },
          { lat: 10.7870, lng: 79.1410 }
        ],
        irrigationRecommendation: {
          priority: "medium",
          action: "increase",
          percentage: 15,
          waterAmount: "250L/day",
          schedule: ["6:00-7:30 AM"],
          reason: "Moderate stress, monitor closely"
        }
      },
      {
        zoneId: 4,
        location: "SW Corner",
        stressLevel: "healthy",
        healthScore: 72,
        ndviValue: 0.71,
        soilMoisture: 65,
        coordinates: [
          { lat: 10.7870, lng: 79.1378 },
          { lat: 10.7883, lng: 79.1378 },
          { lat: 10.7883, lng: 79.1389 },
          { lat: 10.7870, lng: 79.1389 }
        ],
        irrigationRecommendation: {
          priority: "low",
          action: "maintain",
          percentage: 0,
          waterAmount: "300L/day",
          schedule: ["6:00-7:00 AM"],
          reason: "Healthy vegetation, maintain current"
        }
      },
      {
        zoneId: 5,
        location: "SE Corner",
        stressLevel: "optimal",
        healthScore: 88,
        ndviValue: 0.84,
        soilMoisture: 78,
        coordinates: [
          { lat: 10.7870, lng: 79.1410 },
          { lat: 10.7883, lng: 79.1410 },
          { lat: 10.7883, lng: 79.1420 },
          { lat: 10.7870, lng: 79.1420 }
        ],
        irrigationRecommendation: {
          priority: "low",
          action: "decrease",
          percentage: 20,
          waterAmount: "200L/day",
          schedule: ["6:30-7:00 AM"],
          reason: "Risk of overwatering"
        }
      }
    ],
    overallHealth: 68
  },
  {
    farmId: "FARM002",
    name: "Kumar Agriculture",
    location: {
      address: "Salem Rural, Tamil Nadu",
      coordinates: { lat: 11.7145, lng: 78.2234 } // Rural cotton fields
    },
    area: { value: 18.3, unit: "acres" },
    cropType: "Cotton",
    boundary: [ // Irregular pentagon (organic farm shape)
      { lat: 11.7145, lng: 78.2260 },
      { lat: 11.7165, lng: 78.2238 },
      { lat: 11.7182, lng: 78.2268 },
      { lat: 11.7175, lng: 78.2305 },
      { lat: 11.7152, lng: 78.2295 }
    ],
    stressZones: [
      {
        zoneId: 1,
        location: "North Section",
        stressLevel: "high",
        healthScore: 32,
        ndviValue: 0.38,
        soilMoisture: 25,
        coordinates: [
          { lat: 11.6657, lng: 78.1460 },
          { lat: 11.6670, lng: 78.1460 },
          { lat: 11.6670, lng: 78.1510 },
          { lat: 11.6657, lng: 78.1510 }
        ],
        irrigationRecommendation: {
          priority: "high",
          action: "increase",
          percentage: 45,
          waterAmount: "550L/day",
          schedule: ["5:30-8:00 AM", "5:00-7:00 PM"],
          reason: "Cotton requires immediate irrigation"
        }
      },
      {
        zoneId: 2,
        location: "South Section",
        stressLevel: "healthy",
        healthScore: 75,
        ndviValue: 0.73,
        soilMoisture: 68,
        coordinates: [
          { lat: 11.6643, lng: 78.1460 },
          { lat: 11.6657, lng: 78.1460 },
          { lat: 11.6657, lng: 78.1510 },
          { lat: 11.6643, lng: 78.1510 }
        ],
        irrigationRecommendation: {
          priority: "low",
          action: "maintain",
          percentage: 0,
          waterAmount: "350L/day",
          schedule: ["6:00-7:30 AM"],
          reason: "Optimal conditions"
        }
      }
    ],
    overallHealth: 62
  },
  {
    farmId: "FARM003",
    name: "Green Valley Estate",
    location: {
      address: "Coimbatore Rural, Tamil Nadu",
      coordinates: { lat: 11.0876, lng: 77.0234 } // Rural sugarcane fields
    },
    area: { value: 25.0, unit: "acres" },
    cropType: "Sugarcane",
    boundary: [ // Irregular hexagon (realistic farm)
      { lat: 11.0892, lng: 77.0234 },
      { lat: 11.0916, lng: 77.0248 },
      { lat: 11.0920, lng: 77.0285 },
      { lat: 11.0895, lng: 77.0310 },
      { lat: 11.0876, lng: 77.0288 },
      { lat: 11.0873, lng: 77.0255 }
    ],
    stressZones: [
      {
        zoneId: 1,
        location: "East Section",
        stressLevel: "critical",
        healthScore: 18,
        ndviValue: 0.28,
        soilMoisture: 12,
        coordinates: [
          { lat: 11.0168, lng: 76.9590 },
          { lat: 11.0200, lng: 76.9590 },
          { lat: 11.0200, lng: 76.9620 },
          { lat: 11.0168, lng: 76.9620 }
        ],
        irrigationRecommendation: {
          priority: "urgent",
          action: "increase",
          percentage: 50,
          waterAmount: "650L/day",
          schedule: ["5:00-8:00 AM", "4:30-7:30 PM"],
          reason: "Critical stress in sugarcane field"
        }
      },
      {
        zoneId: 2,
        location: "West Section",
        stressLevel: "moderate",
        healthScore: 58,
        ndviValue: 0.61,
        soilMoisture: 48,
        coordinates: [
          { lat: 11.0168, lng: 76.9558 },
          { lat: 11.0200, lng: 76.9558 },
          { lat: 11.0200, lng: 76.9590 },
          { lat: 11.0168, lng: 76.9590 }
        ],
        irrigationRecommendation: {
          priority: "medium",
          action: "increase",
          percentage: 20,
          waterAmount: "400L/day",
          schedule: ["6:00-8:00 AM"],
          reason: "Moderate stress detected"
        }
      }
    ],
    overallHealth: 45
  }
];

// Generate default demo farm for unknown searches with VARIED boundaries and locations
export const getDefaultFarm = (searchQuery) => {
  // Create unique hash from search query for consistent but varied results
  const hash = searchQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 1000;
  
  // Tamil Nadu RURAL AGRICULTURAL locations (away from cities, only farmland visible)
  const locations = [
    { name: "Thanjavur Rural", lat: 10.8234, lng: 79.1956 }, // Rice fields
    { name: "Salem Rural", lat: 11.7145, lng: 78.2234 }, // Cotton fields
    { name: "Coimbatore Rural", lat: 11.0876, lng: 77.0234 }, // Sugarcane fields
    { name: "Madurai Rural", lat: 9.9834, lng: 78.1876 }, // Mixed crops
    { name: "Tirunelveli Rural", lat: 8.7643, lng: 77.8123 }, // Paddy fields
    { name: "Erode Rural", lat: 11.3876, lng: 77.7654 }, // Turmeric fields
    { name: "Trichy Rural", lat: 10.8567, lng: 78.7234 }, // Agricultural area
    { name: "Dindigul Rural", lat: 10.4123, lng: 78.0234 } // Farm belt
  ];
  
  const locationIndex = seed % locations.length;
  const selectedLocation = locations[locationIndex];
  
  // Crop types
  const crops = ['Rice', 'Wheat', 'Cotton', 'Sugarcane', 'Maize', 'Vegetables'];
  const cropIndex = (seed * 3) % crops.length;
  const selectedCrop = crops[cropIndex];
  
  // Generate REALISTIC IRREGULAR farm boundaries (like real agricultural land)
  const shapeType = seed % 6;
  let boundary = [];
  
  const baseLat = selectedLocation.lat;
  const baseLng = selectedLocation.lng;
  const size = 0.004 + (seed % 8) * 0.0006; // Varied realistic farm sizes
  
  // Add random variations to make shapes irregular (like real farms)
  const randomOffset = () => ((seed * 73) % 30 - 15) * 0.00008;
  
  switch(shapeType) {
    case 0: // Irregular quadrilateral (most common farm shape)
      boundary = [
        { lat: baseLat + randomOffset(), lng: baseLng + randomOffset() },
        { lat: baseLat + size * 0.95 + randomOffset(), lng: baseLng + size * 0.15 + randomOffset() },
        { lat: baseLat + size * 1.1 + randomOffset(), lng: baseLng + size * 1.4 + randomOffset() },
        { lat: baseLat + size * 0.2 + randomOffset(), lng: baseLng + size * 1.3 + randomOffset() }
      ];
      break;
    case 1: // Irregular pentagon (5-sided farm)
      boundary = [
        { lat: baseLat + randomOffset(), lng: baseLng + size * 0.6 + randomOffset() },
        { lat: baseLat + size * 0.35 + randomOffset(), lng: baseLng + randomOffset() },
        { lat: baseLat + size * 1.05 + randomOffset(), lng: baseLng + size * 0.4 + randomOffset() },
        { lat: baseLat + size * 0.9 + randomOffset(), lng: baseLng + size * 1.5 + randomOffset() },
        { lat: baseLat + size * 0.15 + randomOffset(), lng: baseLng + size * 1.35 + randomOffset() }
      ];
      break;
    case 2: // Irregular hexagon (6-sided)
      boundary = [
        { lat: baseLat + size * 0.45 + randomOffset(), lng: baseLng + randomOffset() },
        { lat: baseLat + size * 1.05 + randomOffset(), lng: baseLng + size * 0.35 + randomOffset() },
        { lat: baseLat + size * 1.1 + randomOffset(), lng: baseLng + size * 0.95 + randomOffset() },
        { lat: baseLat + size * 0.55 + randomOffset(), lng: baseLng + size * 1.45 + randomOffset() },
        { lat: baseLat + randomOffset(), lng: baseLng + size * 1.05 + randomOffset() },
        { lat: baseLat + size * 0.05 + randomOffset(), lng: baseLng + size * 0.35 + randomOffset() }
      ];
      break;
    case 3: // Curved/organic shape (7 points)
      boundary = [
        { lat: baseLat + randomOffset(), lng: baseLng + size * 0.4 + randomOffset() },
        { lat: baseLat + size * 0.3 + randomOffset(), lng: baseLng + randomOffset() },
        { lat: baseLat + size * 0.85 + randomOffset(), lng: baseLng + size * 0.25 + randomOffset() },
        { lat: baseLat + size * 1.15 + randomOffset(), lng: baseLng + size * 0.8 + randomOffset() },
        { lat: baseLat + size * 0.95 + randomOffset(), lng: baseLng + size * 1.55 + randomOffset() },
        { lat: baseLat + size * 0.35 + randomOffset(), lng: baseLng + size * 1.4 + randomOffset() },
        { lat: baseLat + size * 0.1 + randomOffset(), lng: baseLng + size * 0.85 + randomOffset() }
      ];
      break;
    case 4: // L-shaped farm (common for divided plots)
      boundary = [
        { lat: baseLat + randomOffset(), lng: baseLng + randomOffset() },
        { lat: baseLat + size * 0.65 + randomOffset(), lng: baseLng + size * 0.05 + randomOffset() },
        { lat: baseLat + size * 0.6 + randomOffset(), lng: baseLng + size * 0.75 + randomOffset() },
        { lat: baseLat + size * 1.05 + randomOffset(), lng: baseLng + size * 0.7 + randomOffset() },
        { lat: baseLat + size * 1.1 + randomOffset(), lng: baseLng + size * 1.55 + randomOffset() },
        { lat: baseLat + size * 0.05 + randomOffset(), lng: baseLng + size * 1.5 + randomOffset() }
      ];
      break;
    case 5: // Trapezoidal (sloped farm)
      boundary = [
        { lat: baseLat + randomOffset(), lng: baseLng + size * 0.3 + randomOffset() },
        { lat: baseLat + size * 0.95 + randomOffset(), lng: baseLng + randomOffset() },
        { lat: baseLat + size * 1.15 + randomOffset(), lng: baseLng + size * 1.6 + randomOffset() },
        { lat: baseLat + size * 0.1 + randomOffset(), lng: baseLng + size * 1.4 + randomOffset() }
      ];
      break;
  }
  
  // Calculate area (varied based on seed)
  const areaValue = 10 + (seed % 30); // 10-40 acres
  
  return {
    farmId: `REG${String(seed).padStart(4, '0')}`,
    name: `${selectedCrop} Farm - ${selectedLocation.name}`,
    registrationNumber: searchQuery,
    location: {
      address: `${selectedLocation.name}, Tamil Nadu`,
      coordinates: { lat: baseLat, lng: baseLng }
    },
    area: { value: areaValue, unit: "acres" },
    cropType: selectedCrop,
    boundary: boundary,
    stressZones: generateStressZones(boundary, seed),
    overallHealth: 45 + (seed % 40) // 45-85% health
  };
};

// Generate varied stress zones based on boundary
function generateStressZones(boundary, seed) {
  const numZones = 2 + (seed % 4); // 2-5 zones
  const zones = [];
  const stressLevels = ['critical', 'high', 'moderate', 'healthy', 'optimal'];
  
  for (let i = 0; i < numZones; i++) {
    const stressIndex = (seed + i * 7) % stressLevels.length;
    const stressLevel = stressLevels[stressIndex];
    
    // Health scores based on stress level
    const healthScores = {
      'critical': 10 + (seed + i) % 20,
      'high': 30 + (seed + i) % 15,
      'moderate': 50 + (seed + i) % 15,
      'healthy': 70 + (seed + i) % 10,
      'optimal': 85 + (seed + i) % 10
    };
    
    // NDVI values
    const ndviValues = {
      'critical': 0.15 + ((seed + i) % 20) * 0.01,
      'high': 0.35 + ((seed + i) % 15) * 0.01,
      'moderate': 0.50 + ((seed + i) % 15) * 0.01,
      'healthy': 0.65 + ((seed + i) % 10) * 0.01,
      'optimal': 0.80 + ((seed + i) % 10) * 0.01
    };
    
    // Create zone coordinates (subset of boundary)
    const zoneCoords = boundary.slice(0, Math.min(4, boundary.length));
    
    zones.push({
      zoneId: i + 1,
      location: `Zone ${String.fromCharCode(65 + i)}`, // Zone A, B, C...
      stressLevel: stressLevel,
      healthScore: healthScores[stressLevel],
      ndviValue: ndviValues[stressLevel],
      soilMoisture: healthScores[stressLevel] - 10,
      coordinates: zoneCoords,
      irrigationRecommendation: {
        priority: stressLevel === 'critical' || stressLevel === 'high' ? 'urgent' : 
                  stressLevel === 'moderate' ? 'medium' : 'low',
        action: stressLevel === 'optimal' ? 'decrease' : 
                stressLevel === 'healthy' ? 'maintain' : 'increase',
        percentage: stressLevel === 'critical' ? 50 : 
                   stressLevel === 'high' ? 40 :
                   stressLevel === 'moderate' ? 20 : 0,
        waterAmount: `${200 + (seed + i) % 400}L/day`,
        schedule: ["6:00-8:00 AM"],
        reason: `${stressLevel.charAt(0).toUpperCase() + stressLevel.slice(1)} stress level detected`
      }
    });
  }
  
  return zones;
}
