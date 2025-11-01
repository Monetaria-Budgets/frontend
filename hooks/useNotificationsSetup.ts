// hooks/useNotificationsSetup.ts
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { pushNotificationService } from '@/services/pushNotificationService';
import { useNotification } from '@/contexts/NotificationContext';

export const useNotificationsSetup = () => {
  const { refresh } = useNotification();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Запрашиваем разрешения при запуске приложения
    const setupNotifications = async () => {
      try {
        await pushNotificationService.requestPermissions();
        
        // Для Android - настраиваем канал уведомлений
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    // Слушатель для входящих уведомлений
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📨 Уведомление получено:', notification);
    });

    // Слушатель для кликов по уведомлениям
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const { notificationId } = response.notification.request.content.data;
      console.log('👆 Пользователь нажал на уведомление:', notificationId);
      
      // Обновляем список уведомлений
      refresh();
    });

    return () => {
      // Очистка слушателей
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [refresh]);
};