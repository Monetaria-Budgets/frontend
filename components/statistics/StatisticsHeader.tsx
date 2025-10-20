// components/statistics/StatisticsHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { ExtendedStatisticsData } from '@/services/statisticsService';

interface StatisticsHeaderProps {
  statistics: ExtendedStatisticsData | null;
  isLoading?: boolean;
}

const StatisticsHeader: React.FC<StatisticsHeaderProps> = ({ 
  statistics, 
  isLoading = false 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { width: screenWidth } = useWindowDimensions();

  const formatAmount = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;

  const getPeriodLabel = () => {
    if (!statistics) return 'Загрузка...';
    if (statistics.period === 'custom' && statistics.periodLabel) {
      const [start, end] = statistics.periodLabel.split(' - ');
      const startDate = new Date(start).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      const endDate = new Date(end).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      return `${startDate} - ${endDate}`;
    }
    const today = new Date();
    switch (statistics.period) {
      case 'week': return 'Эта неделя';
      case 'month': return today.toLocaleDateString('ru-RU', { month: 'long' });
      case 'quarter': return `${Math.floor((today.getMonth() + 3) / 3)} квартал`;
      case 'year': return today.getFullYear().toString();
      default: return 'Период';
    }
  };

  const balance = statistics?.summary.netFlow || 0;
  const income = statistics?.summary.income || 0;
  const expense = statistics?.summary.expense || 0;

  const isSmallScreen = screenWidth < 375;
  const balanceFontSize = isSmallScreen ? 26 : 30;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.period, { color: colors.icon }]}>{getPeriodLabel()}</Text>
      <Text style={[styles.balance, { color: colors.text, fontSize: balanceFontSize }]}>
        {formatAmount(balance)}
      </Text>
      <Text style={[styles.balanceLabel, { color: colors.icon }]}>Чистый поток</Text>

      <View style={[styles.statsRow, { borderColor: colors.border }]}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#34C759' }]}>+{formatAmount(income)}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Доходы</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#FF3B30' }]}>–{formatAmount(expense)}</Text>
          <Text style={[styles.statLabel, { color: colors.icon }]}>Расходы</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  period: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  balance: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 12,
    width: '100%',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
});

export default StatisticsHeader;
