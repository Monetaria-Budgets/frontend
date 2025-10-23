// hooks/useSpendingLimits.ts
import { useState, useCallback, useEffect } from 'react';
import { 
  limitService, 
  SpendingLimit, 
  CreateLimitData, 
  UpdateLimitData, 
  LimitInfo,
  CategoryWithLimit 
} from '@/services/limitService';
import { premiumService, PremiumStatus } from '@/services/premiumService';

export const useSpendingLimits = () => {
  const [limits, setLimits] = useState<SpendingLimit[]>([]);
  const [categoriesWithLimits, setCategoriesWithLimits] = useState<CategoryWithLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limitInfo, setLimitInfo] = useState<LimitInfo>({ current: 0, limit: 3, isPremium: false });
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({ isPremium: false });

  const loadLimits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [limitsData, categoriesData, limitInfoData, premiumData] = await Promise.all([
        limitService.getLimits(),
        limitService.getCategoriesWithLimits(),
        limitService.checkLimitLimit(),
        premiumService.checkPremiumStatus()
      ]);
      
      setLimits(limitsData);
      setCategoriesWithLimits(categoriesData);
      setLimitInfo(limitInfoData);
      setPremiumStatus(premiumData);
      
    } catch (err: any) {
      console.log('⚠️ Ошибка загрузки лимитов:', err.message);
      setError(err.message);
      setLimits([]);
      setCategoriesWithLimits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createLimit = useCallback(async (limitData: CreateLimitData): Promise<SpendingLimit> => {
    try {
      const newLimit = await limitService.createLimit(limitData);
      
      // Обновляем локальное состояние
      setLimits(prev => [...prev, newLimit]);
      setLimitInfo(prev => ({ ...prev, current: prev.current + 1 }));
      
      // Перезагружаем данные для обновления категорий
      await loadLimits();
      
      return newLimit;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [loadLimits]);

  const updateLimit = useCallback(async (limitId: number, updateData: UpdateLimitData): Promise<SpendingLimit> => {
    try {
      const updatedLimit = await limitService.updateLimit(limitId, updateData);
      
      // Обновляем локальное состояние
      setLimits(prev => prev.map(limit => 
        limit.id === limitId ? updatedLimit : limit
      ));
      
      // Перезагружаем данные для обновления категорий
      await loadLimits();
      
      return updatedLimit;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [loadLimits]);

  const deleteLimit = useCallback(async (limitId: number): Promise<void> => {
    try {
      await limitService.deleteLimit(limitId);
      
      // Обновляем локальное состояние
      setLimits(prev => prev.filter(limit => limit.id !== limitId));
      setLimitInfo(prev => ({ ...prev, current: Math.max(0, prev.current - 1) }));
      
      // Перезагружаем данные для обновления категорий
      await loadLimits();
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [loadLimits]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Загружаем лимиты при монтировании
  useEffect(() => {
    loadLimits();
  }, [loadLimits]);

  return {
    limits,
    categoriesWithLimits,
    loading,
    error,
    limitInfo,
    premiumStatus,
    actions: {
      createLimit,
      updateLimit,
      deleteLimit,
      refresh: loadLimits,
      clearError
    }
  };
};