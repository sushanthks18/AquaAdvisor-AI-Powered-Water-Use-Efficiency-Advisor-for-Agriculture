import React from 'react';

const NDVIVisualization = ({ ndviMap }) => {
  // Add data URI prefix if not present
  const imageSource = ndviMap && !ndviMap.startsWith('data:') 
    ? `data:image/png;base64,${ndviMap}` 
    : ndviMap;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">NDVI Visualization</h2>
      {imageSource ? (
        <div className="flex justify-center">
          <img 
            src={imageSource}
            alt="NDVI Map" 
            className="max-w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      ) : (
        <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-64 flex items-center justify-center">
          <span className="text-gray-500">NDVI visualization not available</span>
        </div>
      )}
      <div className="mt-4 text-sm text-gray-600">
        <p>
          The Normalized Difference Vegetation Index (NDVI) measures vegetation health. 
          Values range from -1 (bare soil/water) to 1 (dense vegetation).
        </p>
      </div>
    </div>
  );
};

export default NDVIVisualization;