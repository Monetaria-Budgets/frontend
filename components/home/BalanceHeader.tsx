// components/home/BalanceHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface BalanceHeaderProps {
  period: string;
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  isLoading?: boolean;
}

const BalanceHeader: React.FC<BalanceHeaderProps> = ({ 
  period, 
  totalBalance, 
  currentMonthIncome, 
  currentMonthExpense,
  isLoading = false
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  const formatLoadingAmount = () => {
    return '––– ₽';
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.tint }]}>
      <View style={styles.headerContent}>
        {/* Баланс */}
        {isLoading ? (
          <ActivityIndicator size="small" color="white" style={styles.balanceLoading} />
        ) : (
          <Text style={styles.balance}>{formatAmount(totalBalance)}</Text>
        )}
        
        <Text style={styles.title}>Ваш баланс</Text>
        
        {/* Компактная статистика за месяц */}
        <View style={styles.monthStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Доходы</Text>
            {isLoading ? (
              <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
            ) : (
              <Text style={[styles.statValue, { color: '#34C759' }]}>
                +{formatAmount(currentMonthIncome)}
              </Text>
            )}
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Расходы</Text>
            {isLoading ? (
              <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
            ) : (
              <Text style={[styles.statValue, { color: '#FF3B30' }]}>
                –{formatAmount(currentMonthExpense)}
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 100,
    paddingBottom: 16,
  },
  headerContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  balance: {
    fontSize: 32,
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 2,
  },
  balanceLoading: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
});

export default BalanceHeader;