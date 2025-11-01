// hooks/useDeviceNotificationScheduler.ts
import { useEffect, useRef } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { pushNotificationService } from '@/services/pushNotificationService';

export const useDeviceNotificationScheduler = () => {
  const { notifications } = useNotification();
  const scheduledNotificationsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const scheduleFutureNotifications = async () => {
      try {
        console.log('🔄 Планируем уведомления на устройстве...');
        
        // Запрашиваем разрешения
        const hasPermission = await pushNotificationService.requestPermissions();
        if (!hasPermission) {
          console.warn('⚠️ Нет разрешения на уведомления');
          return;
        }

        const now = new Date();
        let newlyScheduled = 0;

        // Планируем только будущие уведомления, которые еще не запланированы
        for (const notification of notifications) {
          if (notification.scheduled_at && !scheduledNotificationsRef.current.has(notification.id)) {
            const scheduledTime = new Date(notification.scheduled_at);
            if (scheduledTime > now) {
              await pushNotificationService.scheduleNotificationOnDevice(notification);
              scheduledNotificationsRef.current.add(notification.id);
              newlyScheduled++;
            }
          }
        }

        if (newlyScheduled > 0) {
          console.log(`✅ Новых уведомлений запланировано: ${newlyScheduled}`);
        }

        // Логируем общее количество запланированных
        const scheduled = await pushNotificationService.getScheduledNotifications();
        console.log(`📋 Всего уведомлений запланировано на устройстве: ${scheduled.length}`);

      } catch (error) {
        console.error('❌ Ошибка планирования уведомлений на устройсте:', error);
      }
    };

    scheduleFutureNotifications();
  }, [notifications]);
};