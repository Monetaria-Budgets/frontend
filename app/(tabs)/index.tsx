// app/(tabs)/index.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
import React, { useState, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator, 
  Text, 
  Pressable,
  Animated 
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedGradientView } from '@/components/themed-gradient-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useFocusEffect } from '@react-navigation/native';

// Компоненты главной страницы
import BalanceHeader from '@/components/home/BalanceHeader';
import CategoriesChart from '@/components/home/CategoriesChart';
import RecentOperations from '@/components/home/RecentOperations';

// Хук для операций
import { useOperations } from '@/hooks/useOperations';
// Хук для категорий из контекста
import { useCategories } from '@/contexts/CategoriesContext'; // 🔥 ИЗМЕНИТЕ ИМПОРТ

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  const { loading, stats, loadOperations } = useOperations();
  const { categories, actions: categoryActions } = useCategories(); // 🔥 ТЕПЕРЬ ИЗ КОНТЕКСТА
  const scrollY = new Animated.Value(0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      loadOperations(),
      categoryActions.refresh()
    ]).finally(() => setRefreshing(false));
  }, [loadOperations, categoryActions]);

  // 🔥 УПРОЩАЕМ: загружаем только при фокусе
  useFocusEffect(
    useCallback(() => {
      loadOperations();
    }, [loadOperations])
  );

  const hasData = stats.allOperations.length > 0;

  // 🔥 ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ЦВЕТА КАТЕГОРИИ
  const getCategoryColor = (categoryName: string): string => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.color || '#666666';
  };

  // 🔥 ФОРМИРУЕМ ДАННЫЕ ДЛЯ ДИАГРАММЫ
  const getExpenseCategoriesData = () => {
    const expenseOperations = stats.currentMonthOperations.filter(op => op.operation === 'expense');
    
    if (expenseOperations.length === 0) {
      // 🔥 ВОЗВРАЩАЕМ ПУСТОЙ МАССИВ ДЛЯ ОТОБРАЖЕНИЯ ПУСТОГО СОСТОЯНИЯ
      return [];
    }

    const categoryMap = expenseOperations.reduce((acc, op) => {
      const existing = acc.find(cat => cat.name === op.category);
      if (existing) {
        existing.amount += op.amount;
      } else {
        acc.push({
          name: op.category,
          amount: op.amount,
          percentage: 0,
          color: getCategoryColor(op.category)
        });
      }
      return acc;
    }, [] as any[]);

    const total = categoryMap.reduce((sum, cat) => sum + cat.amount, 0);
    
    return categoryMap
      .map(cat => ({
        ...cat,
        percentage: Math.round((cat.amount / total) * 100)
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const expenseCategoriesData = getExpenseCategoriesData();

  return (
    <ThemedGradientView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Главная',
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
          Главная
        </Text>
      </Animated.View>
      
      {/* BalanceHeader всегда виден */}
      <View style={styles.balanceHeaderWrapper}>
        <BalanceHeader 
          period={new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })} 
          totalBalance={stats.totalBalance}
          currentMonthIncome={stats.currentMonthIncome}
          currentMonthExpense={stats.currentMonthExpense}
          isLoading={loading}
        />
      </View>
      
      {/* Контент ниже BalanceHeader */}
      {loading ? (
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Загрузка данных...
          </Text>
        </View>
      ) : hasData ? (
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
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <View style={styles.content}>
            {/* 🔥 Круговая диаграмма категорий - ВСЕГДА показываем, даже если нет расходов */}
            <CategoriesChart 
              categories={expenseCategoriesData}
              hasExpenses={expenseCategoriesData.length > 0}
            />
            
            {/* Последние операции */}
            <RecentOperations 
              operations={stats.allOperations
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 10)
              } 
              categories={categories}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.icon + '20' }]}>
            <Text style={[styles.emptyIconText, { color: colors.icon }]}>💸</Text>
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Операций пока нет
          </Text>
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            Добавьте первую операцию, чтобы увидеть статистику
          </Text>
          <Pressable
            style={[styles.addButton, { backgroundColor: colors.tint }]}
            onPress={() => router.push('/(modals)/add-modal')}
          >
            <Text style={styles.addButtonText}>Добавить операцию</Text>
          </Pressable>
        </View>
      )}
    </ThemedGradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceHeaderWrapper: {
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 16,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Отступ чтобы не перекрывать BalanceHeader
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100, // Отступ чтобы не перекрывать BalanceHeader
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
});