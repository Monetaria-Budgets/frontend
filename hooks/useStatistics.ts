// hooks/useStatistics.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import { statisticsService, ExtendedStatisticsData } from '@/services/statisticsService';

export type PeriodType = 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface CustomPeriod {
  startDate: string;
  endDate: string;
}

interface UseStatisticsReturn {
  statistics: ExtendedStatisticsData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  period: PeriodType;
  customPeriod: CustomPeriod | undefined;
  loadStatistics: (targetPeriod?: PeriodType, targetCustomPeriod?: CustomPeriod, forceRefresh?: boolean) => Promise<void>;
  refreshStatistics: () => void;
  changePeriod: (newPeriod: PeriodType, newCustomPeriod?: CustomPeriod) => void;
  clearError: () => void;
  hasData: boolean;
  financialHealth: {
    rating: string;
    score: number;
    color: string;
    icon: string;
    description: string;
  };
  recommendations: string[];
}

export const useStatistics = (initialPeriod: PeriodType = 'month', initialCustomPeriod?: CustomPeriod): UseStatisticsReturn => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statistics, setStatistics] = useState<ExtendedStatisticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<PeriodType>(initialPeriod);
  const [customPeriod, setCustomPeriod] = useState<CustomPeriod | undefined>(initialCustomPeriod);
  
  // Используем ref для отслеживания текущего запроса и времени последнего обновления
  const isMountedRef = useRef(true);
  const lastRequestRef = useRef<{ period: PeriodType; customPeriod?: CustomPeriod } | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const isInitialLoadRef = useRef(true);

  const loadStatistics = useCallback(async (targetPeriod?: PeriodType, targetCustomPeriod?: CustomPeriod, forceRefresh: boolean = false) => {
    try {
      const currentPeriod = targetPeriod || period;
      const currentCustomPeriod = targetCustomPeriod || customPeriod;
      
      // Проверяем, не загружаем ли мы уже те же данные (если не форсированное обновление)
      const requestKey = JSON.stringify({ period: currentPeriod, customPeriod: currentCustomPeriod });
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
      
      // Если данные не устарели (менее 10 секунд) и не форсированное обновление - пропускаем
      if (!forceRefresh && lastRequestRef.current && 
          JSON.stringify(lastRequestRef.current) === requestKey && 
          statistics && timeSinceLastUpdate < 10000) {
        console.log('🔄 Пропускаем запрос - данные актуальны');
        return;
      }

      lastRequestRef.current = { period: currentPeriod, customPeriod: currentCustomPeriod };
      lastUpdateTimeRef.current = now;
      
      setLoading(true);
      setError(null);
      
      console.log(`📊 Загрузка статистики для периода: ${currentPeriod}`, currentCustomPeriod, forceRefresh ? '(форсированно)' : '');
      
      let data: ExtendedStatisticsData;
      
      if (currentPeriod === 'custom' && currentCustomPeriod) {
        data = await statisticsService.getCustomPeriodStatistics(
          currentCustomPeriod.startDate, 
          currentCustomPeriod.endDate
        );
      } else {
        data = await statisticsService.getExtendedStatistics(currentPeriod);
      }
      
      if (isMountedRef.current) {
        setStatistics(data);
        console.log('✅ Статистика успешно загружена', {
          financialHealth: data.financialHealthRating,
          stability: data.financialStability,
          recommendations: data.recommendations?.length,
          limits: data.limitsStats?.totalLimits || 0
        });
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.error('❌ Ошибка загрузки статистики:', err);
        setError(err.message || 'Ошибка загрузки статистики');
        // Создаем пустую статистику вместо null чтобы избежать ошибок
        setStatistics(statisticsService.createEmptyStatistics(period));
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
        isInitialLoadRef.current = false;
      }
    }
  }, [period, customPeriod, statistics]);

  // Загружаем данные при монтировании
  useEffect(() => {
    isMountedRef.current = true;
    
    // Загружаем данные только при первом монтировании
    if (isInitialLoadRef.current) {
      loadStatistics();
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refreshStatistics = useCallback(() => {
    console.log('🔄 Принудительное обновление статистики');
    setRefreshing(true);
    loadStatistics(period, customPeriod, true); // forceRefresh = true
  }, [loadStatistics, period, customPeriod]);

  const changePeriod = useCallback((newPeriod: PeriodType, newCustomPeriod?: CustomPeriod) => {
    console.log(`🔄 Смена периода на: ${newPeriod}`, newCustomPeriod);
    setPeriod(newPeriod);
    if (newCustomPeriod) {
      setCustomPeriod(newCustomPeriod);
    }
    // Сбрасываем lastRequest чтобы загрузить новые данные
    lastRequestRef.current = null;
    loadStatistics(newPeriod, newCustomPeriod, true);
  }, [loadStatistics]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Вычисляемые значения для финансового здоровья
  const financialHealth = {
    rating: statistics?.financialHealthRating || 'fair',
    score: statistics?.financialHealthScore || 3,
    color: statisticsService.getHealthRatingColor(statistics?.financialHealthRating || 'fair'),
    icon: statisticsService.getHealthRatingIcon(statistics?.financialHealthRating || 'fair'),
    description: statisticsService.getHealthRatingDescription(statistics?.financialHealthRating || 'fair')
  };

  const recommendations = statistics?.recommendations || [];

  return {
    // Данные
    statistics,
    loading,
    refreshing,
    error,
    period,
    customPeriod,
    
    // Методы
    loadStatistics,
    refreshStatistics,
    changePeriod,
    clearError,
    
    // Утилиты
    hasData: statistics ? statisticsService.hasData(statistics) : false,
    financialHealth,
    recommendations
  };
};