// app/(tabs)/history/components/FilterSection.tsx
import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { FilterModal } from './FilterModals';

interface FilterSectionProps {
  onFilterChange: (filters: any) => void;
  currentFilters: any;
  operations: any[];
}

export const FilterSection = ({ onFilterChange, currentFilters, operations }: FilterSectionProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // 🔥 ФИКС: Получаем уникальные категории ТОЛЬКО из операций расходов
  const getUniqueCategories = () => {
    // Фильтруем только расходы
    const expenseOperations = operations.filter(op => op.operation === 'expense');
    const categories = expenseOperations.map(op => op.category);
    const uniqueCategories = Array.from(new Set(categories));
    
    return [
      { key: 'all', label: 'Все категории' },
      ...uniqueCategories.map(cat => ({ key: cat, label: cat }))
    ];
  };

  const categoryItems = getUniqueCategories();
  
  const periodItems = [
    { key: 'all', label: 'Все время' },
    { key: 'week', label: 'Неделя' },
    { key: 'month', label: 'Месяц' },
    { key: 'year', label: 'Год' }
  ];

  const handleTypeFilter = (type: 'income' | 'expense' | null) => {
    const newFilters = { ...currentFilters, type };
    onFilterChange(newFilters);
  };

  const handlePeriodSelect = (periodKey: string) => {
    const newFilters = { ...currentFilters, period: periodKey };
    onFilterChange(newFilters);
  };

  const handleCategorySelect = (categoryKey: string) => {
    const newFilters = { ...currentFilters, category: categoryKey };
    onFilterChange(newFilters);
  };

  const getPeriodLabel = (periodKey: string) => {
    const period = periodItems.find(p => p.key === periodKey);
    return period ? period.label : 'Все время';
  };

  const getCategoryLabel = (categoryKey: string) => {
    const category = categoryItems.find(c => c.key === categoryKey);
    return category ? category.label : 'Все категории';
  };

  // Функции для проверки активного состояния
  const isPeriodActive = currentFilters.period !== 'all';
  const isCategoryActive = currentFilters.category !== 'all';
  
  const isTypeActive = (type: 'income' | 'expense' | null) => {
    return currentFilters.type === type;
  };

  return (
    <View style={[styles.filterContainer, { backgroundColor: colors.card }]}>
      {/* Первая строка - фильтр по типу операции */}
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.typeFilterButton,
            isTypeActive(null) ? [styles.filterButtonActive, { backgroundColor: colors.tint }] : styles.filterButtonInactive
          ]}
          onPress={() => handleTypeFilter(null)}
        >
          <Text style={[
            styles.filterButtonText,
            isTypeActive(null) ? styles.filterButtonTextActive : { color: colors.text }
          ]}>
            Все
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.typeFilterButton,
            isTypeActive('income') ? [styles.filterButtonActive, { backgroundColor: '#4CAF50' }] : styles.filterButtonInactive
          ]}
          onPress={() => handleTypeFilter('income')}
        >
          <Ionicons 
            name="arrow-down" 
            size={16} 
            color={isTypeActive('income') ? '#fff' : '#4CAF50'} 
          />
          <Text style={[
            styles.filterButtonText,
            isTypeActive('income') ? styles.filterButtonTextActive : { color: '#4CAF50' }
          ]}>
            Доходы
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.typeFilterButton,
            isTypeActive('expense') ? [styles.filterButtonActive, { backgroundColor: '#F44336' }] : styles.filterButtonInactive
          ]}
          onPress={() => handleTypeFilter('expense')}
        >
          <Ionicons 
            name="arrow-up" 
            size={16} 
            color={isTypeActive('expense') ? '#fff' : '#F44336'} 
          />
          <Text style={[
            styles.filterButtonText,
            isTypeActive('expense') ? styles.filterButtonTextActive : { color: '#F44336' }
          ]}>
            Расходы
          </Text>
        </Pressable>
      </View>

      {/* Вторая строка - фильтр по периоду и категориям */}
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.dropdownFilterButton,
            isPeriodActive ? [styles.filterButtonActive, { backgroundColor: colors.tint }] : [styles.filterButtonInactive, { borderColor: colors.border }]
          ]}
          onPress={() => setShowPeriodModal(true)}
        >
          <Text style={[
            styles.filterButtonText,
            isPeriodActive ? styles.filterButtonTextActive : { color: colors.text }
          ]}>
            {getPeriodLabel(currentFilters.period)}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={isPeriodActive ? '#fff' : colors.icon}
          />
        </Pressable>

        <Pressable
          style={[
            styles.dropdownFilterButton,
            isCategoryActive ? [styles.filterButtonActive, { backgroundColor: colors.tint }] : [styles.filterButtonInactive, { borderColor: colors.border }]
          ]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[
            styles.filterButtonText,
            isCategoryActive ? styles.filterButtonTextActive : { color: colors.text }
          ]}>
            {getCategoryLabel(currentFilters.category)}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color={isCategoryActive ? '#fff' : colors.icon}
          />
        </Pressable>
      </View>

      {/* Модалка выбора периода */}
      <FilterModal
        visible={showPeriodModal}
        onClose={() => setShowPeriodModal(false)}
        onSelect={handlePeriodSelect}
        title="Выберите период"
        items={periodItems}
        selectedKey={currentFilters.period}
      />

      {/* Модалка выбора категории */}
      <FilterModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={handleCategorySelect}
        title="Выберите категорию"
        items={categoryItems}
        selectedKey={currentFilters.category}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dropdownFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterButtonInactive: {
    backgroundColor: 'transparent',
  },
  filterButtonActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
});