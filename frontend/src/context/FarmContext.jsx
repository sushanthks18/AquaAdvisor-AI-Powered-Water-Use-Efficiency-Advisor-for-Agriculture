import React, { createContext, useState, useContext } from 'react';
import { farmService } from '../services/farmService';

const FarmContext = createContext(null);

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};

export const FarmProvider = ({ children }) => {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const data = await farmService.getMyFarms();
      setFarms(data);
      return data;
    } catch (error) {
      console.error('Error fetching farms:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const selectFarm = (farm) => {
    setSelectedFarm(farm);
  };

  const value = {
    farms,
    selectedFarm,
    loading,
    fetchFarms,
    selectFarm,
    setFarms
  };

  return <FarmContext.Provider value={value}>{children}</FarmContext.Provider>;
};

export default FarmContext;