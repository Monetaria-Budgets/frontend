// components/statistics/RecentTransactions.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Transaction } from '@/services/statisticsService';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  transactions 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'income' ? '+' : '–';
    return `${sign} ${amount.toLocaleString('ru-RU')} ₽`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    } catch (error) {
      return '--';
    }
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Последние операции
        </Text>
        <Pressable 
          onPress={() => router.push('/(tabs)/history')}
          style={({ pressed }) => [
            styles.moreButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Text style={[styles.moreText, { color: colors.tint }]}>
            Все
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.tint} />
        </Pressable>
      </View>

      <View style={styles.transactionsList}>
        {transactions.slice(0, 5).map((transaction, index) => {
          const isLast = index === transactions.length - 1;
          
          return (
            <View 
              key={transaction.id} 
              style={[
                styles.transactionItem,
                { borderBottomColor: colors.border },
                isLast && styles.lastTransactionItem
              ]}
            >
              <View style={styles.transactionLeft}>
                <View 
                  style={[
                    styles.categoryIcon,
                    { 
                      backgroundColor: transaction.type === 'income' ? '#34C75920' : '#FF3B3020'
                    }
                  ]}
                >
                  <Ionicons 
                    name={transaction.type === 'income' ? 'trending-up' : 'trending-down'} 
                    size={16} 
                    color={transaction.type === 'income' ? '#34C759' : '#FF3B30'} 
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={[styles.categoryText, { color: colors.text }]}>
                    {transaction.category}
                  </Text>
                  {transaction.description ? (
                    <Text style={[styles.descriptionText, { color: colors.icon }]}>
                      {transaction.description}
                    </Text>
                  ) : null}
                </View>
              </View>
              
              <View style={styles.transactionRight}>
                <Text 
                  style={[
                    styles.amountText,
                    { 
                      color: transaction.type === 'income' ? '#34C759' : '#FF3B30'
                    }
                  ]}
                >
                  {formatAmount(transaction.amount, transaction.type)}
                </Text>
                <Text style={[styles.dateText, { color: colors.icon }]}>
                  {formatDate(transaction.created_at)}
                </Text>
              </View>
            </View>
          );
        })}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  moreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    paddingHorizontal: 0,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastTransactionItem: {
    borderBottomWidth: 0,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  descriptionText: {
    fontSize: 13,
    opacity: 0.7,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
});

export default RecentTransactions;