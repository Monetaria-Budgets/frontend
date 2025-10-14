// app/(tabs)/currency/components/CurrencyHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export const CurrencyHeader = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.header, { backgroundColor: colors.tint }]}>
      <Text style={styles.title}>Курсы валют</Text>
      <Text style={styles.subtitle}>
        Курсы ЦБ РФ на {new Date().toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16, // Уменьшили с 24 до 16
  },
  title: {
    fontSize: 24, // Уменьшили с 28 до 24
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14, // Уменьшили с 16 до 14
    color: 'rgba(255,255,255,0.9)',
  },
});