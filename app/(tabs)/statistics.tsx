import React, { useState, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator, 
  Text 
} from 'react-native';
import { ThemedGradientView } from '@/components/themed-gradient-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useFocusEffect } from '@react-navigation/native';

// Компоненты статистики
import StatisticsHeader from '@/components/statistics/StatisticsHeader';
import PeriodSelector from '@/components/statistics/PeriodSelector';
import BalanceChart from '@/components/statistics/BalanceChart';
import IncomeExpenseComparison from '@/components/statistics/IncomeExpenseComparison';
import FinancialMetrics from '@/components/statistics/FinancialMetrics';
import CategoriesBreakdown from '@/components/statistics/CategoriesBreakdown';
import RecentTransactions from '@/components/statistics/RecentTransactions';
import ErrorState from '@/components/statistics/ErrorState';

// Хук для статистики
import { useStatistics, PeriodType, CustomPeriod } from '@/hooks/useStatistics';

export default function StatisticsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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

  useFocusEffect(
    useCallback(() => {
      if (isFirstLoadRef.current) {
        isFirstLoadRef.current = false;
        return;
      }
      if (error) {
        refreshStatistics();
      }
    }, [error, refreshStatistics])
  );

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

          <RecentTransactions 
            transactions={statistics?.recentTransactions || []}
          />
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
});
