import React, { useState, useEffect } from 'react';
import { Satellite } from 'lucide-react';

const AnalysisLoading = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    { name: 'Fetching Satellite Data', duration: 2000 },
    { name: 'Calculating NDVI', duration: 1500 },
    { name: 'Detecting Stress Zones', duration: 1500 },
    { name: 'Retrieving Weather Data', duration: 1000 },
    { name: 'Generating Recommendations', duration: 1000 }
  ];

  useEffect(() => {
    let timer = null;
    
    const advanceStep = () => {
      if (currentStep < steps.length - 1) {
        timer = setTimeout(() => {
          setCurrentStep(prev => prev + 1);
          advanceStep();
        }, steps[currentStep].duration);
      }
    };
    
    advanceStep();
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentStep]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Satellite className="h-16 w-16 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary rounded-full opacity-20 animate-ping"></div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Your Field</h2>
          <p className="text-gray-600 mb-8">Processing satellite imagery and generating insights...</p>
          
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-center p-3 rounded-lg ${
                  index === currentStep 
                    ? 'bg-blue-50 border border-blue-200' 
                    : index < currentStep 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className={`mr-3 h-3 w-3 rounded-full ${
                  index === currentStep 
                    ? 'bg-blue-500 animate-pulse' 
                    : index < currentStep 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}></div>
                <span className={
                  index === currentStep 
                    ? 'font-medium text-blue-700' 
                    : index < currentStep 
                      ? 'text-green-700' 
                      : 'text-gray-500'
                }>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-500 italic">
              Did you know? Sentinel-2 satellites revisit the same area every 5 days, 
              providing frequent updates on crop health.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoading;