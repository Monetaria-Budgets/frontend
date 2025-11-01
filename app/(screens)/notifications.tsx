import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useNotification } from '@/contexts/NotificationContext';
import { pushNotificationService } from '@/services/pushNotificationService';
import { useNotificationsSetup } from '@/hooks/useNotificationsSetup';
import { useDeviceNotificationScheduler } from '@/hooks/useDeviceNotificationScheduler';
import { notificationService } from '@/services/notificationService';
import Ionicons from '@expo/vector-icons/Ionicons';

// Маппинг типов уведомлений на русские названия
const NOTIFICATION_TYPES: { [key: string]: string } = {
  'subscription_expiring': 'Истечение подписки',
  'system_update': 'Обновление системы', 
  'budget_exceeded': 'Превышение бюджета',
  'promo': 'Специальное предложение',
};

// Маппинг типов уведомлений на иконки (с правильными типами)
const NOTIFICATION_ICONS: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  'subscription_expiring': 'calendar-outline',
  'system_update': 'construct-outline',
  'budget_exceeded': 'warning-outline',
  'promo': 'pricetag-outline',
};

// Маппинг типов уведомлений на цвета
const NOTIFICATION_COLORS: { [key: string]: string } = {
  'subscription_expiring': '#FF6B6B',
  'system_update': '#4ECDC4',
  'budget_exceeded': '#FFD166',
  'promo': '#9B5DE5',
};

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
    refresh,
  } = useNotification();

  // Инициализируем уведомления
  useNotificationsSetup();
  
  // Добавляем планировщик уведомлений на устройстве
  useDeviceNotificationScheduler();

  const [refreshing, setRefreshing] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState<any[]>([]);
  const [futureNotificationsCount, setFutureNotificationsCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    // Теперь бэкенд сам фильтрует уведомления, просто используем полученные данные
    const sortedNotifications = [...notifications].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    setFilteredNotifications(sortedNotifications);
    console.log(`📊 Уведомлений для отображения: ${sortedNotifications.length}`);
  }, [notifications]);

  // Загружаем счетчик будущих уведомлений
  useEffect(() => {
    const loadFutureNotifications = async () => {
      try {
        const response = await notificationService.getFutureNotifications();
        setFutureNotificationsCount(response.data.length);
      } catch (error) {
        console.error('Ошибка загрузки будущих уведомлений:', error);
      }
    };
    
    if (filteredNotifications.length === 0) {
      loadFutureNotifications();
    }
  }, [filteredNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    
    // Также обновляем счетчик будущих уведомлений
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

  const handleDeleteNotification = async (notificationId: number) => {
    Alert.alert(
      'Удалить уведомление',
      `Удалить это уведомление?`,
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            await deleteNotification(notificationId);
            // Также отменяем запланированное пуш-уведомление
            await pushNotificationService.cancelScheduledNotification(notificationId);
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays === 1) return 'Вчера';
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Функции для получения локализованных данных
  const getTypeDisplayName = (typeName: string) => {
    return NOTIFICATION_TYPES[typeName] || typeName;
  };

  const getTypeIcon = (typeName: string): keyof typeof Ionicons.glyphMap => {
    return NOTIFICATION_ICONS[typeName] || 'notifications-outline';
  };

  const getTypeColor = (typeName: string) => {
    return NOTIFICATION_COLORS[typeName] || colors.tint;
  };

  const renderNotificationItem = ({ item }: { item: any }) => {
    const typeColor = getTypeColor(item.type_name);
    const displayName = getTypeDisplayName(item.type_name);

    return (
      <Pressable
        style={[
          styles.notificationItem,
          { 
            backgroundColor: colors.card,
            borderLeftColor: item.is_read === 0 ? typeColor : 'transparent',
          }
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
          <Ionicons 
            name={getTypeIcon(item.type_name)} 
            size={20} 
            color={typeColor} 
          />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={[styles.notificationType, { color: typeColor }]}>
              {displayName}
            </Text>
            <Text style={[styles.notificationDate, { color: colors.textSecondary }]}>
              {formatDate(item.created_at)}
            </Text>
          </View>
          
          <Text 
            style={[
              styles.notificationMessage, 
              { color: colors.text },
              item.is_read === 0 && styles.unreadMessage
            ]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          
          <View style={styles.notificationFooter}>
            <View style={styles.timeInfo}>
              <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
              <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                Получено {new Date(item.created_at).toLocaleTimeString('ru-RU', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
            {item.is_read === 0 && (
              <View style={[styles.unreadBadge, { backgroundColor: typeColor }]} />
            )}
          </View>
        </View>
        
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
          hitSlop={10}
        >
          <Ionicons name="close-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      </Pressable>
    );
  };

  // Считаем только отображаемые непрочитанные уведомления
  const displayUnreadCount = filteredNotifications.filter(n => n.is_read === 0).length;

  if (loading && notifications.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Загружаем уведомления...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Заголовок экрана */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>
            Уведомления
          </Text>
          {displayUnreadCount > 0 && (
            <View style={[styles.unreadCounter, { backgroundColor: colors.tint }]}>
              <Text style={styles.unreadCounterText}>{displayUnreadCount}</Text>
            </View>
          )}
        </View>
        
        {displayUnreadCount > 0 && (
          <Pressable 
            onPress={handleMarkAllAsRead} 
            style={({ pressed }) => [
              styles.markAllButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Text style={[styles.markAllText, { color: colors.tint }]}>
              Прочитать все
            </Text>
          </Pressable>
        )}
      </View>

      {/* Список уведомлений */}
      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
            <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            Нет уведомлений
          </Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            {futureNotificationsCount > 0 
              ? `Есть ${futureNotificationsCount} запланированных уведомлений, которые появятся в указанное время`
              : 'Здесь появятся ваши уведомления'
            }
          </Text>
          <Pressable 
            style={({ pressed }) => [
              styles.refreshButton, 
              { backgroundColor: colors.tint, opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={onRefresh}
          >
            <Ionicons name="refresh-outline" size={18} color="white" />
            <Text style={styles.refreshButtonText}>Обновить</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotificationItem}
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

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <Pressable 
            style={({ pressed }) => [
              styles.retryButton, 
              { backgroundColor: colors.tint, opacity: pressed ? 0.8 : 1 }
            ]}
            onPress={onRefresh}
          >
            <Ionicons name="refresh-outline" size={18} color="white" />
            <Text style={styles.retryButtonText}>Попробовать снова</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  unreadCounter: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  markAllText: {
    fontSize: 15,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  listContent: {
    padding: 8,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 16,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationType: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  notificationDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  notificationMessage: {
    fontSize: 16,
    lineHeight: 20,
    marginBottom: 8,
  },
  unreadMessage: {
    fontWeight: '600',
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});