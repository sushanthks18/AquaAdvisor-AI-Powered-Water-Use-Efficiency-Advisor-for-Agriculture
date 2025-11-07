import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, RefreshCw, Sparkles } from 'lucide-react';
import NDVIVisualization from './NDVIVisualization';
import StressZoneMap from './StressZoneMap';
import IrrigationZonePlanner from './IrrigationZonePlanner';
import RecommendationCards from './RecommendationCards';
import WaterEfficiency from './WaterEfficiency';
import ROISavingsCard from './ROISavingsCard';
import StressForecast from './StressForecast';
import DemoComparison from './DemoComparison';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ResultsDashboard = ({ data, onNewAnalysis }) => {
  const navigate = useNavigate();
  const [showDemoComparison, setShowDemoComparison] = useState(false);
  const [stressForecast, setStressForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  
  // Validate data
  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Missing</h2>
          <p className="text-gray-600 mb-6">Unable to load analysis data. Please try again.</p>
          <button
            onClick={onNewAnalysis}
            className="bg-primary text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5 inline mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleNewAnalysis = () => {
    onNewAnalysis();
    navigate('/analyze');
  };

  // Fetch ML stress forecast on component mount
  useEffect(() => {
    const fetchStressForecast = async () => {
      try {
        setLoadingForecast(true);
        const currentNDVI = data?.statistics?.mean || 0.5;
        const response = await axios.post('http://localhost:5000/api/predict-future-stress', {
          current_ndvi: currentNDVI,
          lat: data?.metadata?.lat || 28.6139,
          lon: data?.metadata?.lon || 77.2090
        });
        setStressForecast(response.data);
      } catch (error) {
        console.error('Failed to fetch stress forecast:', error);
      } finally {
        setLoadingForecast(false);
      }
    };

    if (data) {
      fetchStressForecast();
    }
  }, [data]);

  const handleExportPDF = async () => {
    try {
      // Show loading indicator
      const exportButton = document.querySelector('[data-pdf-export]');
      if (exportButton) {
        exportButton.disabled = true;
        exportButton.innerHTML = '<svg class="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating PDF...';
      }

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Add header
      pdf.setFillColor(16, 185, 129); // Primary green
      pdf.rect(0, 0, pageWidth, 30, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AquaAdvisor Field Analysis Report', margin, 20);
      
      // Add date
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, 26);
      
      yPosition = 40;

      // Reset text color for content
      pdf.setTextColor(0, 0, 0);

      // Field Overview Section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55); // Gray-800
      pdf.text('Field Overview', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(75, 85, 99); // Gray-600
      
      const healthScore = data?.metadata?.health_score || data?.overallHealth || 50;
      const meanNDVI = data?.statistics?.mean || 0.5;
      const fieldArea = data?.metadata?.field_area_hectares || data?.area?.value || 10;
      const waterDeficit = data?.water_deficit?.current_deficit_mm || 25;
      const zoneDistribution = data?.zone_distribution || {};
      const recommendations = data?.recommendations || [];
      const waterEfficiency = data?.water_efficiency || {};

      const overviewData = [
        ['Health Score:', `${healthScore.toFixed(1)}%`],
        ['Mean NDVI:', `${meanNDVI.toFixed(3)}`],
        ['Field Area:', `${fieldArea.toFixed(1)} hectares`],
        ['Water Deficit:', `${waterDeficit.toFixed(1)} mm`],
        ['Crop Type:', data?.metadata?.crop_name || 'Not specified'],
        ['Analysis Date:', data?.metadata?.analysis_date || new Date().toISOString().split('T')[0]]
      ];

      overviewData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, margin + 50, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Zone Distribution Section
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text('Stress Zone Distribution', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      Object.entries(zoneDistribution).forEach(([zone, stats]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${zone}:`, margin, yPosition);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${stats.percentage.toFixed(1)}% (NDVI: ${stats.mean_ndvi.toFixed(3)})`, margin + 35, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Recommendations Section
      if (recommendations && recommendations.length > 0) {
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(31, 41, 55);
        pdf.text('Irrigation Recommendations', margin, yPosition);
        yPosition += 10;

        recommendations.slice(0, 5).forEach((rec, index) => {
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          
          // Priority color
          const priorityColors = {
            'CRITICAL': [220, 38, 38],
            'HIGH': [249, 115, 22],
            'MODERATE': [251, 191, 36],
            'INFO': [107, 114, 128]
          };
          const color = priorityColors[rec.urgency] || [107, 114, 128];
          pdf.setTextColor(...color);
          
          pdf.text(`${index + 1}. ${rec.urgency} - ${rec.zone}`, margin, yPosition);
          yPosition += 6;

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(75, 85, 99);
          pdf.text(`Action: ${rec.action}`, margin + 5, yPosition);
          yPosition += 5;
          pdf.text(`Water Amount: ${rec.water_amount}`, margin + 5, yPosition);
          yPosition += 5;
          pdf.text(`Timing: ${rec.timing}`, margin + 5, yPosition);
          yPosition += 5;
          pdf.text(`Reason: ${rec.reason}`, margin + 5, yPosition, { maxWidth: pageWidth - 2 * margin - 5 });
          yPosition += 8;
        });
      }

      // Water Efficiency Section
      if (waterEfficiency && Object.keys(waterEfficiency).length > 0) {
        if (yPosition > pageHeight - 50) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(31, 41, 55);
        pdf.text('Water Efficiency Analysis', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(75, 85, 99);
        
        const efficiencyData = [
          ['Current Efficiency:', `${(waterEfficiency.current_efficiency || 0).toFixed(1)}%`],
          ['Potential Savings:', `${(waterEfficiency.savings_percentage || 0).toFixed(1)}%`],
          ['Water Savings:', `${(waterEfficiency.savings_mm || 0).toFixed(1)} mm`],
          ['Note:', waterEfficiency.explanation || 'N/A']
        ];

        efficiencyData.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, margin, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(value, margin + 50, yPosition, { maxWidth: pageWidth - margin - 50 - margin });
          yPosition += 6;
        });
      }

      // ROI Section
      if (data?.roi_analysis) {
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = margin;
        }

        const roi = data.roi_analysis;
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(31, 41, 55);
        pdf.text('Return on Investment Analysis', margin, yPosition);
        yPosition += 10;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(75, 85, 99);

        const roiData = [
          ['Water Saved:', `${(roi.savings?.water_saved_percentage || 0).toFixed(1)}%`],
          ['Cost Saved:', `₹${(roi.savings?.cost_saved || 0).toLocaleString()}`],
          ['Yield Increase:', `${(roi.savings?.yield_increase_percentage || 0).toFixed(1)}%`],
          ['Total Benefit:', `₹${(roi.roi?.total_benefit || 0).toLocaleString()}`],
          ['ROI Percentage:', `${(roi.roi?.roi_percentage || 0).toFixed(1)}%`],
          ['Payback Period:', `${(roi.roi?.payback_months || 0).toFixed(1)} months`]
        ];

        roiData.forEach(([label, value]) => {
          pdf.setFont('helvetica', 'bold');
          pdf.text(label, margin, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.text(value, margin + 50, yPosition);
          yPosition += 6;
        });
      }

      // Footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(
          `AquaAdvisor - AI-Powered Irrigation Optimization | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `AquaAdvisor_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      // Reset button
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.innerHTML = '<svg class="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Export PDF';
      }

    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
      
      // Reset button on error
      const exportButton = document.querySelector('[data-pdf-export]');
      if (exportButton) {
        exportButton.disabled = false;
        exportButton.innerHTML = '<svg class="mr-2 h-4 w-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>Export PDF';
      }
    }
  };

  // Format data for display
  const healthScore = data?.metadata?.health_score || 0;
  const meanNDVI = data?.statistics?.mean || 0;
  const fieldArea = data?.metadata?.field_area_hectares || 0;
  const waterDeficit = data?.water_deficit?.deficit_mm || 0;
  const zoneDistribution = data?.zone_distribution || {};
  const quadrantAnalysis = data?.quadrant_analysis || {};
  const weather = data?.weather || {};
  const recommendations = data?.recommendations || [];
  const waterEfficiency = data?.water_efficiency || {};
  const irrigationZones = data?.irrigation_zones || null;
  const irrigationSchedule = data?.irrigation_schedule || [];
  const irrigationSteps = data?.irrigation_steps || [];
  const totalWaterLiters = data?.total_water_liters || 0;
  const waterSavings = data?.water_savings || null;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Field Analysis Results</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDemoComparison(true)}
            className="flex items-center bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 shadow-lg"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Demo Comparison
          </button>
          <button
            onClick={handleNewAnalysis}
            className="flex items-center bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg border border-gray-300 transition duration-300"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            New Analysis
          </button>
          <button
            onClick={handleExportPDF}
            data-pdf-export
            className="flex items-center bg-primary hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Health Score</h3>
          <div className="text-3xl font-bold text-primary">{healthScore.toFixed(1)}%</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Mean NDVI</h3>
          <div className="text-3xl font-bold text-secondary">{meanNDVI.toFixed(3)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Field Area</h3>
          <div className="text-3xl font-bold text-accent">{fieldArea.toFixed(1)} ha</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Water Deficit</h3>
          <div className="text-3xl font-bold text-red-500">{waterDeficit.toFixed(1)} mm</div>
        </div>
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <NDVIVisualization ndviMap={data?.ndvi_map} />
        <StressZoneMap stressMap={data?.stress_map} />
      </div>

      {/* ROI Analysis and ML Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {data?.roi_analysis && (
          <ROISavingsCard roiAnalysis={data.roi_analysis} />
        )}
        {stressForecast && (
          <StressForecast forecastData={stressForecast} />
        )}
        {loadingForecast && !stressForecast && (
          <div className="bg-white rounded-2xl shadow-xl p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Generating ML stress forecast...</p>
            </div>
          </div>
        )}
      </div>

      {/* NEW: Detailed Irrigation Zone Planner with Bilingual Support */}
      {irrigationZones && (
        <IrrigationZonePlanner
          irrigationZones={irrigationZones}
          irrigationSchedule={irrigationSchedule}
          irrigationSteps={irrigationSteps}
          totalWaterLiters={totalWaterLiters}
          waterSavings={waterSavings}
          metadata={data?.metadata}
        />
      )}

      {/* Zone Distribution and Quadrant Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Zone Distribution</h2>
          <div className="space-y-4">
            {Object.entries(zoneDistribution).map(([zone, stats]) => (
              <div key={zone} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3" 
                    style={{ backgroundColor: stats.color }}
                  ></div>
                  <span className="font-medium">{zone}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{stats.percentage.toFixed(1)}%</div>
                  <div className="text-sm text-gray-500">NDVI: {stats.mean_ndvi.toFixed(3)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quadrant Analysis</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quadrant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mean NDVI</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stressed %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(quadrantAnalysis).map(([name, stats]) => (
                  <tr key={name}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{name}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{stats.mean_ndvi.toFixed(3)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{stats.stressed_percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <RecommendationCards recommendations={recommendations} />
      </div>

      {/* Water Efficiency */}
      <div className="mb-8">
        <WaterEfficiency waterEfficiency={waterEfficiency} />
      </div>

      {/* Weather Summary */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Weather Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-500">Temperature</div>
            <div className="text-xl font-semibold">{weather.temperature}°C</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-500">Humidity</div>
            <div className="text-xl font-semibold">{weather.humidity}%</div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-500">Conditions</div>
            <div className="text-xl font-semibold capitalize">{weather.description}</div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 rounded-xl p-6 text-sm text-gray-500">
        <div className="flex flex-wrap gap-4">
          <div>Analysis Date: {data?.metadata?.analysis_date}</div>
          <div>Processed: {data?.metadata?.timestamp}</div>
          {data?.metadata?.crop_name && <div>Crop: {data.metadata.crop_name}</div>}
        </div>
      </div>

      {/* Demo Comparison Modal */}
      <DemoComparison 
        isOpen={showDemoComparison} 
        onClose={() => setShowDemoComparison(false)} 
      />
    </div>
  );
};

export default ResultsDashboard;