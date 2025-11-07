import React, { useState, useEffect } from 'react';
import { Search, MapPin, FileText, Droplets, TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SatelliteMap from '../components/SatelliteMap';
import StressZoneChart from '../components/StressZoneChart';
import IrrigationTable from '../components/IrrigationTable';
import ResultsDashboard from '../components/ResultsDashboard';
import AnalysisLoading from '../components/AnalysisLoading';
import { mockFarmDatabase, getDefaultFarm } from '../data/farmDatabase';
import { analyzeField } from '../services/api';

const FarmSearchPage = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('name'); // 'name' or 'registration'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 11.1271, lng: 78.6569 }); // Tamil Nadu
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Search farm - NEVER fails, always returns a farm
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      alert('Please enter a search term');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const query = searchQuery.toLowerCase().trim();
      
      // Try to find exact match
      let farm = mockFarmDatabase.find(f => 
        f.name.toLowerCase().includes(query) || 
        f.location.address.toLowerCase().includes(query) ||
        f.farmId.toLowerCase() === query
      );
      
      // If not found, use default demo farm
      if (!farm) {
        farm = getDefaultFarm(searchQuery);
      }
      
      setSelectedFarm(farm);
      setMapCenter(farm.location.coordinates);
      setLoading(false);
    }, 800);
  };

  // Calculate total water requirements
  const calculateTotals = (zones) => {
    const totals = {
      totalIncrease: 0,
      totalDecrease: 0,
      totalDaily: 0,
      monthlySavings: 0,
      costPerDay: 0
    };

    zones.forEach(zone => {
      const waterAmount = parseInt(zone.irrigationRecommendation.waterAmount);
      totals.totalDaily += waterAmount;
      
      if (zone.irrigationRecommendation.action === 'increase') {
        totals.totalIncrease += waterAmount;
      } else if (zone.irrigationRecommendation.action === 'decrease') {
        totals.totalDecrease += waterAmount;
      }
    });

    totals.monthlySavings = totals.totalDecrease * 30;
    totals.costPerDay = totals.totalDaily * 0.05; // ₹0.05 per liter

    return totals;
  };

  const totals = selectedFarm ? calculateTotals(selectedFarm.stressZones) : null;

  // Trigger full analysis for the selected farm
  const handleFullAnalysis = async () => {
    if (!selectedFarm || !selectedFarm.boundary) return;
    
    setIsAnalyzing(true);
    setShowFullAnalysis(true);
    
    try {
      const requestData = {
        field_boundary: selectedFarm.boundary.map(coord => [coord.lat, coord.lng]),
        crop_type: selectedFarm.cropType.toLowerCase(),
        use_sample: true
      };
      
      const response = await analyzeField(requestData);
      setAnalysisData(response.data);
    } catch (error) {
      console.error('Full analysis failed:', error);
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* Show full analysis if triggered */}
      {showFullAnalysis && isAnalyzing && <AnalysisLoading />}
      
      {showFullAnalysis && !isAnalyzing && analysisData && (
        <ResultsDashboard 
          data={analysisData}
          onNewAnalysis={() => {
            setShowFullAnalysis(false);
            setAnalysisData(null);
          }}
        />
      )}
      
      {/* Show farm search UI if not in full analysis mode */}
      {!showFullAnalysis && (
        <>
          {/* Header */}
          <div className="bg-white shadow-md border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Droplets className="w-8 h-8 text-primary" />
                  <h1 className="text-2xl font-bold text-gray-800">Farm Irrigation Analysis</h1>
                </div>
                <div className="text-sm text-gray-600">
                  Satellite-based Water Management
                </div>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="container mx-auto px-4 py-6">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              {/* Search Type Toggle */}
              <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-gray-700">Search By:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSearchType('name')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    searchType === 'name'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Farm Name/Location
                </button>
                <button
                  onClick={() => setSearchType('registration')}
                  className={`px-4 py-2 rounded-md transition-all ${
                    searchType === 'registration'
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Registration Number
                </button>
              </div>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchType === 'name'
                      ? 'e.g., Rajesh Farm, Thanjavur, Salem...'
                      : 'e.g., FARM001, REG12345...'
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Try: <span className="font-medium">Rajesh Farm</span>, <span className="font-medium">Salem</span>, <span className="font-medium">FARM001</span>, or any text
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                {loading ? 'Searching...' : 'Search'}
              </button>
            </form>
            </div>

            {/* Results */}
            {selectedFarm && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Map - 70% width on desktop */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-green-700 text-white p-4">
                    <h2 className="text-xl font-bold">{selectedFarm.name}</h2>
                    <p className="text-sm opacity-90">{selectedFarm.location.address}</p>
                  </div>
                  
                  <SatelliteMap 
                    farm={selectedFarm}
                    center={mapCenter}
                  />
                </div>
              </div>

              {/* Sidebar - 30% width on desktop */}
              <div className="space-y-6">
                {/* Farm Details Card */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Farm Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Farm ID:</span>
                      <span className="font-semibold">{selectedFarm.farmId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Area:</span>
                      <span className="font-semibold">{selectedFarm.area.value} {selectedFarm.area.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crop:</span>
                      <span className="font-semibold">{selectedFarm.cropType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Overall Health:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              selectedFarm.overallHealth >= 70 ? 'bg-green-500' :
                              selectedFarm.overallHealth >= 50 ? 'bg-yellow-500' :
                              selectedFarm.overallHealth >= 30 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${selectedFarm.overallHealth}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-lg">{selectedFarm.overallHealth}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Full Analysis Button */}
                  <button
                    onClick={handleFullAnalysis}
                    className="w-full mt-4 bg-gradient-to-r from-primary to-green-700 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-700 hover:to-primary transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-5 h-5" />
                    View Full Analysis (NDVI, ROI, ML Forecast)
                  </button>
                </div>

                {/* Stress Distribution Chart */}
                <StressZoneChart zones={selectedFarm.stressZones} />

                {/* Water Summary */}
                {totals && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Water Summary</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-red-500" />
                          <span className="text-gray-600">Daily Increase:</span>
                        </div>
                        <span className="font-bold text-red-600">{totals.totalIncrease}L</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">Daily Decrease:</span>
                        </div>
                        <span className="font-bold text-green-600">{totals.totalDecrease}L</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t">
                        <span className="text-gray-600">Total Daily:</span>
                        <span className="font-bold">{totals.totalDaily}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Savings:</span>
                        <span className="font-bold text-green-600">{totals.monthlySavings}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost/Day:</span>
                        <span className="font-bold">₹{totals.costPerDay.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

            {/* Irrigation Recommendations Table */}
            {selectedFarm && (
              <div className="mt-6">
                <IrrigationTable zones={selectedFarm.stressZones} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FarmSearchPage;
