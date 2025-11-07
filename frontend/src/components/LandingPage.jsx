import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Droplets, Leaf, Zap, Globe, TrendingUp, Shield, Clock, BarChart3, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleGetStarted = () => {
    // Check if user is already logged in
    const isAuthenticated = !!localStorage.getItem('access_token');
    if (isAuthenticated) {
      navigate('/analyze');
    } else {
      // Show modal instead of navigating
      setModalMessage('Please login to start field analysis');
      setShowAuthModal(true);
    }
  };

  const handleFarmSearch = () => {
    const isAuthenticated = !!localStorage.getItem('access_token');
    if (isAuthenticated) {
      navigate('/farms');
    } else {
      // Show modal instead of navigating
      setModalMessage('Please login to search registered farms');
      setShowAuthModal(true);
    }
  };

  // Generic handler for any feature access
  const handleFeatureAccess = (featureName) => {
    const isAuthenticated = !!localStorage.getItem('access_token');
    if (!isAuthenticated) {
      setModalMessage(`Please login to access ${featureName}`);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleModalLogin = () => {
    setShowAuthModal(false);
    navigate('/login');
  };

  const handleModalSignup = () => {
    setShowAuthModal(false);
    navigate('/signup');
  };

  const closeModal = () => {
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Droplets className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-800">AquaAdvisor</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleFarmSearch}
              className="text-gray-700 hover:text-primary font-semibold transition duration-300"
            >
              Farm Search
            </button>
            <Link
              to="/login"
              className="text-gray-700 hover:text-primary font-semibold transition duration-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-primary hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block bg-green-100 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-bounce">
            🌾 AI-Powered Precision Agriculture
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Transform Your Farm with
            <span className="text-primary"> Smart Irrigation</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Harness satellite imagery and machine learning to optimize water usage, 
            increase crop yields, and maximize profits. Get real-time field analysis, 
            NDVI mapping, and ROI calculations—all without installing a single sensor.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="bg-primary hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Start Free Analysis
            </button>
            <button
              onClick={handleFarmSearch}
              className="bg-white hover:bg-gray-50 text-primary border-2 border-primary font-bold py-4 px-8 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-md flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Search Registered Farms
            </button>
          </div>
          
          {/* Enhanced Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div 
              onClick={() => handleFeatureAccess('water savings insights')}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-green-500 cursor-pointer"
            >
              <Droplets className="w-10 h-10 text-primary mx-auto mb-3" />
              <div className="text-4xl font-bold text-primary mb-2">25-35%</div>
              <div className="text-gray-600 font-semibold">Water Savings</div>
              <p className="text-sm text-gray-500 mt-2">Reduce water usage significantly</p>
            </div>
            <div 
              onClick={() => handleFeatureAccess('spatial resolution details')}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-blue-500 cursor-pointer"
            >
              <Globe className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <div className="text-4xl font-bold text-blue-600 mb-2">10m</div>
              <div className="text-gray-600 font-semibold">Spatial Resolution</div>
              <p className="text-sm text-gray-500 mt-2">Precision field analysis</p>
            </div>
            <div 
              onClick={() => handleFeatureAccess('yield increase insights')}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-yellow-500 cursor-pointer"
            >
              <TrendingUp className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
              <div className="text-4xl font-bold text-yellow-600 mb-2">+15%</div>
              <div className="text-gray-600 font-semibold">Yield Increase</div>
              <p className="text-sm text-gray-500 mt-2">Optimize crop productivity</p>
            </div>
            <div 
              onClick={() => handleFeatureAccess('satellite data access')}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-purple-500 cursor-pointer"
            >
              <Shield className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <div className="text-4xl font-bold text-purple-600 mb-2">FREE</div>
              <div className="text-gray-600 font-semibold">Satellite Data</div>
              <p className="text-sm text-gray-500 mt-2">No hardware costs</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get professional-grade field analysis in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {/* Connecting Lines */}
            <div className="hidden md:block absolute top-1/3 left-1/4 right-1/4 h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
            
            <div 
              onClick={() => handleFeatureAccess('field selection')}
              className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 relative z-10 cursor-pointer"
            >
              <div className="bg-gradient-to-br from-primary to-green-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Leaf className="h-10 w-10 text-white" />
              </div>
              <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">1</div>
              <h3 className="text-2xl font-bold mb-4 text-center">Select Your Field</h3>
              <p className="text-gray-600 text-center">
                Draw your field boundaries on our interactive map or search by registration number. Works for any size farm.
              </p>
            </div>
            
            <div 
              onClick={() => handleFeatureAccess('AI analysis')}
              className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 relative z-10 cursor-pointer"
            >
              <div className="bg-gradient-to-br from-secondary to-blue-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <div className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">2</div>
              <h3 className="text-2xl font-bold mb-4 text-center">AI Analysis</h3>
              <p className="text-gray-600 text-center">
                Our ML models analyze Sentinel-2 satellite imagery to detect water stress, calculate NDVI, and identify problem zones.
              </p>
            </div>
            
            <div 
              onClick={() => handleFeatureAccess('insights and reports')}
              className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 relative z-10 cursor-pointer"
            >
              <div className="bg-gradient-to-br from-accent to-purple-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <div className="bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">3</div>
              <h3 className="text-2xl font-bold mb-4 text-center">Get Insights</h3>
              <p className="text-gray-600 text-center">
                Receive detailed irrigation recommendations, ROI calculations, 7-day ML stress forecasts, and downloadable reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose AquaAdvisor?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology meets practical farming solutions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div 
              onClick={() => handleFeatureAccess('hardware-free solution')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border-l-4 border-green-500 cursor-pointer"
            >
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-3">No Hardware Required</h3>
              <p className="text-gray-600">
                Skip expensive sensors. Get insights using free satellite data updated every 5 days.
              </p>
            </div>
            <div 
              onClick={() => handleFeatureAccess('water savings details')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border-l-4 border-blue-500 cursor-pointer"
            >
              <Droplets className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Save Water & Money</h3>
              <p className="text-gray-600">
                Reduce water consumption by 25-35% while maintaining or improving yields. See real ROI in weeks.
              </p>
            </div>
            <div 
              onClick={() => handleFeatureAccess('data-driven decisions')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border-l-4 border-purple-500 cursor-pointer"
            >
              <BarChart3 className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Data-Driven Decisions</h3>
              <p className="text-gray-600">
                Get NDVI maps, stress forecasts, zone-wise recommendations, and financial analysis reports.
              </p>
            </div>
            <div 
              onClick={() => handleFeatureAccess('yield improvement')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border-l-4 border-yellow-500 cursor-pointer"
            >
              <TrendingUp className="w-12 h-12 text-yellow-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Improve Crop Yields</h3>
              <p className="text-gray-600">
                Optimize plant health with precision irrigation. Track improvements over time with ML predictions.
              </p>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-primary to-green-700 rounded-2xl p-12 text-center text-white shadow-2xl">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Farm?</h3>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of farmers using AI to save water, increase yields, and maximize profits.
            </p>
            <button
              onClick={handleGetStarted}
              className="bg-white text-primary hover:bg-gray-100 font-bold py-4 px-10 rounded-lg text-lg transition duration-300 transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Get Started Free - No Credit Card Required
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <Droplets className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">AquaAdvisor</span>
              </div>
              <p className="mt-2 text-gray-400">
                AI-powered water efficiency for agriculture
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">
                © {new Date().getFullYear()} AquaAdvisor. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Powered by Sentinel-2 satellite data and OpenWeatherMap
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-slideUp" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-green-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-white bg-opacity-20 p-4 rounded-full">
                  <Lock className="w-12 h-12" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center">Login Required</h2>
              <p className="text-center text-sm opacity-90 mt-2">{modalMessage}</p>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700 font-medium">Access Restricted</p>
                  <p className="text-xs text-gray-600 mt-1">
                    This feature is only available to registered users. Create a free account or sign in to continue.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleModalLogin}
                  className="w-full bg-primary hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In to Continue
                </button>
                
                <button
                  onClick={handleModalSignup}
                  className="w-full bg-white hover:bg-gray-50 text-primary border-2 border-primary font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-md transform hover:scale-105"
                >
                  <UserPlus className="w-5 h-5" />
                  Create Free Account
                </button>
                
                <button
                  onClick={closeModal}
                  className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;