import React from 'react';

const WaterEfficiency = ({ waterEfficiency }) => {
  const savingsPercentage = waterEfficiency?.savings_percentage || 0;
  const savingsMM = waterEfficiency?.savings_mm || 0;
  const currentEfficiency = waterEfficiency?.current_efficiency || 0;
  const explanation = waterEfficiency?.explanation || 'No data available';

  // Determine efficiency color
  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 70) return 'bg-green-500';
    if (efficiency >= 50) return 'bg-yellow-500';
    if (efficiency >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Water Efficiency</h2>
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-3xl font-bold text-primary">{savingsPercentage.toFixed(1)}%</div>
          <div className="text-gray-600">Potential Water Savings</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-secondary">{savingsMM.toFixed(1)}mm</div>
          <div className="text-gray-600">Water Savings per Season</div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Current Efficiency</span>
          <span className="font-semibold">{currentEfficiency.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className={`h-4 rounded-full transition-all ${getEfficiencyColor(currentEfficiency)}`}
            style={{ width: `${currentEfficiency}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Recommendation:</span> {explanation}
        </p>
      </div>
    </div>
  );
};

export default WaterEfficiency;