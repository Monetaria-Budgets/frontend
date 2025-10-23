// app/(tabs)/statistics.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator, 
  Text,
  Pressable
} from 'react-native';
import { ThemedGradientView } from '@/components/themed-gradient-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

// Компоненты статистики
import StatisticsHeader from '@/components/statistics/StatisticsHeader';
import PeriodSelector from '@/components/statistics/PeriodSelector';
import BalanceChart from '@/components/statistics/BalanceChart';
import IncomeExpenseComparison from '@/components/statistics/IncomeExpenseComparison';
import FinancialMetrics from '@/components/statistics/FinancialMetrics';
import CategoriesBreakdown from '@/components/statistics/CategoriesBreakdown';
import LimitsStatisticsComponent from '@/components/statistics/LimitsStatistics';
import ErrorState from '@/components/statistics/ErrorState';

// Хук для статистики
import { useStatistics, PeriodType, CustomPeriod } from '@/hooks/useStatistics';
import { eventBus } from '@/utils/eventBus';

export default function StatisticsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  
  const { 
    statistics, 
    loading, 
    refreshing, 
    error, 
    refreshStatistics, 
    changePeriod,
    clearError,
    hasData 
  } = useStatistics(selectedPeriod);

  const isFirstLoadRef = useRef(true);
  const lastFocusTimeRef = useRef<number>(0);

  const onRefresh = useCallback(() => {
    refreshStatistics();
  }, [refreshStatistics]);

  const handlePeriodChange = useCallback((period: PeriodType, customPeriod?: CustomPeriod) => {
    setSelectedPeriod(period);
    changePeriod(period, customPeriod);
  }, [changePeriod]);

  const handleRetry = useCallback(() => {
    refreshStatistics();
  }, [refreshStatistics]);

  const handleClearError = useCallback(() => {
    clearError();
  }, [clearError]);

  // 🔥 ИСПРАВЛЕННЫЙ useFocusEffect - обновляет только при реальном фокусе
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      const timeSinceLastFocus = now - lastFocusTimeRef.current;
      
      // Обновляем только если прошло больше 5 секунд с последнего фокуса
      if (timeSinceLastFocus > 5000) {
        console.log('🎯 Экран статистики в фокусе, обновляем данные...');
        refreshStatistics();
      }
      
      lastFocusTimeRef.current = now;
    }, [refreshStatistics])
  );

  // 🔥 Подписка на события добавления операций
  useEffect(() => {
    const handleOperationAdded = () => {
      console.log('🔄 Обновляем статистику из-за новой операции');
      // Небольшая задержка чтобы сервер успел обработать операцию
      setTimeout(() => {
        refreshStatistics();
      }, 500);
    };

    eventBus.on('operationAdded', handleOperationAdded);

    return () => {
      eventBus.off('operationAdded', handleOperationAdded);
    };
  }, [refreshStatistics]);

  if (error && !statistics) {
    return (
      <ThemedGradientView style={styles.container}>
        <ErrorState 
          error={error}
          onRetry={handleRetry}
          onClearError={handleClearError}
        />
      </ThemedGradientView>
    );
  }

  if (loading && !statistics && !refreshing) {
    return (
      <ThemedGradientView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Загрузка статистики...
          </Text>
        </View>
      </ThemedGradientView>
    );
  }

  // 🔥 ПРОВЕРКА НА НАЛИЧИЕ ДАННЫХ
  const hasTransactions = statistics && statistics.allTransactions && statistics.allTransactions.length > 0;
  const hasLimits = statistics?.limitsStats && statistics.limitsStats.totalLimits > 0;

  return (
    <ThemedGradientView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
      >
        <View style={styles.content}>
          <StatisticsHeader 
            statistics={statistics}
            isLoading={loading && !refreshing}
          />

          <PeriodSelector 
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />

          {/* 🔥 ЕСЛИ НЕТ ДАННЫХ - ПОКАЗЫВАЕМ ПЛАШКУ */}
          {!hasTransactions ? (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.icon + '20' }]}>
                <Text style={[styles.emptyIconText, { color: colors.icon }]}>📊</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                Нет операций
              </Text>
              <Text style={[styles.emptyText, { color: colors.icon }]}>
                Добавьте операции, чтобы увидеть статистику
              </Text>
              <Pressable
                style={[styles.addButton, { backgroundColor: colors.tint }]}
                onPress={() => router.push('/(modals)/add-modal')}
              >
                <Text style={styles.addButtonText}>Добавить операцию</Text>
              </Pressable>
            </View>
          ) : (
            /* 🔥 ЕСЛИ ЕСТЬ ДАННЫЕ - ПОКАЗЫВАЕМ СТАТИСТИКУ */
            <>
              <BalanceChart 
                data={statistics?.dynamics || []}
                period={selectedPeriod}
                isLoading={loading}
              />

              <IncomeExpenseComparison 
                income={statistics?.summary.income || 0}
                expense={statistics?.summary.expense || 0}
                period={selectedPeriod}
              />

              <FinancialMetrics statistics={statistics} />

              <CategoriesBreakdown 
                categories={statistics?.categories || []}
                period={selectedPeriod}
              />

              {/* 🔥 ДОБАВЛЯЕМ СТАТИСТИКУ ПО ЛИМИТАМ */}
              {hasLimits && (
                <LimitsStatisticsComponent limitsStats={statistics!.limitsStats} />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </ThemedGradientView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  // 🔥 СТИЛИ ДЛЯ ПУСТОГО СОСТОЯНИЯ
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.6,
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});