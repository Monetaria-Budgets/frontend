// app/(tabs)/currency/components/CurrencyItem.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CurrencyRate } from '@/services/currencyService';

interface CurrencyItemProps {
  rate: CurrencyRate;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: (rate: CurrencyRate) => void;
}

export const CurrencyItem = ({ rate, isFirst = false, isLast = false, onPress }: CurrencyItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getChangeColor = () => {
    if (parseFloat(rate.changePercentage) > 0) return '#34C759';
    if (parseFloat(rate.changePercentage) < 0) return '#FF3B30';
    return colors.icon;
  };

  const getChangeSymbol = () => {
    if (parseFloat(rate.changePercentage) > 0) return '↑';
    if (parseFloat(rate.changePercentage) < 0) return '↓';
    return '→';
  };

  const formatRate = (rateValue: string) => {
    const num = parseFloat(rateValue);
    if (num >= 10) return num.toFixed(2);
    if (num >= 1) return num.toFixed(3);
    return num.toFixed(4);
  };

  const getItemStyles = () => {
    const style: any[] = [
      styles.itemContainer,
      { 
        backgroundColor: colors.card,
        borderColor: colors.border,
      }
    ];

    if (isFirst && isLast) {
      style.push({ borderRadius: 12 });
    } else if (isFirst) {
      style.push({ 
        borderTopLeftRadius: 12, 
        borderTopRightRadius: 12 
      });
    } else if (isLast) {
      style.push({ 
        borderBottomLeftRadius: 12, 
        borderBottomRightRadius: 12 
      });
    }

    if (isFirst && isLast) {
      style.push({ borderWidth: 1 });
    } else if (isFirst) {
      style.push({ 
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 0
      });
    } else if (isLast) {
      style.push({ 
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 0
      });
    } else {
      style.push({ 
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 0,
        borderBottomWidth: 0
      });
    }

    return style;
  };

  const handlePress = () => {
    onPress?.(rate);
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={getItemStyles()}>
        {!isLast && (
          <View style={[
            styles.divider,
            { backgroundColor: colors.border }
          ]} />
        )}
        
        <View style={styles.currencyContent}>
          <View style={styles.currencyLeft}>
            <View style={styles.currencyInfo}>
              <View style={styles.currencyHeader}>
                <Text style={[styles.currencyCode, { color: colors.text }]}>
                  {rate.code}
                </Text>
                <Text style={[styles.nominal, { color: colors.icon }]}>
                  {rate.nominal} {rate.code}
                </Text>
              </View>
              <Text style={[styles.currencyName, { color: colors.text }]}>
                {rate.name}
              </Text>
            </View>
          </View>
          
          <View style={styles.rateInfo}>
            <Text style={[styles.rateValue, { color: colors.text }]}>
              {rate.rate ? `${formatRate(rate.rate)} ₽` : '—'}
            </Text>
            <View style={styles.changeContainer}>
              <Text style={[styles.changeSymbol, { color: getChangeColor() }]}>
                {getChangeSymbol()}
              </Text>
              <Text style={[styles.changePercentage, { color: getChangeColor() }]}>
                {Math.abs(parseFloat(rate.changePercentage)).toFixed(2)}%
              </Text>
            </View>
            {rate.previousRate && (
              <Text style={[styles.previousRate, { color: colors.icon }]}>
                было: {formatRate(rate.previousRate)} ₽
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    position: 'relative',
    marginHorizontal: 16,
  },
  divider: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 1,
  },
  currencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: 8,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  currencyName: {
    fontSize: 14,
    opacity: 0.8,
  },
  nominal: {
    fontSize: 12,
    opacity: 0.6,
  },
  rateInfo: {
    alignItems: 'flex-end',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  changeSymbol: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  changePercentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  previousRate: {
    fontSize: 11,
    opacity: 0.6,
  },
});