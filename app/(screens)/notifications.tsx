import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useNotification } from '@/contexts/NotificationContext';
import { pushNotificationService } from '@/services/pushNotificationService';
import { useNotificationsSetup } from '@/hooks/useNotificationsSetup';
import { useDeviceNotificationScheduler } from '@/hooks/useDeviceNotificationScheduler';
import { notificationService } from '@/services/notificationService';

// Компоненты
import { NotificationHeader } from '@/components/notifications/NotificationHeader';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { EmptyState } from '@/components/notifications/EmptyState';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refresh,
  } = useNotification();

  // Инициализируем уведомления
  useNotificationsSetup();
  useDeviceNotificationScheduler();

  const [refreshing, setRefreshing] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([]);
  const [futureNotificationsCount, setFutureNotificationsCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    const sortedNotifications = [...notifications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    setFilteredNotifications(sortedNotifications);
  }, [notifications]);

  useEffect(() => {
    const loadFutureNotifications = async () => {
      try {
        const response = await notificationService.getFutureNotifications();
        setFutureNotificationsCount(response.data.length);
      } catch (error) {
        console.error('Ошибка загрузки будущих уведомлений:', error);
      }
    };
    
    loadFutureNotifications();
  }, [filteredNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    
    try {
      const response = await notificationService.getFutureNotifications();
      setFutureNotificationsCount(response.data.length);
    } catch (error) {
      console.error('Ошибка загрузки будущих уведомлений:', error);
    }
    
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: any) => {
    if (notification.is_read === 0) {
      await markAsRead(notification.id);
    }
    router.push(`/(modals)/notification-detail?id=${notification.id}`);
  };

  const handleDeleteNotification = async (notificationId: number) => {
    Alert.alert(
      'Удалить уведомление',
      'Вы уверены, что хотите удалить это уведомление?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            await deleteNotification(notificationId);
            await pushNotificationService.cancelScheduledNotification(notificationId);
          }
        },
      ]
    );
  };

  const handleDeleteAllNotifications = () => {
    if (filteredNotifications.length === 0) return;
    
    Alert.alert(
      'Очистить все уведомления',
      `Вы уверены, что хотите удалить все ${filteredNotifications.length} уведомлений? Это действие нельзя отменить.`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Очистить всё', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllNotifications();
              // Отменяем все запланированные пуш-уведомления
              for (const notification of filteredNotifications) {
                if (notification.scheduled_at) {
                  await pushNotificationService.cancelScheduledNotification(notification.id);
                }
              }
              Alert.alert('Успешно', 'Все уведомления удалены');
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить уведомления');
            }
          }
        },
      ]
    );
  };

  const handleMarkAllAsRead = () => {
    const currentUnreadCount = filteredNotifications.filter(n => n.is_read === 0).length;
    if (currentUnreadCount === 0) return;
    
    Alert.alert(
      'Пометить все как прочитанные',
      `Отметить все ${currentUnreadCount} непрочитанных уведомлений как прочитанные?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Пометить', 
          onPress: markAllAsRead
        },
      ]
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <NotificationHeader
        unreadCount={unreadCount}
        totalCount={filteredNotifications.length}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDeleteAll={handleDeleteAllNotifications}
      />

      {filteredNotifications.length === 0 ? (
        <EmptyState
          futureNotificationsCount={futureNotificationsCount}
          onRefresh={onRefresh}
        />
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={handleNotificationPress}
              onDelete={handleDeleteNotification}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.tint}
              colors={[colors.tint]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
});