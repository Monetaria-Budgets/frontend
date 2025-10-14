import React, { createContext, useContext, useState, useEffect } from 'react';
import { currencyService, CurrencyRate } from '@/services/currencyService';

interface CurrencyContextType {
  rates: CurrencyRate[];
  popularRates: CurrencyRate[];
  loading: boolean;
  refreshing: boolean;
  searchQuery: string;
  activeTab: 'popular' | 'all';
  setSearchQuery: (query: string) => void;
  setActiveTab: (tab: 'popular' | 'all') => void;
  refreshRates: () => Promise<void>;
  filterRates: (rates: CurrencyRate[]) => CurrencyRate[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'popular' | 'all'>('popular');

  const popularRates = rates.filter(rate => rate.isPopular);

  const loadRates = async (showPopular = true) => {
    try {
      setLoading(true);
      const ratesData = await currencyService.getRates(showPopular);
      setRates(ratesData);
    } catch (error) {
      console.error('Error loading currency rates:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshRates = async () => {
    setRefreshing(true);
    await loadRates(activeTab === 'popular');
  };

  const filterRates = (ratesToFilter: CurrencyRate[]) => {
    let filtered = ratesToFilter;
    
    if (searchQuery) {
      filtered = filtered.filter(rate => 
        rate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rate.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (activeTab === 'popular') {
      filtered = filtered.filter(rate => rate.isPopular);
    }
    
    return filtered;
  };

  useEffect(() => {
    loadRates(true);
  }, []);

  useEffect(() => {
    loadRates(activeTab === 'popular');
  }, [activeTab]);

  const value = {
    rates,
    popularRates,
    loading,
    refreshing,
    searchQuery,
    activeTab,
    setSearchQuery,
    setActiveTab,
    refreshRates,
    filterRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};