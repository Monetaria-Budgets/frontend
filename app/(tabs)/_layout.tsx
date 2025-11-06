// app/(tabs)/_layout.tsx
import { Tabs, useRouter, Redirect } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { TabsHeader } from '@/components/tabs-header';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, Text, View, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { user, loading, authInitialized } = useAuth();

  console.log('📱 TabLayout: Auth state:', { 
    user: !!user, 
    loading, 
    authInitialized 
  });

  // Показываем индикатор загрузки при инициализации
  if (loading || !authInitialized) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: Colors[colorScheme ?? 'light'].background 
      }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: Colors[colorScheme ?? 'light'].text }}>
          Загрузка...
        </Text>
      </View>
    );
  }

  // Если не авторизован - редирект на логин
  if (!user) {
    console.log('🔐 TabLayout: User not authenticated, redirecting to login');
    return <Redirect href="/(auth)/login" />;
  }

  console.log('✅ TabLayout: User authenticated, rendering tabs');

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          height: 90,
          paddingBottom: 6,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
        tabBarIconStyle: {
          marginBottom: -4,
        },
        // Устанавливаем общий хедер для всех табов
        header: () => <TabsHeader />,
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Главная',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name="home" size={24} color={color} />
              <Text
                style={[
                  styles.tabText,
                  { color: color },
                  focused && styles.tabTextFocused
                ]}
              >
                Главная
              </Text>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: 'История',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name="time-sharp" size={24} color={color} />
              <Text
                style={[
                  styles.tabText,
                  { color: color },
                  focused && styles.tabTextFocused
                ]}
              >
                История
              </Text>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="add"
        options={{
          title: 'Добавить',
          tabBarIcon: ({ color }) => (
            <Pressable
              onPress={() => router.push('/(modals)/add-modal')}
              style={[
                styles.addButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].tint }
              ]}
            >
              <Ionicons name="add" size={32} color="#fff" />
            </Pressable>
          ),
        }}
      />
      
      <Tabs.Screen
        name="statistics"
        options={{
          title: 'Статистика',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <Ionicons name="stats-chart" size={24} color={color} />
              <Text
                style={[
                  styles.tabText,
                  { color: color },
                  focused && styles.tabTextFocused
                ]}
              >
                Статистика
              </Text>
            </View>
          ),
        }}
      />
      
      <Tabs.Screen
        name="currencies"
        options={{
          title: 'Валюты',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <MaterialIcons name="currency-exchange" size={24} color={color} />
              <Text
                style={[
                  styles.tabText,
                  { color: color },
                  focused && styles.tabTextFocused
                ]}
              >
                Валюты
              </Text>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center',
    width: 80,
  },
  tabTextFocused: {
    fontWeight: '600',
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    top: -30,
    position: 'absolute',
  },
});