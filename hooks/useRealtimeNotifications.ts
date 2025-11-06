import { useEffect, useRef } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/contexts/AuthContext';

export const useRealtimeNotifications = () => {
  const { refresh, notifications, loadUnreadCount } = useNotification();
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);
  const refreshTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Обновляем бейдж с количеством непрочитанных
    const updateBadge = async () => {
      try {
        if (!user) {
          // Сбрасываем бейдж если пользователь вышел
          await Notifications.setBadgeCountAsync(0);
          return;
        }

        const currentUnread = notifications.filter(n => n.is_read === 0).length;
        await Notifications.setBadgeCountAsync(currentUnread);
        console.log(`🔄 Бейдж обновлен: ${currentUnread} непрочитанных`);
      } catch (error) {
        console.error('Ошибка обновления бейджа:', error);
      }
    };

    updateBadge();
  }, [notifications, user]);

  // Слушатель для входящих уведомлений в реальном времени
  useEffect(() => {
    // Не запускаем слушатели если пользователь не авторизован
    if (!user) return;

    const notificationListener = Notifications.addNotificationReceivedListener(async (notification) => {
      console.log('📨 Новое уведомление получено в реальном времени:', notification);
      
      // Ждем немного и обновляем данные
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      refreshTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Авто-обновление из-за нового уведомления');
        refresh();
        loadUnreadCount();
      }, 500) as unknown as number;
    });

    // Слушатель для кликов по уведомлениям
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Пользователь нажал на уведомление');
      // Обновляем при переходе из уведомления
      if (user) {
        refresh();
        loadUnreadCount();
      }
    });

    // Интервал для проверки новых уведомлений (каждые 15 секунд когда приложение активно)
    const interval = setInterval(() => {
      if (appState.current === 'active' && user) {
        console.log('🔄 Периодическая проверка новых уведомлений');
        loadUnreadCount();
      }
    }, 15000);

    // Слушатель изменения состояния приложения
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active' && user) {
        console.log('📱 Приложение стало активным - полное обновление уведомлений');
        refresh();
        loadUnreadCount();
      }
      appState.current = nextAppState;
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
      subscription.remove();
      clearInterval(interval);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [refresh, loadUnreadCount, user]);
};