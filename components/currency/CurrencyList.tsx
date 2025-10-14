// app/(tabs)/currency/components/CurrencyList.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CurrencyRate } from '@/services/currencyService';
import { CurrencyItem } from './CurrencyItem';

interface CurrencyListProps {
  rates: CurrencyRate[];
  onCurrencyPress?: (currency: CurrencyRate) => void;
}

export const CurrencyList = ({ rates, onCurrencyPress }: CurrencyListProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (rates.length === 0) {
    return (
      <View style={styles.emptyState}>
        <View style={[styles.emptyIcon, { backgroundColor: colors.icon + '20' }]}>
          <Text style={[styles.emptyIconText, { color: colors.icon }]}>💱</Text>
        </View>
        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
          Валюты не найдены
        </Text>
        <Text style={[styles.emptyStateText, { color: colors.text }]}>
          Попробуйте изменить параметры поиска
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={rates}
        renderItem={({ item, index }) => (
          <CurrencyItem 
            rate={item} 
            isFirst={index === 0}
            isLast={index === rates.length - 1}
            onPress={onCurrencyPress}
          />
        )}
        keyExtractor={item => item.code}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 8,
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