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

    // Draw farm boundary - HIGHLY VISIBLE
    const boundaryPolygon = L.polygon(
      farm.boundary.map(coord => [coord.lat, coord.lng]),
      {
        color: '#00FFFF',        // Bright cyan border
        weight: 6,               // Thick 6px border
        fillColor: '#FFFF00',    // Yellow fill
        fillOpacity: 0.2,        // 20% opacity
        className: 'farm-boundary-pulse'
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
    farm.stressZones.forEach(zone => {
      const zoneColor = stressColors[zone.stressLevel];
      
      const zonePolygon = L.polygon(
        zone.coordinates.map(coord => [coord.lat, coord.lng]),
        {
          color: zoneColor.color,
          weight: 3,
          fillColor: zoneColor.color,
          fillOpacity: zoneColor.opacity,
          className: 'stress-zone'
        }
      );

      zonePolygon.addTo(map);

      // Create detailed popup for each zone
      const zonePopupContent = `
        <div style="padding: 8px; min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; font-weight: bold; color: ${zoneColor.color};">
            Zone ${zone.zoneId} - ${zone.location}
          </h4>
          <p style="margin: 4px 0;"><strong>Stress Level:</strong> ${zone.stressLevel.toUpperCase()}</p>
          <p style="margin: 4px 0;"><strong>Health Score:</strong> ${zone.healthScore}%</p>
          <p style="margin: 4px 0;"><strong>NDVI:</strong> ${zone.ndviValue.toFixed(2)}</p>
          <p style="margin: 4px 0;"><strong>Soil Moisture:</strong> ${zone.soilMoisture}%</p>
          <hr style="margin: 8px 0; border: none; border-top: 1px solid #ddd;" />
          <p style="margin: 4px 0; font-weight: bold; color: ${
            zone.irrigationRecommendation.action === 'increase' ? '#DC2626' :
            zone.irrigationRecommendation.action === 'decrease' ? '#22C55E' : '#6B7280'
          };">
            ${zone.irrigationRecommendation.action.toUpperCase()} ${zone.irrigationRecommendation.percentage}%
          </p>
          <p style="margin: 4px 0; font-size: 12px;">${zone.irrigationRecommendation.waterAmount}</p>
        </div>
      `;
      
      zonePolygon.bindPopup(zonePopupContent);

      // Add zone marker with icon
      const zoneCenter = L.latLngBounds(zone.coordinates.map(c => [c.lat, c.lng])).getCenter();
      
      const marker = L.marker(zoneCenter, {
        icon: L.divIcon({
          className: 'zone-marker',
          html: `
            <div style="
              background: ${zoneColor.color};
              color: white;
              border: 3px solid white;
              border-radius: 50%;
              width: 40px;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 16px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              ${zone.zoneId}
            </div>
          `,
          iconSize: [40, 40]
        })
      });
      
      marker.addTo(map);
      marker.bindPopup(zonePopupContent);
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

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-lg">
        <h4 className="font-bold text-sm mb-2">Stress Levels</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
            <span className="text-xs">Critical (0-20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F97316' }}></div>
            <span className="text-xs">High (21-40%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FBBF24' }}></div>
            <span className="text-xs">Moderate (41-60%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#86EFAC' }}></div>
            <span className="text-xs">Healthy (61-80%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22C55E' }}></div>
            <span className="text-xs">Optimal (81-100%)</span>
          </div>
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
        }
        
        .stress-zone:hover {
          stroke-width: 5 !important;
          fill-opacity: 0.8 !important;
        }
        
        .zone-marker {
          transition: transform 0.2s;
        }
        
        .zone-marker:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default SatelliteMap;
