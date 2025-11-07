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
    stressZones: generateStressZones(
      [ // Use the boundary to generate zones
        { lat: 10.8234, lng: 79.1956 },
        { lat: 10.8268, lng: 79.1962 },
        { lat: 10.8275, lng: 79.2008 },
        { lat: 10.8242, lng: 79.2015 },
        { lat: 10.8230, lng: 79.1990 }
      ],
      "FARM001",
      3  // 3 zones
    ),
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
    stressZones: generateStressZones(
      [ // Use the boundary to generate zones
        { lat: 11.7145, lng: 78.2260 },
        { lat: 11.7165, lng: 78.2238 },
        { lat: 11.7182, lng: 78.2268 },
        { lat: 11.7175, lng: 78.2305 },
        { lat: 11.7152, lng: 78.2295 }
      ],
      "FARM002",
      2  // 2 zones
    ),
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
  console.log(`🌾 Generating ${numZones} zones for seed ${seed}`);
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
    
    // Create zone coordinates - properly subdivide the boundary
    const zoneCoords = subdividePolygon(boundary, numZones, i);
    
    // Validate zone coordinates
    if (!zoneCoords || zoneCoords.length < 3) {
      console.error(`❌ Zone ${i + 1} has invalid coordinates, using fallback`);
      // Use a small square in center as fallback
      const centerLat = (Math.min(...boundary.map(c => c.lat)) + Math.max(...boundary.map(c => c.lat))) / 2;
      const centerLng = (Math.min(...boundary.map(c => c.lng)) + Math.max(...boundary.map(c => c.lng))) / 2;
      const offset = 0.001;
      zoneCoords = [
        { lat: centerLat - offset, lng: centerLng - offset },
        { lat: centerLat + offset, lng: centerLng - offset },
        { lat: centerLat + offset, lng: centerLng + offset },
        { lat: centerLat - offset, lng: centerLng + offset }
      ];
    }
    
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
    console.log(`  ✅ Zone ${i + 1}: ${stressLevel} at coords:`, zoneCoords);
  }
  
  console.log(`🎯 Total zones generated: ${zones.length}`);
  
  // Final validation - ensure we have the expected number of zones
  if (zones.length !== numZones) {
    console.error(`❌ Expected ${numZones} zones, got ${zones.length}`);
  }
  
  return zones;
}

// Helper function to subdivide polygon into zones - IRREGULAR BOUNDARY AWARE VERSION
function subdividePolygon(boundary, numZones, zoneIndex) {
  if (!boundary || boundary.length < 3) {
    console.warn('⚠️ Invalid boundary, using default');
    return [
      { lat: 10.0, lng: 78.0 },
      { lat: 10.01, lng: 78.0 },
      { lat: 10.01, lng: 78.01 },
      { lat: 10.0, lng: 78.01 }
    ];
  }
  
  // Calculate the bounding box
  const lats = boundary.map(c => c.lat);
  const lngs = boundary.map(c => c.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  // Validate bounding box
  if (minLat === maxLat || minLng === maxLng) {
    console.error('❌ Invalid bounding box: zero area');
    return [
      { lat: minLat, lng: minLng },
      { lat: minLat + 0.001, lng: minLng },
      { lat: minLat + 0.001, lng: minLng + 0.001 },
      { lat: minLat, lng: minLng + 0.001 }
    ];
  }
  
  // For irregular boundaries, we'll use a centroid-based approach
  // Calculate centroid of the boundary
  const centroidLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
  const centroidLng = lngs.reduce((sum, lng) => sum + lng, 0) / lngs.length;
  
  // Add 20% padding to keep zones well inside boundary
  const latPadding = (maxLat - minLat) * 0.2; // 20% padding
  const lngPadding = (maxLng - minLng) * 0.2; // 20% padding
  
  const paddedMinLat = minLat + latPadding;
  const paddedMaxLat = maxLat - latPadding;
  const paddedMinLng = minLng + lngPadding;
  const paddedMaxLng = maxLng - lngPadding;
  
  // Calculate grid dimensions - ensure we have enough rows/columns
  const cols = Math.max(1, Math.ceil(Math.sqrt(numZones)));
  const rows = Math.max(1, Math.ceil(numZones / cols));
  
  // Adjust if we have too many rows/columns
  if (rows * cols < numZones) {
    console.warn(`⚠️ Grid too small: ${rows}x${cols} < ${numZones} zones, adjusting`);
  }
  
  // Divide into grid zones using padded area
  const latStep = (paddedMaxLat - paddedMinLat) / Math.max(1, rows);
  const lngStep = (paddedMaxLng - paddedMinLng) / Math.max(1, cols);
  
  // Validate step sizes
  if (latStep <= 0 || lngStep <= 0) {
    console.error('❌ Invalid step size: latStep=', latStep, 'lngStep=', lngStep);
    return [
      { lat: paddedMinLat, lng: paddedMinLng },
      { lat: paddedMaxLat, lng: paddedMinLng },
      { lat: paddedMaxLat, lng: paddedMaxLng },
      { lat: paddedMinLat, lng: paddedMaxLng }
    ];
  }
  
  // Calculate which row and column this zone is in
  const row = Math.min(Math.floor(zoneIndex / cols), rows - 1);
  const col = Math.min(zoneIndex % cols, cols - 1);
  
  // Create a rectangle for this zone (well inside boundary)
  const zoneLat1 = paddedMinLat + (row * latStep);
  const zoneLat2 = Math.min(paddedMinLat + ((row + 1) * latStep), paddedMaxLat);
  const zoneLng1 = paddedMinLng + (col * lngStep);
  const zoneLng2 = Math.min(paddedMinLng + ((col + 1) * lngStep), paddedMaxLng);
  
  // Ensure we have valid coordinates
  if (zoneLat1 >= zoneLat2 || zoneLng1 >= zoneLng2) {
    console.warn(`⚠️ Invalid zone dimensions, using fallback`);
    // Use a small square in the center
    const centerLat = (paddedMinLat + paddedMaxLat) / 2;
    const centerLng = (paddedMinLng + paddedMaxLng) / 2;
    const smallStep = Math.min(latStep, lngStep) * 0.3;
    return [
      { lat: centerLat - smallStep, lng: centerLng - smallStep },
      { lat: centerLat + smallStep, lng: centerLng - smallStep },
      { lat: centerLat + smallStep, lng: centerLng + smallStep },
      { lat: centerLat - smallStep, lng: centerLng + smallStep }
    ];
  }
  
  console.log(`  🗺️ Zone ${zoneIndex + 1} grid: row=${row}/${rows}, col=${col}/${cols}, lat[${zoneLat1.toFixed(6)}-${zoneLat2.toFixed(6)}], lng[${zoneLng1.toFixed(6)}-${zoneLng2.toFixed(6)}]`);
  
  // Create initial zone boundary as rectangle
  let result = [
    { lat: zoneLat1, lng: zoneLng1 },
    { lat: zoneLat2, lng: zoneLng1 },
    { lat: zoneLat2, lng: zoneLng2 },
    { lat: zoneLat1, lng: zoneLng2 }
  ];
  
  // Final validation
  if (result.some(c => isNaN(c.lat) || isNaN(c.lng))) {
    console.error('❌ Zone has NaN coordinates, using fallback');
    return [
      { lat: paddedMinLat, lng: paddedMinLng },
      { lat: paddedMaxLat, lng: paddedMinLng },
      { lat: paddedMaxLat, lng: paddedMaxLng },
      { lat: paddedMinLat, lng: paddedMaxLng }
    ];
  }
  
  return result;
}
