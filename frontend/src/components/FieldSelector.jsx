import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { analyzeField, quickAnalysis } from '../services/api';
import { useFarm } from '../context/FarmContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, MapPin, FileText } from 'lucide-react';
import CropSelector from './CropSelector';
import L from 'leaflet';

// Component to recenter and fit bounds
const FitBounds = ({ coordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  
  return null;
};

const FieldSelector = ({ onAnalysisStart, onAnalysisComplete }) => {
  const navigate = useNavigate();
  const { selectedFarm } = useFarm();
  const [fieldBoundary, setFieldBoundary] = useState(null);
  const [useSample, setUseSample] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default Central India (NOT Coimbatore)
  const [mapZoom, setMapZoom] = useState(13);
  const [selectedCrop, setSelectedCrop] = useState('wheat'); // Default crop
  const [cropInfo, setCropInfo] = useState(null);
  const featureGroupRef = useRef(null);

  // Fetch crop information
  useEffect(() => {
    const fetchCropInfo = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/crops');
        const data = await response.json();
        if (data.details && data.details[selectedCrop]) {
          setCropInfo(data.details[selectedCrop]);
        }
      } catch (error) {
        console.error('Failed to fetch crop info:', error);
      }
    };
    fetchCropInfo();
  }, [selectedCrop]);

  // Load pre-selected farm boundary
  useEffect(() => {
    if (selectedFarm && selectedFarm.boundary_coordinates) {
      try {
        let coordinates = selectedFarm.boundary_coordinates;
        
        // Parse if string
        if (typeof coordinates === 'string') {
          coordinates = JSON.parse(coordinates);
        }
        
        // Validate coordinates
        if (Array.isArray(coordinates) && coordinates.length > 0) {
          // Ensure coordinates are in [lat, lng] format
          const validCoords = coordinates.map(coord => {
            if (Array.isArray(coord) && coord.length === 2) {
              return [parseFloat(coord[0]), parseFloat(coord[1])];
            }
            return null;
          }).filter(c => c !== null);
          
          if (validCoords.length > 2) {
            setFieldBoundary(validCoords);
            setIsPreloaded(true);
            
            // Calculate center for map
            const lats = validCoords.map(c => c[0]);
            const lngs = validCoords.map(c => c[1]);
            const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
            const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
            setMapCenter([centerLat, centerLng]);
            setMapZoom(15);
          }
        }
      } catch (error) {
        console.error('Error loading farm boundary:', error);
        setIsPreloaded(false);
      }
    } else {
      // No farm selected - reset to drawing mode
      setFieldBoundary(null);
      setIsPreloaded(false);
      setMapCenter([20.5937, 78.9629]); // Central India default
      setMapZoom(13);
    }
  }, [selectedFarm]);

  const handleCreated = (e) => {
    const layer = e.layer;
    if (e.layerType === 'polygon') {
      const coordinates = layer.getLatLngs()[0].map(point => [point.lat, point.lng]);
      // Close the polygon by adding the first point at the end
      coordinates.push([coordinates[0][0], coordinates[0][1]]);
      setFieldBoundary(coordinates);
    }
  };

  const handleUseSample = () => {
    // Sample field boundary
    const sampleBoundary = [
      [36.6, -120.4],
      [36.6, -120.35],
      [36.55, -120.35],
      [36.55, -120.4],
      [36.6, -120.4]
    ];
    setFieldBoundary(sampleBoundary);
    setUseSample(true);
  };

  const handleAnalyze = async () => {
    if (!fieldBoundary) {
      alert('Please draw a field boundary or use the sample field.');
      return;
    }

    try {
      onAnalysisStart();
      
      const requestData = {
        field_boundary: fieldBoundary,
        use_sample: useSample,
        crop_type: selectedCrop
      };

      const response = await analyzeField(requestData);
      onAnalysisComplete(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
      onAnalysisStart(false);
    }
  };

  const handleQuickAnalysis = async () => {
    if (!fieldBoundary) {
      alert('Please draw a field boundary or use the sample field.');
      return;
    }

    try {
      onAnalysisStart();
      
      const requestData = {
        field_boundary: fieldBoundary,
        crop_type: selectedCrop
      };

      const response = await quickAnalysis(requestData);
      onAnalysisComplete(response.data);
    } catch (error) {
      console.error('Quick analysis failed:', error);
      alert('Quick analysis failed. Please try again.');
      onAnalysisStart(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button and farm info */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800 flex items-center gap-2 transition duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </button>
        </div>
      </div>

      {/* Farm Info Banner */}
      {selectedFarm && isPreloaded && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-500 rounded-xl p-6 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="bg-red-500 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedFarm.farm_name || 'Unnamed Farm'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {selectedFarm.survey_number && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-red-600" />
                    <div>
                      <span className="text-gray-600">Survey Number:</span>
                      <p className="font-semibold text-gray-800">{selectedFarm.survey_number}</p>
                    </div>
                  </div>
                )}
                {selectedFarm.area && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <div>
                      <span className="text-gray-600">Area:</span>
                      <p className="font-semibold text-gray-800">{parseFloat(selectedFarm.area).toFixed(2)} hectares</p>
                    </div>
                  </div>
                )}
                {selectedFarm.district && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <div>
                      <span className="text-gray-600">Location:</span>
                      <p className="font-semibold text-gray-800">{selectedFarm.district}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-3 w-3 bg-red-600 border-2 border-white rounded-full shadow"></div>
                <span className="text-sm text-gray-700 font-medium">
                  Farm boundary marked in <span className="text-red-600 font-bold">RED</span> on the map below
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {isPreloaded ? 'Your Selected Field' : 'Draw Your Field Boundary'}
      </h1>
      
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <MapContainer 
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '500px', width: '100%' }}
          className="rounded-lg"
          key={selectedFarm ? selectedFarm.id : 'drawing-mode'} // Force re-render on farm change
        >
          {/* Satellite imagery for pre-loaded farms, street map for drawing */}
          {isPreloaded ? (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
          ) : (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          )}
          
          {/* Pre-loaded farm boundary in RED */}
          {isPreloaded && fieldBoundary && fieldBoundary.length > 0 && (
            <>
              <FitBounds coordinates={fieldBoundary} />
              <Polygon
                positions={fieldBoundary}
                pathOptions={{
                  color: '#DC2626', // Bright red border
                  fillColor: '#EF4444', // Red fill
                  fillOpacity: 0.2,
                  weight: 4,
                  opacity: 1
                }}
              />
            </>
          )}
          
          {/* Drawing tools for new farms */}
          {!isPreloaded && (
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleCreated}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                  polygon: {
                    allowIntersection: false,
                    drawError: {
                      color: '#e1e100',
                      message: '<strong>Error:</strong> polygon edges cannot intersect!'
                    },
                    showArea: true,
                    metric: true,
                    repeatMode: false, // Prevent auto-repeat after first polygon
                    icon: new L.DivIcon({
                      iconSize: new L.Point(8, 8),
                      className: 'leaflet-div-icon leaflet-editing-icon'
                    }),
                    touchIcon: new L.DivIcon({
                      iconSize: new L.Point(20, 20),
                      className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
                    }),
                    guidelineDistance: 20,
                    maxGuideLineLength: 4000,
                    shapeOptions: {
                      stroke: true,
                      color: '#2e7d32',
                      weight: 4,
                      opacity: 0.8,
                      fill: true,
                      fillColor: '#2e7d32',
                      fillOpacity: 0.2,
                      clickable: true
                    }
                  }
                }}
                edit={{
                  featureGroup: featureGroupRef.current,
                  remove: true
                }}
              />
            </FeatureGroup>
          )}
        </MapContainer>
        
        {/* Crop Selector */}
        <div className="mt-6">
          <CropSelector 
            selectedCrop={selectedCrop}
            onCropChange={setSelectedCrop}
            cropInfo={cropInfo}
          />
        </div>
        
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          {!isPreloaded && (
            <button
              onClick={handleUseSample}
              className="bg-secondary hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              Use Sample Field
            </button>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 ml-auto">
            <button
              onClick={handleQuickAnalysis}
              className="bg-accent hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              Quick Analysis
            </button>
            <button
              onClick={handleAnalyze}
              className="bg-primary hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
            >
              Full Analysis
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        {isPreloaded ? (
          <div>
            <p className="text-blue-700 font-semibold mb-2">
              ✓ Farm Boundary Loaded from Land Records
            </p>
            <p className="text-blue-600 text-sm">
              The <strong className="text-red-600">RED boundary</strong> shown on the satellite map represents your registered farm field 
              as per village land records. This boundary is based on the survey number and official records. 
              Click "Full Analysis" to get detailed irrigation recommendations for this field.
            </p>
            {selectedFarm.survey_number && (
              <p className="text-blue-600 text-sm mt-2">
                <strong>Official Survey Number:</strong> {selectedFarm.survey_number}
                {selectedFarm.district && ` | District: ${selectedFarm.district}`}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-blue-700 font-semibold mb-2">
              📐 How to Draw Your Field Boundary (4+ Points):
            </p>
            <ol className="text-blue-600 text-sm space-y-1 list-decimal list-inside">
              <li>Click the <strong className="text-green-600">polygon icon ▣</strong> in the top-right corner of the map</li>
              <li><strong>Click</strong> on the map to place point 1</li>
              <li><strong>Click</strong> again for point 2</li>
              <li><strong>Click</strong> again for point 3</li>
              <li><strong>KEEP CLICKING</strong> for points 4, 5, 6, etc. (as many corners as your field has!)</li>
              <li><strong>To finish:</strong> Click the <strong className="text-red-600">FIRST point</strong> to close the polygon</li>
            </ol>
            <div className="bg-orange-100 border-l-4 border-orange-500 p-3 mt-3 rounded">
              <p className="text-orange-800 text-sm font-bold">
                ⚠️ IMPORTANT: The polygon does NOT auto-complete!
              </p>
              <p className="text-orange-700 text-xs mt-1">
                After clicking 3 points, you'll see a triangle shape. This is temporary - just <strong>keep clicking</strong> to add more points. 
                The polygon only completes when you click the first point again to close it.
              </p>
            </div>
            <p className="text-gray-600 text-xs mt-2">
              💡 Quick option: Click <strong>"Use Sample Field"</strong> button below to skip drawing
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldSelector;