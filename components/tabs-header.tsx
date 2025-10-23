// components/tabs-header.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNotifications } from '@/contexts/NotificationContext';

export const TabsHeader = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { unreadCount } = useNotifications();

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

      {/* Кнопка уведомлений справа с бейджем */}
      <Pressable
        onPress={() => router.push('/(screens)/notifications')}
        style={styles.notificationButton}
        hitSlop={10}
      >
        <Ionicons
          name="notifications-outline"
          size={26}
          color="white"
        />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
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
  },
  headerButton: {
    padding: 4,
  },
  notificationButton: {
    padding: 4,
    position: 'relative',
  },
  headerDate: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});