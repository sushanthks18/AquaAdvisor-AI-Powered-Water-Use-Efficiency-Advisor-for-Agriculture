import React, { useState } from 'react';
import { Droplet, Calendar, TrendingDown, Info } from 'lucide-react';

const IrrigationZonePlanner = ({ irrigationZones, irrigationSchedule, irrigationSteps, totalWaterLiters, waterSavings, metadata }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  if (!irrigationZones) {
    return null;
  }

  const languages = {
    english: 'English',
    hindi: 'हिंदी',
    tamil: 'தமிழ்'
  };

  // Sort zones by priority
  const sortedZones = Object.entries(irrigationZones)
    .sort(([, a], [, b]) => a.priority - b.priority)
    .filter(([, zone]) => zone.area_acres > 0.05); // Only show zones with significant area

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      {/* Header with Language Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <Droplet className="inline-block mr-2 h-6 w-6 text-blue-600" />
          Irrigation Action Plan
        </h2>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(languages).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </div>

      {/* Farm Info */}
      {metadata && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-600">Total Area</span>
              <p className="text-lg font-semibold">{metadata.field_area_acres} acres</p>
              <p className="text-xs text-gray-500">({metadata.field_area_hectares} hectares)</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Health Score</span>
              <p className="text-lg font-semibold">{metadata.health_score}%</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Analysis Date</span>
              <p className="text-lg font-semibold">{new Date(metadata.analysis_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Land Type</span>
              <p className="text-lg font-semibold capitalize">{metadata.land_use || 'Agricultural'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Colored Irrigation Zones */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          📍 Irrigation Zones by Priority
        </h3>
        <div className="space-y-4">
          {sortedZones.map(([colorKey, zone]) => {
            const zoneText = zone[selectedLanguage];
            return (
              <div
                key={colorKey}
                className="border-l-4 rounded-lg p-4 shadow-sm"
                style={{ borderColor: zone.color, backgroundColor: `${zone.color}10` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">{zoneText.title}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Area:</span>
                        <span className="ml-2 font-semibold">{zone.area_acres} acres ({zone.area_hectares} ha)</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Coverage:</span>
                        <span className="ml-2 font-semibold">{zone.percentage}% of field</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-gray-700">
                        <span className="font-semibold">Action:</span> {zoneText.action}
                      </p>
                      <p className="text-gray-700 mt-1">
                        <span className="font-semibold">Reason:</span> {zoneText.reason}
                      </p>
                      {zone.water_liters > 0 && (
                        <p className="text-gray-700 mt-1">
                          <span className="font-semibold">Water Needed:</span> {zone.water_liters.toLocaleString()} liters ({zone.water_mm}mm)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                      style={{ backgroundColor: zone.color }}
                    >
                      {zone.priority}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Irrigation Schedule */}
      {irrigationSchedule && irrigationSchedule.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            <Calendar className="inline-block mr-2 h-5 w-5" />
            Irrigation Schedule
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-3">
              {irrigationSchedule.map((schedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      schedule.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                      schedule.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {schedule.priority}
                    </div>
                    <div>
                      <p className="font-semibold">{schedule.day_name}</p>
                      <p className="text-sm text-gray-600">{schedule.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{schedule.water_liters.toLocaleString()} L</p>
                    <p className="text-xs text-gray-500">
                      {schedule.zones.map(z => z.toUpperCase()).join(', ')} zones
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Instructions */}
      {irrigationSteps && irrigationSteps.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            🚜 Step-by-Step Irrigation Guide
          </h3>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="space-y-3">
              {irrigationSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{step.action}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>💧 {step.water}</span>
                      <span>⏰ {step.timing}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Water Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Water Needed */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-3">
            <Droplet className="h-6 w-6 text-blue-600 mr-2" />
            <h4 className="text-lg font-semibold text-gray-800">Total Water Needed</h4>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {totalWaterLiters ? totalWaterLiters.toLocaleString() : 0} Liters
          </div>
          <p className="text-sm text-gray-600">
            For critical, high, and moderate stress zones only
          </p>
        </div>

        {/* Water Savings */}
        {waterSavings && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-3">
              <TrendingDown className="h-6 w-6 text-green-600 mr-2" />
              <h4 className="text-lg font-semibold text-gray-800">Water Savings</h4>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {waterSavings.potential_savings_liters ? waterSavings.potential_savings_liters.toLocaleString() : 0} Liters
            </div>
            <p className="text-sm text-gray-600">
              {waterSavings.savings_explanation}
            </p>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">
              {selectedLanguage === 'hindi' ? '💡 सलाह:' : 
               selectedLanguage === 'tamil' ? '💡 ஆலோசனை:' : 
               '💡 Tip:'}
            </p>
            <p>
              {selectedLanguage === 'hindi' 
                ? 'सुबह (6-8 बजे) या शाम (4-6 बजे) पानी दें। दोपहर में पानी देने से पानी की बर्बादी होती है।'
                : selectedLanguage === 'tamil'
                ? 'காலை (6-8 மணி) அல்லது மாலை (4-6 மணி) நீர் கொடுக்கவும். நண்பகல் நீர் வீணாகும்.'
                : 'Water in early morning (6-8 AM) or evening (4-6 PM). Avoid midday watering to prevent water loss due to evaporation.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationZonePlanner;
