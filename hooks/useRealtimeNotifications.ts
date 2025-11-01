// hooks/useRealtimeNotifications.ts - ОБНОВЛЕННАЯ ВЕРСИЯ
import { useEffect, useRef } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';

export const useRealtimeNotifications = () => {
  const { refresh, notifications } = useNotification();
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Обновляем бейдж с количеством непрочитанных
    const updateBadge = async () => {
      try {
        const currentUnread = notifications.filter(n => n.is_read === 0).length;
        await Notifications.setBadgeCountAsync(currentUnread);
        console.log(`🔄 Бейдж обновлен: ${currentUnread} непрочитанных`);
      } catch (error) {
        console.error('Ошибка обновления бейджа:', error);
      }
    };

    updateBadge();
  }, [notifications]);

  // УБИРАЕМ ИНТЕРВАЛ - автообновление только при открытии приложения
  useEffect(() => {
    // Слушатель изменения состояния приложения
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 Приложение стало активным - обновляем уведомления');
        refresh();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [refresh]);
};