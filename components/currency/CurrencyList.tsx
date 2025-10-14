import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CurrencyRate } from '@/services/currencyService';
import { CurrencyItem } from './CurrencyItem';

interface CurrencyListProps {
  rates: CurrencyRate[];
}

export const CurrencyList = ({ rates }: CurrencyListProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (rates.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyStateText, { color: colors.text }]}>
          Валюты не найдены
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      <FlatList
        data={rates}
        renderItem={({ item }) => <CurrencyItem rate={item} />}
        keyExtractor={item => item.code}
        scrollEnabled={false} // Отключаем скролл, т.к. уже в ScrollView
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
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