import React from 'react';
import { DollarSign, Droplet, TrendingUp, Target, ArrowUp, ArrowDown } from 'lucide-react';

const ROISavingsCard = ({ roiAnalysis }) => {
  if (!roiAnalysis) return null;

  const { current_scenario, optimized_scenario, savings, roi, inputs } = roiAnalysis;

  // Format currency in INR
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('en-IN');
  };

  return (
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl shadow-xl p-6 border-2 border-green-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Target className="h-7 w-7 text-green-600" />
            ROI Analysis
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Season savings for {inputs.field_area_ha} hectare {inputs.crop_name} field
          </p>
        </div>
        <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-bold">
          {roi.roi_percentage}% ROI
        </div>
      </div>

      {/* Main Savings Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Water Saved */}
        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Water Saved</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {formatNumber(savings.water_saved_liters)}L
          </div>
          <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <ArrowDown className="h-4 w-4 text-green-600" />
            {savings.water_saved_percentage}% reduction
          </div>
        </div>

        {/* Cost Saved */}
        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600">Cost Saved</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(savings.cost_saved)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Water cost savings
          </div>
        </div>

        {/* Yield Increase */}
        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-gray-600">Yield Increase</span>
          </div>
          <div className="text-3xl font-bold text-amber-600">
            +{savings.yield_improvement_percentage}%
          </div>
          <div className="text-sm text-gray-500 mt-1">
            +{savings.yield_increase_quintal.toFixed(1)} quintals
          </div>
        </div>

        {/* Additional Revenue */}
        <div className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600">Extra Revenue</span>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {formatCurrency(savings.revenue_increase)}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            From improved yield
          </div>
        </div>
      </div>

      {/* Total Season Benefit Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Total Season Benefit</p>
            <p className="text-4xl font-bold">{formatCurrency(savings.total_season_benefit)}</p>
            <p className="text-sm opacity-90 mt-2">
              Implementation cost: {formatCurrency(roi.implementation_cost)} • Payback: {roi.payback_months} months
            </p>
          </div>
          <div className="text-right">
            <ArrowUp className="h-12 w-12 ml-auto mb-2" />
            <p className="text-2xl font-bold">{roi.roi_percentage}%</p>
            <p className="text-xs opacity-90">Return on Investment</p>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl p-5 shadow-md">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">Current vs Optimized</h4>
        <div className="space-y-4">
          {/* Water Usage */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Water Usage</span>
              <span>{formatNumber(current_scenario.water_usage_liters)}L → {formatNumber(optimized_scenario.water_usage_liters)}L</span>
            </div>
            <div className="flex gap-2 h-6">
              <div className="flex-1 bg-red-200 rounded-l-lg flex items-center justify-center text-xs font-medium text-red-800">
                Current
              </div>
              <div 
                className="bg-green-500 rounded-r-lg flex items-center justify-center text-xs font-medium text-white"
                style={{ width: `${(optimized_scenario.water_usage_liters / current_scenario.water_usage_liters) * 100}%` }}
              >
                Optimized
              </div>
            </div>
          </div>

          {/* Cost */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Total Cost</span>
              <span>{formatCurrency(current_scenario.water_cost)} → {formatCurrency(optimized_scenario.water_cost)}</span>
            </div>
            <div className="flex gap-2 h-6">
              <div className="flex-1 bg-red-200 rounded-l-lg flex items-center justify-center text-xs font-medium text-red-800">
                Current
              </div>
              <div 
                className="bg-green-500 rounded-r-lg flex items-center justify-center text-xs font-medium text-white"
                style={{ width: `${(optimized_scenario.water_cost / current_scenario.water_cost) * 100}%` }}
              >
                Optimized
              </div>
            </div>
          </div>

          {/* Yield */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Yield</span>
              <span>{current_scenario.yield_quintal}Q → {optimized_scenario.yield_quintal}Q</span>
            </div>
            <div className="flex gap-2 h-6">
              <div 
                className="bg-amber-300 rounded-l-lg flex items-center justify-center text-xs font-medium text-amber-900"
                style={{ width: `${(current_scenario.yield_quintal / optimized_scenario.yield_quintal) * 100}%` }}
              >
                Current
              </div>
              <div className="flex-1 bg-green-600 rounded-r-lg flex items-center justify-center text-xs font-medium text-white">
                Optimized
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Based on: {inputs.irrigation_method} irrigation • ₹{inputs.water_rate_per_1000l}/1000L • {inputs.irrigation_cycles} cycles/season
      </div>
    </div>
  );
};

export default ROISavingsCard;
