import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useNotification } from '@/contexts/NotificationContext';
import { useHeaderNotifications } from '@/hooks/useHeaderNotifications'; // ← ДОБАВЬ ЭТОТ ИМПОРТ

export const TabsHeader = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { unreadCount } = useNotification();

  // ДОБАВЬ АВТООБНОВЛЕНИЕ ДЛЯ ШАПКИ
  useHeaderNotifications();

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
        style={styles.headerButton}
        hitSlop={10}
      >
        <View style={styles.notificationContainer}>
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
        </View>
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
  headerDate: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});