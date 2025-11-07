import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Maximize2, ZoomIn, ZoomOut, Layers } from 'lucide-react';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SatelliteMap = ({ farm, center }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapType, setMapType] = useState('satellite');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 15,
      zoomControl: false
    });

    // Add zoom control to top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add satellite tile layer (Google Satellite)
    const satelliteLayer = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      {
        attribution: 'Map data ©2024 Google',
        maxZoom: 20
      }
    );

    // Add street map layer
    const streetLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }
    );

    // Start with satellite view
    satelliteLayer.addTo(map);

    mapInstanceRef.current = map;
    mapInstanceRef.current.satelliteLayer = satelliteLayer;
    mapInstanceRef.current.streetLayer = streetLayer;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !farm) return;

    const map = mapInstanceRef.current;

    // Clear existing layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polygon || layer instanceof L.Marker || layer instanceof L.Popup) {
        map.removeLayer(layer);
      }
    });

    // Draw farm boundary - HIGHLY VISIBLE with clear separation
    const boundaryPolygon = L.polygon(
      farm.boundary.map(coord => [coord.lat, coord.lng]),
      {
        color: '#00FFFF',        // Bright cyan border
        weight: 6,               // Thick 6px border
        fillColor: '#FFFF00',    // Yellow fill
        fillOpacity: 0.2,        // 20% opacity
        className: 'farm-boundary-pulse',
        dashArray: '10, 10',     // Dashed pattern for clear visibility
        lineCap: 'round',
        lineJoin: 'round'
      }
    );

    boundaryPolygon.addTo(map);

    // Add popup to boundary
    const popupContent = `
      <div style="padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #10B981;">${farm.name}</h3>
        <p style="margin: 4px 0;"><strong>Area:</strong> ${farm.area.value} ${farm.area.unit}</p>
        <p style="margin: 4px 0;"><strong>Crop:</strong> ${farm.cropType}</p>
        <p style="margin: 4px 0;"><strong>Health:</strong> ${farm.overallHealth}%</p>
      </div>
    `;
    boundaryPolygon.bindPopup(popupContent);

    // Define stress level colors with high opacity
    const stressColors = {
      critical: { color: '#DC2626', opacity: 0.7 },   // Red
      high: { color: '#F97316', opacity: 0.65 },      // Orange
      moderate: { color: '#FBBF24', opacity: 0.6 },   // Yellow
      healthy: { color: '#86EFAC', opacity: 0.5 },    // Light Green
      optimal: { color: '#22C55E', opacity: 0.4 }     // Dark Green
    };

    // Draw stress zones INSIDE boundary
    console.log(`🗺️ Rendering ${farm.stressZones.length} stress zones for ${farm.name}`);
    
    farm.stressZones.forEach((zone, index) => {
      console.log(`Zone ${zone.zoneId}:`, zone.coordinates);
      
      const zoneColor = stressColors[zone.stressLevel] || stressColors['moderate'];
      
      // Validate zone coordinates
      if (!zone.coordinates || zone.coordinates.length < 3) {
        console.warn(`⚠️ Zone ${zone.zoneId} has invalid coordinates, skipping`);
        return;
      }
      
      // Validate that zone coordinates are within farm boundary
      const boundaryLats = farm.boundary.map(c => c.lat);
      const boundaryLngs = farm.boundary.map(c => c.lng);
      const minBoundaryLat = Math.min(...boundaryLats);
      const maxBoundaryLat = Math.max(...boundaryLats);
      const minBoundaryLng = Math.min(...boundaryLngs);
      const maxBoundaryLng = Math.max(...boundaryLngs);
      
      const zoneLats = zone.coordinates.map(c => c.lat);
      const zoneLngs = zone.coordinates.map(c => c.lng);
      const minZoneLat = Math.min(...zoneLats);
      const maxZoneLat = Math.max(...zoneLats);
      const minZoneLng = Math.min(...zoneLngs);
      const maxZoneLng = Math.max(...zoneLngs);
      
      // Check if zone is outside boundary
      if (minZoneLat < minBoundaryLat || maxZoneLat > maxBoundaryLat || 
          minZoneLng < minBoundaryLng || maxZoneLng > maxBoundaryLng) {
        console.warn(`⚠️ Zone ${zone.zoneId} extends outside farm boundary, coordinates will be adjusted`);
        
        // Adjust coordinates to fit within boundary
        const adjustedCoords = zone.coordinates.map(coord => ({
          lat: Math.max(minBoundaryLat, Math.min(maxBoundaryLat, coord.lat)),
          lng: Math.max(minBoundaryLng, Math.min(maxBoundaryLng, coord.lng))
        }));
        
        // Update zone with adjusted coordinates
        zone.coordinates = adjustedCoords;
      }
      
      const zonePolygon = L.polygon(
        zone.coordinates.map(coord => [coord.lat, coord.lng]),
        {
          color: zoneColor.color,
          weight: 3,
          fillColor: zoneColor.color,
          fillOpacity: zoneColor.opacity,
          className: 'stress-zone',
          // Add tooltip on hover
          title: `Zone ${zone.zoneId}: ${zone.stressLevel.toUpperCase()}`
        }
      );

      zonePolygon.addTo(map);

      // Create detailed popup for each zone with comprehensive information
      const zonePopupContent = `
        <div style="padding: 12px; min-width: 280px; max-width: 320px;">
          <div style="background: linear-gradient(135deg, ${zoneColor.color}, ${zoneColor.color}dd); padding: 12px; margin: -12px -12px 12px -12px; border-radius: 8px 8px 0 0;">
            <h4 style="margin: 0; font-weight: bold; color: white; font-size: 16px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
              🎯 Zone ${zone.zoneId} - ${zone.location}
            </h4>
          </div>
          
          <div style="background: #f9fafb; padding: 10px; border-radius: 6px; margin-bottom: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div>
                <p style="margin: 0; font-size: 11px; color: #6b7280; font-weight: 500;">Status</p>
                <p style="margin: 2px 0 0 0; font-size: 13px; color: ${zoneColor.color}; font-weight: bold; text-transform: uppercase;">${zone.stressLevel}</p>
              </div>
              <div>
                <p style="margin: 0; font-size: 11px; color: #6b7280; font-weight: 500;">Health Score</p>
                <p style="margin: 2px 0 0 0; font-size: 13px; color: #10b981; font-weight: bold;">${zone.healthScore}%</p>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 10px;">
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #374151; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">📊 Field Metrics</p>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: #6b7280;">🌿 NDVI Value:</span>
                <span style="font-size: 12px; font-weight: 600; color: #1f2937;">${zone.ndviValue.toFixed(3)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: #6b7280;">💧 Soil Moisture:</span>
                <span style="font-size: 12px; font-weight: 600; color: #1f2937;">${zone.soilMoisture}%</span>
              </div>
            </div>
          </div>
          
          <div style="background: ${zone.irrigationRecommendation.action === 'increase' ? '#fef2f2' : zone.irrigationRecommendation.action === 'decrease' ? '#f0fdf4' : '#f9fafb'}; padding: 10px; border-radius: 6px; border-left: 3px solid ${
            zone.irrigationRecommendation.action === 'increase' ? '#DC2626' :
            zone.irrigationRecommendation.action === 'decrease' ? '#22C55E' : '#6B7280'
          };">
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #6b7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Irrigation Action</p>
            <p style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px; color: ${
              zone.irrigationRecommendation.action === 'increase' ? '#DC2626' :
              zone.irrigationRecommendation.action === 'decrease' ? '#22C55E' : '#6B7280'
            };">
              ${zone.irrigationRecommendation.action.toUpperCase()} ${zone.irrigationRecommendation.percentage}%
            </p>
            <p style="margin: 0 0 6px 0; font-size: 12px; color: #4b5563;">💧 ${zone.irrigationRecommendation.waterAmount}</p>
            <p style="margin: 0; font-size: 11px; color: #6b7280; font-style: italic;">${zone.irrigationRecommendation.reason}</p>
          </div>
          
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 10px; color: #9ca3af; text-align: center;">🕒 Click zone polygon for quick view</p>
          </div>
        </div>
      `;
      
      zonePolygon.bindPopup(zonePopupContent);

      // Add zone marker with icon
      const zoneCenter = L.latLngBounds(zone.coordinates.map(c => [c.lat, c.lng])).getCenter();
      
      const marker = L.marker(zoneCenter, {
        icon: L.divIcon({
          className: 'zone-marker',
          html: `
            <div 
              style="
                background: ${zoneColor.color};
                color: white;
                border: 3px solid white;
                border-radius: 50%;
                width: 45px;
                height: 45px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 18px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.4);
                cursor: pointer;
                transition: transform 0.2s;
              "
              title="Zone ${zone.zoneId}: ${zone.stressLevel} - Click for details"
            >
              ${zone.zoneId}
            </div>
          `,
          iconSize: [45, 45]
        }),
        title: `Zone ${zone.zoneId}: ${zone.stressLevel.toUpperCase()} (${zone.healthScore}%)`
      });
      
      marker.addTo(map);
      marker.bindPopup(zonePopupContent);
      
      // Add parcel label directly on map (optional)
      const label = L.marker(zoneCenter, {
        icon: L.divIcon({
          className: 'parcel-label',
          html: `
            <div style="
              background: rgba(255, 255, 255, 0.9);
              border: 2px solid ${zoneColor.color};
              border-radius: 12px;
              padding: 4px 8px;
              font-weight: bold;
              font-size: 14px;
              color: ${zoneColor.color};
              text-align: center;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              min-width: 40px;
            ">
              ${zone.zoneId}
            </div>
          `,
          iconSize: [40, 30],
          iconAnchor: [20, 15]
        })
      }).addTo(map);
    });

    // Fit map to boundary
    const bounds = L.latLngBounds(farm.boundary.map(coord => [coord.lat, coord.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });

  }, [farm]);

  const toggleMapType = () => {
    if (!mapInstanceRef.current) return;
    
    const map = mapInstanceRef.current;
    
    if (mapType === 'satellite') {
      map.removeLayer(map.satelliteLayer);
      map.streetLayer.addTo(map);
      setMapType('street');
    } else {
      map.removeLayer(map.streetLayer);
      map.satelliteLayer.addTo(map);
      setMapType('satellite');
    }
  };

  const toggleFullscreen = () => {
    const mapContainer = mapRef.current.parentElement;
    
    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen().then(() => {
        setIsFullscreen(true);
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
      });
    }
  };

  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-[500px] rounded-b-xl"
        style={{ zIndex: 1 }}
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={toggleMapType}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
          title="Toggle Map Type"
        >
          <Layers className="w-5 h-5 text-gray-700" />
        </button>
        
        <button
          onClick={toggleFullscreen}
          className="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Legend - Enhanced with detailed information */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white p-4 rounded-lg shadow-xl border-2 border-gray-200">
        <h4 className="font-bold text-sm mb-3 text-gray-800 border-b pb-2">Irrigation Status Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition">
            <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: '#DC2626' }}></div>
            <div>
              <span className="text-xs font-semibold text-gray-700">Critical (0-20%)</span>
              <p className="text-[10px] text-gray-500">Immediate irrigation needed</p>
            </div>
          </div>
          <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition">
            <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: '#F97316' }}></div>
            <div>
              <span className="text-xs font-semibold text-gray-700">High Stress (21-40%)</span>
              <p className="text-[10px] text-gray-500">Irrigation recommended</p>
            </div>
          </div>
          <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition">
            <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: '#FBBF24' }}></div>
            <div>
              <span className="text-xs font-semibold text-gray-700">Moderate (41-60%)</span>
              <p className="text-[10px] text-gray-500">Monitor closely</p>
            </div>
          </div>
          <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition">
            <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: '#86EFAC' }}></div>
            <div>
              <span className="text-xs font-semibold text-gray-700">Healthy (61-80%)</span>
              <p className="text-[10px] text-gray-500">Normal schedule</p>
            </div>
          </div>
          <div className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded transition">
            <div className="w-5 h-5 rounded border border-gray-300" style={{ backgroundColor: '#22C55E' }}></div>
            <div>
              <span className="text-xs font-semibold text-gray-700">Optimal (81-100%)</span>
              <p className="text-[10px] text-gray-500">Well irrigated</p>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-[10px] text-gray-600 italic">💧 Click zones for detailed irrigation recommendations</p>
        </div>
      </div>

      <style>{`
        .farm-boundary-pulse {
          animation: pulse-border 2s infinite;
        }
        
        @keyframes pulse-border {
          0%, 100% { stroke-width: 6; }
          50% { stroke-width: 8; }
        }
        
        .stress-zone {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .stress-zone:hover {
          stroke-width: 5 !important;
          fill-opacity: 0.8 !important;
          filter: brightness(1.1);
        }
        
        .zone-marker {
          transition: transform 0.2s;
          cursor: pointer;
        }
        
        .zone-marker:hover {
          transform: scale(1.2);
        }
        
        .parcel-label {
          pointer-events: none;
          z-index: 999;
        }
        
        .leaflet-tooltip {
          background: rgba(255, 255, 255, 0.95) !important;
          border: 2px solid #10b981 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important;
          font-weight: 600 !important;
          color: #1f2937 !important;
        }
      `}</style>
    </div>
  );
};

export default SatelliteMap;
