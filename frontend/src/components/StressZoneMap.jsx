import React from 'react';

const StressZoneMap = ({ stressMap }) => {
  // Add data URI prefix if not present
  const imageSource = stressMap && !stressMap.startsWith('data:') 
    ? `data:image/png;base64,${stressMap}` 
    : stressMap;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Stress Zone Map</h2>
      {imageSource ? (
        <div className="flex justify-center">
          <img 
            src={imageSource}
            alt="Stress Zone Map" 
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      ) : (
        <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
          <span className="text-gray-500">Stress zone map not available</span>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span className="text-sm">Critical Stress</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
          <span className="text-sm">High Stress</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
          <span className="text-sm">Moderate Stress</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span className="text-sm">Healthy</span>
        </div>
      </div>
    </div>
  );
};

export default StressZoneMap;