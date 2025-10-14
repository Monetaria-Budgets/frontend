// app/(tabs)/currency/components/CurrencyFilterSection.tsx
import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, TextInput } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCurrency } from '@/contexts/CurrencyContext';

export const CurrencyFilterSection = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { 
    searchQuery, 
    setSearchQuery, 
    activeTab, 
    setActiveTab 
  } = useCurrency();

  const isTabActive = (tab: 'popular' | 'all') => {
    return activeTab === tab;
  };

  return (
    <View style={[styles.filterContainer, { backgroundColor: colors.tint }]}>
      {/* Строка поиска */}
      <View style={styles.searchRow}>
        <View style={[styles.searchContainer, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Ionicons 
            name="search" 
            size={20} 
            color="rgba(255,255,255,0.8)" 
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: 'white' }]}
            placeholder="Поиск валюты..."
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons 
                name="close-circle" 
                size={20} 
                color="rgba(255,255,255,0.7)" 
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Строка табов */}
      <View style={styles.tabRow}>
        <Pressable
          style={[
            styles.tabButton,
            isTabActive('popular') ? styles.tabButtonActive : styles.tabButtonInactive
          ]}
          onPress={() => setActiveTab('popular')}
        >
          <Text style={[
            styles.tabButtonText,
            isTabActive('popular') ? styles.tabButtonTextActive : styles.tabButtonTextInactive
          ]}>
            Популярное
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tabButton,
            isTabActive('all') ? styles.tabButtonActive : styles.tabButtonInactive
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[
            styles.tabButtonText,
            isTabActive('all') ? styles.tabButtonTextActive : styles.tabButtonTextInactive
          ]}>
            Все валюты
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    height: 120,
  },
  searchRow: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    fontWeight: '500',
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  tabButtonInactive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tabButtonActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextInactive: {
    color: 'white',
  },
  tabButtonTextActive: {
    color: '#007AFF', // или colors.tint если нужен точный цвет
  },
});