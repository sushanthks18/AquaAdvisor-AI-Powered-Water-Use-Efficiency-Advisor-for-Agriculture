import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import LandingPage from './components/LandingPage';
import FieldSelector from './components/FieldSelector';
import AnalysisLoading from './components/AnalysisLoading';
import ResultsDashboard from './components/ResultsDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FarmSearchPage from './pages/FarmSearchPage';
import { AlertCircle, Lock, LogIn, UserPlus } from 'lucide-react';

// Auth Required Modal Component
const AuthRequiredModal = ({ onClose, onLogin, onSignup }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-green-700 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-full">
              <Lock className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center">Authentication Required</h2>
          <p className="text-center text-sm opacity-90 mt-2">Please sign in to access this feature</p>
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
              onClick={onLogin}
              className="w-full bg-primary hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <LogIn className="w-5 h-5" />
              Sign In to Continue
            </button>
            
            <button
              onClick={onSignup}
              className="w-full bg-white hover:bg-gray-50 text-primary border-2 border-primary font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-md transform hover:scale-105"
            >
              <UserPlus className="w-5 h-5" />
              Create Free Account
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component with Modal
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('access_token');

  if (!isAuthenticated) {
    return (
      <AuthRequiredModal
        onClose={() => {
          navigate('/', { replace: true });
        }}
        onLogin={() => {
          navigate('/login', { state: { from: location.pathname }, replace: true });
        }}
        onSignup={() => {
          navigate('/signup', { state: { from: location.pathname }, replace: true });
        }}
      />
    );
  }
  
  return children;
};

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <AuthProvider>
      <FarmProvider>
        <Router 
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              {/* Protected Routes - Require Login */}
              <Route 
                path="/farms" 
                element={
                  <ProtectedRoute>
                    <FarmSearchPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/analyze" 
                element={
                  <ProtectedRoute>
                    {isAnalyzing ? (
                      <AnalysisLoading />
                    ) : analysisData ? (
                      <ResultsDashboard 
                        data={analysisData} 
                        onNewAnalysis={() => setAnalysisData(null)} 
                      />
                    ) : (
                      <FieldSelector 
                        onAnalysisStart={() => setIsAnalyzing(true)} 
                        onAnalysisComplete={(data) => {
                          setAnalysisData(data);
                          setIsAnalyzing(false);
                        }} 
                      />
                    )}
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </FarmProvider>
    </AuthProvider>
  );
}

export default App;