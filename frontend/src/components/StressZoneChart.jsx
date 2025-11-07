import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const StressZoneChart = ({ zones }) => {
  // Calculate distribution
  const distribution = {
    critical: 0,
    high: 0,
    moderate: 0,
    healthy: 0,
    optimal: 0
  };

  zones.forEach(zone => {
    distribution[zone.stressLevel]++;
  });

  const chartData = [
    { name: 'Critical', value: distribution.critical, color: '#DC2626' },
    { name: 'High', value: distribution.high, color: '#F97316' },
    { name: 'Moderate', value: distribution.moderate, color: '#FBBF24' },
    { name: 'Healthy', value: distribution.healthy, color: '#86EFAC' },
    { name: 'Optimal', value: distribution.optimal, color: '#22C55E' }
  ].filter(item => item.value > 0);

  const totalZones = zones.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Stress Distribution</h3>
      
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `${value} zone${value > 1 ? 's' : ''} (${((value/totalZones)*100).toFixed(0)}%)`}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
            <span className="text-sm font-semibold">
              {item.value} ({((item.value/totalZones)*100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StressZoneChart;
