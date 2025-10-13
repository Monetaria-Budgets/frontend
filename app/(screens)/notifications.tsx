// app/(screens)/notifications.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedGradientView } from '@/components/themed-gradient-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const notifications = [
    {
      id: 1,
      title: 'Новая операция',
      message: 'Доход: Зарплата +98 736 ₽',
      time: '2 часа назад',
      read: false,
    },
    {
      id: 2,
      title: 'Напоминание',
      message: 'Не забудьте добавить расходы за неделю',
      time: 'Вчера',
      read: true,
    },
    {
      id: 3,
      title: 'Обновление приложения',
      message: 'Доступна новая версия приложения',
      time: '3 дня назад',
      read: true,
    },
  ];

  return (
    <ThemedGradientView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: 'Уведомления',
          headerTitleStyle: { color: colors.text },
          headerStyle: { backgroundColor: colors.background },
        }} 
      />
      
      <ScrollView style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.icon} />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              Нет уведомлений
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.icon }]}>
              Здесь будут появляться ваши уведомления
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
            <View 
              key={notification.id} 
              style={[
                styles.notificationItem,
                { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' },
                !notification.read && styles.unreadNotification
              ]}
            >
              <View style={styles.notificationLeft}>
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: !notification.read ? colors.tint + '20' : 'rgba(0,0,0,0.1)' }
                ]}>
                  <Ionicons 
                    name="notifications" 
                    size={20} 
                    color={!notification.read ? colors.tint : colors.icon} 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={[styles.notificationTitle, { color: colors.text }]}>
                    {notification.title}
                  </Text>
                  <Text style={[styles.notificationMessage, { color: colors.icon }]}>
                    {notification.message}
                  </Text>
                  <Text style={[styles.notificationTime, { color: colors.icon }]}>
                    {notification.time}
                  </Text>
                </View>
              </View>
              {!notification.read && (
                <View style={[styles.unreadDot, { backgroundColor: colors.tint }]} />
              )}
            </View>
          ))
        )}
      </ScrollView>
    </ThemedGradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  unreadNotification: {
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    opacity: 0.7,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});