import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Download } from 'lucide-react';

const IrrigationTable = ({ zones }) => {
  const [sortBy, setSortBy] = useState('priority');

  // Sort zones
  const sortedZones = [...zones].sort((a, b) => {
    const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
    
    switch (sortBy) {
      case 'priority':
        return priorityOrder[a.irrigationRecommendation.priority] - priorityOrder[b.irrigationRecommendation.priority];
      case 'zone':
        return a.zoneId - b.zoneId;
      case 'stress':
        return a.healthScore - b.healthScore;
      default:
        return 0;
    }
  });

  // Get action icon and color
  const getActionDisplay = (recommendation) => {
    switch (recommendation.action) {
      case 'increase':
        return {
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: `↑↑↑ INCREASE ${recommendation.percentage}%`
        };
      case 'decrease':
        return {
          icon: <TrendingDown className="w-5 h-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: `↓↓↓ DECREASE ${recommendation.percentage}%`
        };
      default:
        return {
          icon: <Minus className="w-5 h-5" />,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'MAINTAIN'
        };
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <AlertTriangle className="w-3 h-3" />
            URGENT
          </span>
        );
      case 'high':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300">
            LOW
          </span>
        );
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Zone', 'Location', 'Stress Level', 'Health Score', 'Priority', 'Action', 'Water Amount', 'Schedule', 'Reason'];
    const rows = zones.map(zone => [
      zone.zoneId,
      zone.location,
      zone.stressLevel,
      `${zone.healthScore}%`,
      zone.irrigationRecommendation.priority,
      `${zone.irrigationRecommendation.action} ${zone.irrigationRecommendation.percentage}%`,
      zone.irrigationRecommendation.waterAmount,
      zone.irrigationRecommendation.schedule.join(', '),
      zone.irrigationRecommendation.reason
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `irrigation-plan-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">Irrigation Recommendations</h3>
        
        <div className="flex items-center gap-4">
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
            >
              <option value="priority">Priority</option>
              <option value="zone">Zone ID</option>
              <option value="stress">Stress Level</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Mobile View - Cards */}
      <div className="lg:hidden space-y-4">
        {sortedZones.map((zone) => {
          const actionDisplay = getActionDisplay(zone.irrigationRecommendation);
          
          return (
            <div
              key={zone.zoneId}
              className={`border-2 ${actionDisplay.borderColor} ${actionDisplay.bgColor} rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-lg border-2 border-gray-300">
                    {zone.zoneId}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">{zone.location}</div>
                    <div className="text-sm text-gray-600 capitalize">{zone.stressLevel} ({zone.healthScore}%)</div>
                  </div>
                </div>
                {getPriorityBadge(zone.irrigationRecommendation.priority)}
              </div>

              <div className={`flex items-center gap-2 mb-3 ${actionDisplay.color} font-bold`}>
                {actionDisplay.icon}
                <span>{actionDisplay.text}</span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Water Amount:</span>
                  <span className="font-semibold">{zone.irrigationRecommendation.waterAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Schedule:</span>
                  <span className="font-semibold text-right">{zone.irrigationRecommendation.schedule.join(', ')}</span>
                </div>
                <div className="pt-2 border-t">
                  <span className="text-gray-700 italic">{zone.irrigationRecommendation.reason}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-bold text-gray-700">Zone</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Location</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Stress Level</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Priority</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Water Change</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Amount</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Schedule</th>
              <th className="text-left py-3 px-4 font-bold text-gray-700">Reason</th>
            </tr>
          </thead>
          <tbody>
            {sortedZones.map((zone) => {
              const actionDisplay = getActionDisplay(zone.irrigationRecommendation);
              
              return (
                <tr
                  key={zone.zoneId}
                  className={`border-b border-gray-100 hover:${actionDisplay.bgColor} transition-colors`}
                >
                  <td className="py-4 px-4">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                      {zone.zoneId}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold">{zone.location}</td>
                  <td className="py-4 px-4">
                    <div className="capitalize">
                      <span className="font-semibold">{zone.stressLevel}</span>
                      <div className="text-xs text-gray-600">{zone.healthScore}% health</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getPriorityBadge(zone.irrigationRecommendation.priority)}
                  </td>
                  <td className="py-4 px-4">
                    <div className={`flex items-center gap-2 ${actionDisplay.color} font-bold`}>
                      {actionDisplay.icon}
                      <span>{actionDisplay.text}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-semibold">
                    {zone.irrigationRecommendation.waterAmount}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    {zone.irrigationRecommendation.schedule.map((time, idx) => (
                      <div key={idx} className="whitespace-nowrap">{time}</div>
                    ))}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 italic max-w-xs">
                    {zone.irrigationRecommendation.reason}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
              <TrendingUp className="w-5 h-5" />
              Increase Water
            </div>
            <div className="text-2xl font-bold text-red-600">
              {zones.filter(z => z.irrigationRecommendation.action === 'increase').length} zones
            </div>
            <div className="text-sm text-red-600">Require more irrigation</div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-700 font-bold mb-2">
              <Minus className="w-5 h-5" />
              Maintain Current
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {zones.filter(z => z.irrigationRecommendation.action === 'maintain').length} zones
            </div>
            <div className="text-sm text-gray-600">Keep current schedule</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
              <TrendingDown className="w-5 h-5" />
              Decrease Water
            </div>
            <div className="text-2xl font-bold text-green-600">
              {zones.filter(z => z.irrigationRecommendation.action === 'decrease').length} zones
            </div>
            <div className="text-sm text-green-600">Risk of overwatering</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationTable;
