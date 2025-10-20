// components/statistics/IncomeExpenseComparison.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface IncomeExpenseComparisonProps {
  income: number;
  expense: number;
  period: string;
}

const IncomeExpenseComparison: React.FC<IncomeExpenseComparisonProps> = ({ 
  income, 
  expense, 
  period 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const total = income + expense;
  const incomePercentage = total > 0 ? (income / total) * 100 : 0;
  const expensePercentage = total > 0 ? (expense / total) * 100 : 0;

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Доходы vs Расходы
      </Text>
      
      <View style={styles.barContainer}>
        <View style={styles.bar}>
          <View 
            style={[
              styles.incomeBar, 
              { 
                width: `${incomePercentage}%`,
                backgroundColor: '#34C759'
              }
            ]} 
          />
          <View 
            style={[
              styles.expenseBar, 
              { 
                width: `${expensePercentage}%`,
                backgroundColor: '#FF3B30'
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
          <View style={styles.statInfo}>
            <Text style={[styles.statLabel, { color: colors.text }]}>Доходы</Text>
            <Text style={[styles.statAmount, { color: '#34C759' }]}>
              {formatAmount(income)}
            </Text>
            <Text style={[styles.statPercentage, { color: colors.icon }]}>
              {incomePercentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.stat}>
          <View style={[styles.dot, { backgroundColor: '#FF3B30' }]} />
          <View style={styles.statInfo}>
            <Text style={[styles.statLabel, { color: colors.text }]}>Расходы</Text>
            <Text style={[styles.statAmount, { color: '#FF3B30' }]}>
              {formatAmount(expense)}
            </Text>
            <Text style={[styles.statPercentage, { color: colors.icon }]}>
              {expensePercentage.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  barContainer: {
    marginBottom: 20,
  },
  bar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  incomeBar: {
    height: '100%',
  },
  expenseBar: {
    height: '100%',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  statAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statPercentage: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default IncomeExpenseComparison;