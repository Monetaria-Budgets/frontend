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
    <View style={[styles.filterContainer, { backgroundColor: colors.card }]}>
      {/* Строка поиска */}
      <View style={styles.searchRow}>
        <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colors.text} 
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Поиск валюты..."
            placeholderTextColor={colors.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={colors.text} 
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchRow: {
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextInactive: {
    color: '#8E8E93',
  },
  tabButtonTextActive: {
    color: '#007AFF',
  },
});