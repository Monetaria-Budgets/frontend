    import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CurrencyRate } from '@/services/currencyService';

interface CurrencyItemProps {
  rate: CurrencyRate;
}

export const CurrencyItem = ({ rate }: CurrencyItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getChangeColor = () => {
    if (parseFloat(rate.changePercentage) > 0) return '#34C759'; // green
    if (parseFloat(rate.changePercentage) < 0) return '#FF3B30'; // red
    return colors.text; // gray
  };

  const getChangeSymbol = () => {
    if (parseFloat(rate.changePercentage) > 0) return '+';
    if (parseFloat(rate.changePercentage) < 0) return '';
    return '';
  };

  return (
    <View style={[styles.itemContainer, { backgroundColor: colors.card }]}>
      <View style={styles.currencyInfo}>
        <Text style={[styles.currencyCode, { color: colors.text }]}>
          {rate.code}
        </Text>
        <Text style={[styles.currencyName, { color: colors.text }]}>
          {rate.name}
        </Text>
      </View>
      
      <View style={styles.rateInfo}>
        <Text style={[styles.rateValue, { color: colors.text }]}>
          {rate.rate ? `${rate.rate} ₽` : '—'}
        </Text>
        <Text style={[styles.changePercentage, { color: getChangeColor() }]}>
          {getChangeSymbol()}{rate.changePercentage}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  currencyName: {
    fontSize: 14,
  },
  rateInfo: {
    alignItems: 'flex-end',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changePercentage: {
    fontSize: 14,
    fontWeight: '500',
  },
});