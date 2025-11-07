import React, { useState, useEffect } from 'react';
import { ArrowRight, Droplet, DollarSign, TrendingUp, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import axios from 'axios';

const DemoComparison = ({ isOpen, onClose }) => {
  const [demos, setDemos] = useState([]);
  const [selectedDemo, setSelectedDemo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchDemos();
    }
  }, [isOpen]);

  const fetchDemos = async () => {
    try {
      setLoading(true);
      // Fixed the API endpoint to use the correct port (5002 instead of 5000)
      const response = await axios.get('http://localhost:5002/api/demo-comparison');
      setDemos(response.data.demos || []);
      if (response.data.demos && response.data.demos.length > 0) {
        setSelectedDemo(response.data.demos[0]);
      }
    } catch (error) {
      console.error('Failed to load demo data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatNumber = (num) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('en-IN');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Before/After Comparison</h2>
              <p className="text-blue-100">See the real-world impact of AI-optimized irrigation</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading demo data...</p>
          </div>
        ) : (
          <div className="p-6">
            {/* Demo Selector */}
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
              {demos.map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => setSelectedDemo(demo)}
                  className={`flex-shrink-0 px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedDemo?.id === demo.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <p>{demo.name}</p>
                  <p className="text-xs opacity-80">{demo.field_area_ha} ha • {demo.location}</p>
                </button>
              ))}
            </div>

            {selectedDemo && (
              <>
                {/* Split Screen Comparison */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* LEFT - Traditional */}
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
                        <AlertCircle className="h-6 w-6" />
                        Traditional Irrigation
                      </h3>
                      <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                        OLD METHOD
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Uniform Irrigation Visual */}
                      <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                        <p className="text-sm text-gray-600 mb-3 font-medium">Uniform Irrigation Map</p>
                        <div className="grid grid-cols-4 gap-1">
                          {Array(16).fill(0).map((_, i) => (
                            <div key={i} className="aspect-square bg-gradient-to-br from-yellow-300 to-orange-400 rounded"></div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">Same water everywhere - wasteful</p>
                      </div>

                      {/* Stats */}
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Droplet className="h-5 w-5 text-red-500" />
                              <span className="text-sm text-gray-600">Water Usage</span>
                            </div>
                            <span className="text-xl font-bold text-red-700">
                              {formatNumber(selectedDemo.comparison.traditional.water_liters)}L
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-red-500" />
                              <span className="text-sm text-gray-600">Cost</span>
                            </div>
                            <span className="text-xl font-bold text-red-700">
                              {formatCurrency(selectedDemo.comparison.traditional.cost)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-5 w-5 text-red-500" />
                              <span className="text-sm text-gray-600">Stress Zones</span>
                            </div>
                            <span className="text-xl font-bold text-red-700">
                              {selectedDemo.comparison.traditional.stress_percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-red-500" />
                              <span className="text-sm text-gray-600">Yield</span>
                            </div>
                            <span className="text-xl font-bold text-red-700">
                              {selectedDemo.comparison.traditional.yield_quintal_per_ha} Q/ha
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT - AI Optimized */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                        <CheckCircle className="h-6 w-6" />
                        AI-Optimized
                      </h3>
                      <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                        NEW METHOD
                      </span>
                    </div>

                    <div className="space-y-4">
                      {/* Zone-based Irrigation Visual */}
                      <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                        <p className="text-sm text-gray-600 mb-3 font-medium">Zone-based Irrigation Map</p>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            'bg-green-600', 'bg-green-500', 'bg-green-600', 'bg-yellow-400',
                            'bg-green-500', 'bg-green-600', 'bg-green-500', 'bg-green-600',
                            'bg-green-600', 'bg-yellow-400', 'bg-green-500', 'bg-green-600',
                            'bg-green-500', 'bg-green-600', 'bg-green-600', 'bg-green-500'
                          ].map((colorClass, i) => (
                            <div key={i} className={`aspect-square ${colorClass} rounded`}></div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">Optimized per zone - efficient</p>
                      </div>

                      {/* Stats */}
                      <div className="space-y-3">
                        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Droplet className="h-5 w-5 text-green-500" />
                              <span className="text-sm text-gray-600">Water Usage</span>
                            </div>
                            <span className="text-xl font-bold text-green-700">
                              {formatNumber(selectedDemo.comparison.optimized.water_liters)}L
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-green-500" />
                              <span className="text-sm text-gray-600">Cost</span>
                            </div>
                            <span className="text-xl font-bold text-green-700">
                              {formatCurrency(selectedDemo.comparison.optimized.cost)}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-sm text-gray-600">Stress Zones</span>
                            </div>
                            <span className="text-xl font-bold text-green-700">
                              {selectedDemo.comparison.optimized.stress_percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-green-500" />
                              <span className="text-sm text-gray-600">Yield</span>
                            </div>
                            <span className="text-xl font-bold text-green-700">
                              {selectedDemo.comparison.optimized.yield_quintal_per_ha} Q/ha
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Banner */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Zap className="h-10 w-10" />
                    <h3 className="text-3xl font-bold">Total Savings with AquaAdvisor</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-green-100 text-sm mb-1">Water Saved</p>
                      <p className="text-4xl font-bold">{formatNumber(selectedDemo.comparison.savings.water_liters)}L</p>
                      <p className="text-green-100 text-sm mt-1">({selectedDemo.comparison.savings.water_percentage}% reduction)</p>
                    </div>
                    <div>
                      <p className="text-green-100 text-sm mb-1">Cost Saved</p>
                      <p className="text-4xl font-bold">{formatCurrency(selectedDemo.comparison.savings.cost)}</p>
                      <p className="text-green-100 text-sm mt-1">Per season</p>
                    </div>
                    <div>
                      <p className="text-green-100 text-sm mb-1">Annual Benefit</p>
                      <p className="text-4xl font-bold">{formatCurrency(selectedDemo.annual_savings)}</p>
                      <p className="text-green-100 text-sm mt-1">Including yield improvement</p>
                    </div>
                  </div>
                  <p className="mt-6 text-lg text-green-100 italic">
                    "By following AI recommendations, save water, money, and increase yields!"
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoComparison;
