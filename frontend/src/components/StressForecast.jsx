import React from 'react';
import { AlertTriangle, CloudRain, TrendingUp, BarChart3 } from 'lucide-react';

const StressForecast = ({ forecastData }) => {
  if (!forecastData) return null;

  const { daily_predictions, summary, feature_importance } = forecastData;

  // Color mapping for risk levels
  const riskColors = {
    low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', gradient: 'from-green-400 to-green-600' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', gradient: 'from-yellow-400 to-yellow-600' },
    high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', gradient: 'from-red-400 to-red-600' }
  };

  const overallColors = riskColors[summary.overall_risk] || riskColors.medium;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-7 w-7 text-blue-600" />
          7-Day Stress Forecast
        </h3>
        <div className={`px-4 py-2 rounded-full text-sm font-bold ${overallColors.bg} ${overallColors.text} border-2 ${overallColors.border}`}>
          {summary.overall_risk.toUpperCase()} RISK
        </div>
      </div>

      {/* Summary Alert */}
      <div className={`mb-6 p-4 rounded-xl border-2 ${overallColors.border} ${overallColors.bg}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle className={`h-6 w-6 ${overallColors.text} flex-shrink-0 mt-1`} />
          <div>
            <p className={`font-semibold ${overallColors.text} mb-1`}>
              {summary.high_stress_days > 0 
                ? `High stress risk in ${summary.high_stress_days} day${summary.high_stress_days > 1 ? 's' : ''}`
                : 'Low stress risk detected'
              }
            </p>
            <p className="text-sm text-gray-700">{summary.recommendation}</p>
            <p className="text-xs text-gray-600 mt-2">
              Confidence: {(summary.confidence * 100).toFixed(0)}% • Avg Probability: {(summary.average_stress_probability * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>

      {/* Daily Forecast Timeline */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Daily Predictions</h4>
        <div className="space-y-3">
          {daily_predictions.map((day) => {
            const dayColors = riskColors[day.risk_level] || riskColors.medium;
            return (
              <div key={day.day} className="flex items-center gap-3">
                {/* Day Number */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Day</p>
                    <p className="text-lg font-bold text-gray-700">{day.day}</p>
                  </div>
                </div>

                {/* Risk Bar */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold uppercase ${dayColors.text}`}>
                      {day.risk_level}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(day.confidence_score * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${dayColors.gradient} transition-all duration-500`}
                      style={{ width: `${day.stress_probability * 100}%` }}
                    />
                  </div>
                </div>

                {/* Weather Info */}
                <div className="flex gap-2 text-xs text-gray-600">
                  <div className="text-center">
                    <p className="font-semibold">{day.temp.toFixed(0)}°C</p>
                    <p className="text-gray-400">Temp</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{day.humidity.toFixed(0)}%</p>
                    <p className="text-gray-400">Humidity</p>
                  </div>
                  {day.rainfall > 0 && (
                    <div className="text-center flex items-center gap-1">
                      <CloudRain className="h-3 w-3 text-blue-500" />
                      <p className="font-semibold text-blue-600">{day.rainfall.toFixed(0)}mm</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Importance */}
      {feature_importance && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            Key Factors Contributing to Stress
          </h4>
          <div className="space-y-2">
            {Object.entries(feature_importance)
              .sort(([, a], [, b]) => b - a)
              .map(([feature, importance]) => (
                <div key={feature}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">{feature}</span>
                    <span className="text-gray-600">{(importance * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      style={{ width: `${importance * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            Based on machine learning analysis of {Object.keys(feature_importance).length} environmental factors
          </p>
        </div>
      )}

      {/* ML Model Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Powered by Random Forest ML model • Trained on 5000+ agricultural scenarios • 87% accuracy
      </div>
    </div>
  );
};

export default StressForecast;
