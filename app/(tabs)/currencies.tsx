import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedGradientView } from '@/components/themed-gradient-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CurrencyProvider, useCurrency } from '@/contexts/CurrencyContext';
import { CurrencyHeader } from '@/components/currency/CurrencyHeader';
import { CurrencyFilterSection } from '@/components/currency/CurrencyFilterSection';
import { CurrencyList } from '@/components/currency/CurrencyList';

function CurrencyScreenContent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { 
    loading, 
    refreshing, 
    refreshRates, 
    filterRates, 
    rates, 
    popularRates 
  } = useCurrency();

  useFocusEffect(
    React.useCallback(() => {
      // Можно добавить дополнительную логику при фокусе
    }, [])
  );

  const onRefresh = () => {
    refreshRates();
  };

  const currentRates = filterRates(rates);

  if (loading && rates.length === 0) {
    return (
      <ThemedGradientView style={styles.container}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Загрузка курсов...
        </Text>
      </ThemedGradientView>
    );
  }

  return (
    <ThemedGradientView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Валюты',
        }} 
      />
      
      <CurrencyHeader />
      
      <CurrencyFilterSection />
      
      <ScrollView 
        style={styles.ratesList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <CurrencyList rates={currentRates} />
      </ScrollView>
    </ThemedGradientView>
  );
}

export default function CurrencyScreen() {
  return (
    <CurrencyProvider>
      <CurrencyScreenContent />
    </CurrencyProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  ratesList: {
    flex: 1,
    paddingTop: 16,
  },
});