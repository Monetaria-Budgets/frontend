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

  // Получаем уникальные категории из операций
  const getUniqueCategories = () => {
    const categories = operations.map(op => op.category);
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
    <View style={[styles.filterContainer, { backgroundColor: colors.tint }]}>
      {/* Первая строка - фильтр по типу операции */}
      <View style={styles.filterRow}>
        <Pressable
          style={[
            styles.typeFilterButton,
            isTypeActive(null) ? styles.filterButtonActive : styles.filterButtonInactive
          ]}
          onPress={() => handleTypeFilter(null)}
        >
          <Text style={[
            styles.filterButtonText,
            isTypeActive(null) ? styles.filterButtonTextActive : styles.filterButtonTextInactive
          ]}>
            Все
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.typeFilterButton,
            isTypeActive('income') ? styles.filterButtonActive : styles.filterButtonInactive
          ]}
          onPress={() => handleTypeFilter('income')}
        >
          <Text style={[
            styles.filterButtonText,
            isTypeActive('income') ? styles.filterButtonTextActive : styles.filterButtonTextInactive
          ]}>
            Доходы
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.typeFilterButton,
            isTypeActive('expense') ? styles.filterButtonActive : styles.filterButtonInactive
          ]}
          onPress={() => handleTypeFilter('expense')}
        >
          <Text style={[
            styles.filterButtonText,
            isTypeActive('expense') ? styles.filterButtonTextActive : styles.filterButtonTextInactive
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
            isPeriodActive ? styles.filterButtonActive : styles.filterButtonInactive
          ]}
          onPress={() => setShowPeriodModal(true)}
        >
          <Text style={[
            styles.filterButtonText,
            isPeriodActive ? styles.filterButtonTextActive : styles.filterButtonTextInactive
          ]}>
            {getPeriodLabel(currentFilters.period)}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            style={isPeriodActive ? styles.filterButtonTextActive : styles.filterButtonTextInactive}
          />
        </Pressable>

        <Pressable
          style={[
            styles.dropdownFilterButton,
            isCategoryActive ? styles.filterButtonActive : styles.filterButtonInactive
          ]}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text style={[
            styles.filterButtonText,
            isCategoryActive ? styles.filterButtonTextActive : styles.filterButtonTextInactive
          ]}>
            {getCategoryLabel(currentFilters.category)}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            style={isCategoryActive ? styles.filterButtonTextActive : styles.filterButtonTextInactive}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  typeFilterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  dropdownFilterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  filterButtonInactive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  filterButtonActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextInactive: {
    color: 'white',
  },
  filterButtonTextActive: {
    color: '#007AFF', // tint color
  },
});