import { useState, useEffect, useCallback } from 'react';
import { premiumService, PremiumStatus } from '@/services/premiumService';

export const usePremium = () => {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPremiumStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await premiumService.checkPremiumStatus();
      setPremiumStatus(status);
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Ошибка загрузки премиум статуса:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const activatePremium = useCallback(async () => {
    try {
      setActivating(true);
      setError(null);
      const result = await premiumService.activatePremium();
      // Перезагружаем статус после активации
      await loadPremiumStatus();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setActivating(false);
    }
  }, [loadPremiumStatus]);

  useEffect(() => {
    loadPremiumStatus();
  }, [loadPremiumStatus]);

  return {
    premiumStatus,
    loading,
    activating,
    error,
    loadPremiumStatus,
    activatePremium,
  };
};