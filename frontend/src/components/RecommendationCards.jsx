import React from 'react';

const RecommendationCards = ({ recommendations }) => {
  const getUrgencyClass = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'MAINTENANCE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INFO': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyBorder = (urgency) => {
    switch (urgency) {
      case 'CRITICAL': return 'border-l-4 border-l-red-500';
      case 'HIGH': return 'border-l-4 border-l-orange-500';
      case 'MODERATE': return 'border-l-4 border-l-yellow-500';
      case 'MAINTENANCE': return 'border-l-4 border-l-blue-500';
      case 'INFO': return 'border-l-4 border-l-green-500';
      default: return 'border-l-4 border-l-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Irrigation Recommendations</h2>
      {recommendations && recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <div 
              key={index} 
              className={`border rounded-lg p-4 ${getUrgencyClass(rec.urgency)} ${getUrgencyBorder(rec.urgency)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className="font-bold text-lg mr-2">#{rec.priority}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${getUrgencyClass(rec.urgency)}`}>
                    {rec.urgency}
                  </span>
                </div>
                <span className="text-sm font-medium bg-gray-200 px-2 py-1 rounded">
                  {rec.zone}
                </span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{rec.action}</h3>
              <p className="text-sm mb-3">{rec.reason}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-gray-200 px-2 py-1 rounded">
                  <span className="font-medium">Water:</span> {rec.water_amount}
                </span>
                <span className="bg-gray-200 px-2 py-1 rounded">
                  <span className="font-medium">Timing:</span> {rec.timing}
                </span>
                <span className="bg-gray-200 px-2 py-1 rounded">
                  <span className="font-medium">Cost:</span> {rec.cost_impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-100 border-2 border-dashed rounded-xl w-full h-32 flex items-center justify-center">
          <span className="text-gray-500">No recommendations available</span>
        </div>
      )}
    </div>
  );
};

export default RecommendationCards;