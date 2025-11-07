import React, { useState, useEffect } from 'react';
import { Sprout } from 'lucide-react';

const CROPS = [
  { id: 'rice', name: 'Rice', icon: '🌾', color: 'from-green-400 to-green-600' },
  { id: 'wheat', name: 'Wheat', icon: '🌾', color: 'from-yellow-400 to-yellow-600' },
  { id: 'cotton', name: 'Cotton', icon: '☁️', color: 'from-white to-gray-300' },
  { id: 'sugarcane', name: 'Sugarcane', icon: '🎋', color: 'from-green-500 to-emerald-700' },
  { id: 'maize', name: 'Maize', icon: '🌽', color: 'from-yellow-500 to-amber-600' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬', color: 'from-green-300 to-lime-600' }
];

const CropSelector = ({ selectedCrop, onCropChange, cropInfo }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selected = CROPS.find(c => c.id === selectedCrop) || CROPS[1]; // Default wheat

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <Sprout className="h-4 w-4 text-green-600" />
        Select Crop Type
      </label>
      
      <div className="relative">
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border-2 border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between hover:border-green-500 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selected.icon}</span>
            <div className="text-left">
              <p className="font-semibold text-gray-800">{selected.name}</p>
              {cropInfo && (
                <p className="text-xs text-gray-500">
                  {cropInfo.water_need_mm_per_week}mm/week • NDVI: {cropInfo.optimal_ndvi_range[0]}-{cropInfo.optimal_ndvi_range[1]}
                </p>
              )}
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
            {CROPS.map((crop) => (
              <button
                key={crop.id}
                type="button"
                onClick={() => {
                  onCropChange(crop.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gradient-to-r ${crop.color} hover:bg-opacity-10 transition-all ${
                  crop.id === selectedCrop ? 'bg-green-50 border-l-4 border-green-500' : ''
                }`}
              >
                <span className="text-2xl">{crop.icon}</span>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-800">{crop.name}</p>
                  <p className="text-xs text-gray-500">Optimal for {crop.name.toLowerCase()} farming</p>
                </div>
                {crop.id === selectedCrop && (
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Crop Info Card */}
      {cropInfo && (
        <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Crop Requirements</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-600">Water Need:</span>
              <p className="font-semibold text-green-700">{cropInfo.water_need_mm_per_week} mm/week</p>
            </div>
            <div>
              <span className="text-gray-600">Stress Tolerance:</span>
              <p className="font-semibold text-green-700 capitalize">{cropInfo.stress_tolerance}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Optimal NDVI Range:</span>
              <p className="font-semibold text-green-700">
                {cropInfo.optimal_ndvi_range[0].toFixed(2)} - {cropInfo.optimal_ndvi_range[1].toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropSelector;
