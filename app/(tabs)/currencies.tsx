// app/(tabs)/currency.tsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl,
  ActivityIndicator,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent
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
import { CurrencyModal } from '@/components/currency/CurrencyModal';
import { CurrencyRate } from '@/services/currencyService';

function CurrencyScreenContent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { 
    loading, 
    refreshing, 
    refreshRates, 
    filterRates, 
    rates
  } = useCurrency();

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyRate | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const isScrolling = useRef(false);
  const filterHeight = useRef(new Animated.Value(1)).current;
  const lastScrollDirection = useRef<'up' | 'down' | null>(null);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60, 90],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });

  useFocusEffect(
    React.useCallback(() => {
      // Можно добавить дополнительную логику при фокусе
    }, [])
  );

  const onRefresh = () => {
    refreshRates();
  };

  const currentRates = filterRates(rates);

  const hideFilters = () => {
    Animated.timing(filterHeight, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const showFilters = () => {
    Animated.timing(filterHeight, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDirection = currentScrollY > lastScrollY.current ? 'down' : 'up';
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    const isAtBottom = currentScrollY >= contentHeight - layoutHeight - 10;
    
    // Защита от дёргания: не меняем состояние если достигли дна и продолжаем скроллить вниз
    if (isAtBottom && scrollDirection === 'down') {
      lastScrollY.current = currentScrollY;
      scrollY.setValue(currentScrollY);
      return;
    }
    
    // Защита от частых вызовов - меняем состояние только если направление изменилось
    if (scrollDirection !== lastScrollDirection.current && !isScrolling.current) {
      isScrolling.current = true;
      
      if (scrollDirection === 'down' && currentScrollY > 50) {
        hideFilters();
      } else if (scrollDirection === 'up') {
        showFilters();
      }
      
      lastScrollDirection.current = scrollDirection;
    }
    
    lastScrollY.current = currentScrollY;
    scrollY.setValue(currentScrollY);
  };

  const handleScrollEnd = () => {
    isScrolling.current = false;
  };

  const handleCurrencyPress = (currency: CurrencyRate) => {
    setSelectedCurrency(currency);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCurrency(null);
  };

  // Вычисляем высоту секции фильтров
  const filterSectionHeight = filterHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

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
          headerTransparent: true,
          headerBlurEffect: colorScheme === 'dark' ? 'dark' : 'light',
        }} 
      />
      
      <Animated.View 
        style={[
          styles.floatingHeader,
          {
            backgroundColor: colorScheme === 'dark' 
              ? `rgba(30, 30, 30, ${headerOpacity})`
              : `rgba(255, 255, 255, ${headerOpacity})`,
            borderBottomColor: colorScheme === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'
          }
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Курсы валют
        </Text>
      </Animated.View>

      {/* Основной контент */}
      <View style={styles.content}>
        {/* Заголовок - фиксированный */}
        <CurrencyHeader />
        
        {/* Фильтры с анимацией высоты */}
        <Animated.View 
          style={[
            styles.filtersWrapper,
            {
              height: filterSectionHeight,
              overflow: 'hidden',
            }
          ]}
        >
          <CurrencyFilterSection />
        </Animated.View>
        
        {/* Список валют - занимает всё оставшееся пространство */}
        <View style={styles.ratesContainer}>
          <ScrollView 
            style={styles.ratesList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.tint}
                colors={[colors.tint]}
              />
            }
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            onScrollEndDrag={handleScrollEnd}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
          >
            <View style={styles.scrollContent}>
              {refreshing && (
                <View style={styles.refreshIndicator}>
                  <ActivityIndicator size="small" color={colors.tint} />
                </View>
              )}
              
              <CurrencyList 
                rates={currentRates} 
                onCurrencyPress={handleCurrencyPress}
              />
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Модалка валюты */}
      <CurrencyModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        currency={selectedCurrency}
      />
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
  content: {
    flex: 1,
    paddingTop: 90,
  },
  filtersWrapper: {
    // Высота анимируется
  },
  ratesContainer: {
    flex: 1,
  },
  ratesList: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  refreshIndicator: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});