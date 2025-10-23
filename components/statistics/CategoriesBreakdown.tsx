// components/statistics/CategoriesBreakdown.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CategoryStat } from '@/services/statisticsService';

interface CategoriesBreakdownProps {
  categories: CategoryStat[];
  period: string;
}

const CategoriesBreakdown: React.FC<CategoriesBreakdownProps> = ({ 
  categories, 
  period 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  const incomeCategories = categories.filter(cat => cat.type === 'income');
  const expenseCategories = categories.filter(cat => cat.type === 'expense');

  const renderCategoryList = (categoryList: CategoryStat[], title: string) => {
    if (categoryList.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
        <View style={[styles.categoriesList, { borderRadius: 12, overflow: 'hidden' }]}>
          {categoryList.map((category, index) => {
            const isFirst = index === 0;
            const isLast = index === categoryList.length - 1;
            
            return (
              <View 
                key={category.name} 
                style={[
                  styles.categoryItem,
                  { 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  isFirst && styles.firstCategoryItem,
                  isLast && styles.lastCategoryItem,
                ]}
              >
                <View style={styles.categoryContent}>
                  <View style={styles.categoryLeft}>
                    <View 
                      style={[
                        styles.colorDot, 
                        { backgroundColor: category.color } // 🔥 ЦВЕТ ИЗ БЭКА
                      ]} 
                    />
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {category.name}
                    </Text>
                  </View>
                  
                  <View style={styles.categoryRight}>
                    <Text style={[styles.categoryAmount, { color: colors.text }]}>
                      {formatAmount(category.amount)}
                    </Text>
                    <View style={[
                      styles.percentageBadge,
                      { backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6' }
                    ]}>
                      <Text style={[
                        styles.percentageText, 
                        { color: colors.icon }
                      ]}>
                        {category.percentage}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  if (categories.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          По категориям
        </Text>
      </View>

      <View style={styles.content}>
        {renderCategoryList(incomeCategories, 'Доходы')}
        {renderCategoryList(expenseCategories, 'Расходы')}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    paddingHorizontal: 0,
  },
  categorySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 20,
    opacity: 0.8,
  },
  categoriesList: {
    marginHorizontal: 0,
  },
  categoryItem: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    marginHorizontal: 0,
  },
  firstCategoryItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastCategoryItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 1,
  },
  categoryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 45,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default CategoriesBreakdown;