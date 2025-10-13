// app/(tabs)/history.tsx
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  Alert 
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

// Функция для нормализации данных с бэка
const normalizeOperations = (operations: any[]): Operation[] => {
  return operations.map(op => ({
    ...op,
    operation: op.operation === 'Доход' ? 'income' : 'expense',
    amount: parseFloat(op.amount) // Преобразуем строку в число
  }));
};

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [operations, setOperations] = useState<Operation[]>([]);
  const [groupedOperations, setGroupedOperations] = useState<GroupedOperations>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    type: null as 'income' | 'expense' | null,
    period: 'all',
    category: 'all'
  });

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
    
    // Убираем сортировку по типу операции, оставляем только по времени (новые сверху)
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
    
    // Фильтр по типу операции
    if (currentFilters.type) {
      filtered = filtered.filter(op => op.operation === currentFilters.type);
    }
    
    // Фильтр по категории
    if (currentFilters.category && currentFilters.category !== 'all') {
      filtered = filtered.filter(op => op.category === currentFilters.category);
    }
    
    // Фильтр по периоду (упрощенная версия)
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
      
      setOperations(normalizedData); // Сохраняем все данные для статистики
      setGroupedOperations(groupOperationsByDate(filteredData)); // Группируем отфильтрованные
    } catch (error: any) {
      console.error('Error loading operations:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось загрузить историю операций');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <ThemedGradientView style={styles.container}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Загрузка операций...
        </Text>
      </ThemedGradientView>
    );
  }

  return (
    <ThemedGradientView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
        }} 
      />
      
      <FilterSection 
        onFilterChange={handleFilterChange} 
        currentFilters={filters}
        operations={operations}
      />
      
      <ScrollView 
        style={styles.operationsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(groupedOperations).length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              Нет операций за выбранный период
            </Text>
          </View>
        ) : (
          Object.keys(groupedOperations)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((date) => (
              <DaySection 
                key={date} 
                date={date} 
                operations={groupedOperations[date]} 
              />
            ))
        )}
      </ScrollView>
    </ThemedGradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  operationsList: {
    flex: 1,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});