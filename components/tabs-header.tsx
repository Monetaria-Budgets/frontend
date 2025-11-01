// components/tabs-header.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const TabsHeader = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const currentDate = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <View style={[styles.header, { backgroundColor: colors.tint }]}>
      {/* Кнопка профиля слева */}
      <Pressable
        onPress={() => router.push('/(screens)/profile')}
        style={styles.headerButton}
        hitSlop={10}
      >
        <MaterialIcons
          name="account-circle"
          size={30}
          color="white"
        />
      </Pressable>

      {/* Дата по центру */}
      <Text style={styles.headerDate}>
        {currentDate}
      </Text>

      {/* Кнопка уведомлений справа */}
      <Pressable
        onPress={() => router.push('/(screens)/notifications')}
        style={styles.headerButton}
        hitSlop={10}
      >
        <Ionicons
          name="notifications-outline"
          size={26}
          color="white"
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    // Убрали borderBottomWidth
  },
  headerButton: {
    padding: 4,
  },
  headerDate: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white', // Белый текст на tint фоне
  },
});