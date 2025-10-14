// app/(tabs)/history.tsx
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  Animated
} from 'react-native';
import { Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedGradientView } from '@/components/themed-gradient-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { operationService, Operation } from '@/services/operationService';
import { FilterSection } from '@/components/history/FilterSection';
import { DaySection } from '@/components/history/DaySection';

interface GroupedOperations {
  [key: string]: Operation[];
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [operations, setOperations] = useState<Operation[]>([]);
  const [groupedOperations, setGroupedOperations] = useState<GroupedOperations>({});
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    type: null as 'income' | 'expense' | null,
    period: 'all',
    category: 'all'
  });
  const scrollY = new Animated.Value(0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });

  // Функция для нормализации данных с бэка
  const normalizeOperations = (operations: any[]): Operation[] => {
    return operations.map(op => ({
      ...op,
      operation: op.operation === 'Доход' ? 'income' : 'expense',
      amount: parseFloat(op.amount),
      created_at: op.created_at
    }));
  };

  // Группировка операций по дням
  const groupOperationsByDate = (ops: Operation[]): GroupedOperations => {
    const grouped: GroupedOperations = {};
    
    ops.forEach(operation => {
      const date = new Date(operation.created_at).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(operation);
    });
    
    // Сортируем операции внутри дня по времени (новые сверху)
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });
    
    return grouped;
  };

  // Функция для применения фильтров
  const applyFilters = (ops: Operation[], currentFilters: any) => {
    let filtered = [...ops];
    
    if (currentFilters.type) {
      filtered = filtered.filter(op => op.operation === currentFilters.type);
    }
    
    if (currentFilters.category && currentFilters.category !== 'all') {
      filtered = filtered.filter(op => op.category === currentFilters.category);
    }
    
    if (currentFilters.period !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (currentFilters.period) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(op => new Date(op.created_at) >= startDate);
    }
    
    return filtered;
  };

  const loadOperations = async (currentFilters = filters) => {
    try {
      const operationsData = await operationService.getUserOperations();
      const normalizedData = normalizeOperations(operationsData);
      const filteredData = applyFilters(normalizedData, currentFilters);
      
      setOperations(normalizedData);
      setGroupedOperations(groupOperationsByDate(filteredData));
    } catch (error: any) {
      console.error('Error loading operations:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOperations();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadOperations();
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    loadOperations(newFilters);
  };

  const sortedDates = Object.keys(groupedOperations).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <ThemedGradientView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'История операций',
          headerTransparent: true,
          headerBlurEffect: colorScheme === 'dark' ? 'dark' : 'light',
        }} 
      />
      
      <Animated.View 
        style={[
          styles.floatingHeader,
          {
            backgroundColor: colorScheme === 'dark' 
              ? `rgba(30, 30, 30, ${headerOpacity})`
              : `rgba(255, 255, 255, ${headerOpacity})`,
            borderBottomColor: colorScheme === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'
          }
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          История операций
        </Text>
      </Animated.View>

      {/* Основной контент с фильтрами и списком */}
      <View style={styles.content}>
        {/* Фильтры - теперь они точно будут видны */}
        <View style={styles.filtersWrapper}>
          <FilterSection 
            onFilterChange={handleFilterChange} 
            currentFilters={filters}
            operations={operations}
          />
        </View>
        
        {/* Список операций */}
        <ScrollView 
          style={styles.operationsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
              colors={[colors.tint]}
            />
          }
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.scrollContent}>
            {refreshing && (
              <View style={styles.refreshIndicator}>
                <ActivityIndicator size="small" color={colors.tint} />
              </View>
            )}
            
            {sortedDates.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.icon + '20' }]}>
                  <Text style={[styles.emptyIconText, { color: colors.icon }]}>💸</Text>
                </View>
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
                  {operations.length === 0 ? 'Пока нет операций' : 'Не найдено операций'}
                </Text>
                <Text style={[styles.emptyStateText, { color: colors.text }]}>
                  {operations.length === 0 
                    ? 'Здесь будет отображаться история ваших доходов и расходов' 
                    : 'Попробуйте изменить параметры фильтрации'
                  }
                </Text>
              </View>
            ) : (
              sortedDates.map((date) => (
                <DaySection 
                  key={date} 
                  date={date} 
                  operations={groupedOperations[date]} 
                />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </ThemedGradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 110, 
  },
  filtersWrapper: {
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  operationsList: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  refreshIndicator: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
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
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 22,
  },
});