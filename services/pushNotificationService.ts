// services/pushNotificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Правильная настройка обработки уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const pushNotificationService = {
  /**
   * Планировать уведомление на устройстве пользователя
   */
  async scheduleNotificationOnDevice(notification: any) {
    const { id, message, type_name, scheduled_at } = notification;
    
    // Если scheduled_at не указан - отправляем сразу
    if (!scheduled_at) {
      await this.sendImmediateNotification(notification);
      return;
    }

    const scheduledTime = new Date(scheduled_at);
    const now = new Date();
    
    // Если время уже наступило - отправляем сразу
    if (scheduledTime <= now) {
      await this.sendImmediateNotification(notification);
      return;
    }

    // Планируем отложенное уведомление на устройстве
    const trigger: Notifications.DateTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: scheduledTime,
    };
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: this.getNotificationTitle(type_name),
        body: message,
        data: { 
          notificationId: id,
          type: 'scheduled',
          originalScheduledTime: scheduled_at
        },
        sound: 'default',
        badge: 1,
      },
      trigger,
    });
    
    console.log(`📅 Уведомление запланировано на устройстве на ${scheduledTime}`);
  },

  /**
   * Отправить уведомление немедленно
   */
  async sendImmediateNotification(notification: any) {
    const { id, message, type_name } = notification;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: this.getNotificationTitle(type_name),
        body: message,
        data: { 
          notificationId: id,
          type: 'immediate'
        },
        sound: 'default',
        badge: 1,
      },
      trigger: null,
    });
    
    console.log('📱 Уведомление отправлено немедленно');
  },

  /**
   * Планировать все будущие уведомления из списка
   */
  async scheduleAllFutureNotifications(notifications: any[]) {
    const now = new Date();
    let scheduledCount = 0;
    
    for (const notification of notifications) {
      if (notification.scheduled_at) {
        const scheduledTime = new Date(notification.scheduled_at);
        if (scheduledTime > now) {
          await this.scheduleNotificationOnDevice(notification);
          scheduledCount++;
        }
      }
    }

    console.log(`📅 Всего запланировано уведомлений на устройстве: ${scheduledCount}`);
  },

  /**
   * Отменить запланированное уведомление
   */
  async cancelScheduledNotification(notificationId: number) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const notificationToCancel = scheduledNotifications.find(
        notif => notif.content.data?.notificationId === notificationId
      );
      
      if (notificationToCancel) {
        await Notifications.cancelScheduledNotificationAsync(notificationToCancel.identifier);
        console.log(`❌ Запланированное уведомление отменено: ${notificationId}`);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  /**
   * Получить все запланированные на устройстве уведомления
   */
  async getScheduledNotifications() {
    return await Notifications.getAllScheduledNotificationsAsync();
  },

  /**
   * Запросить разрешение на уведомления
   */
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Очистить все запланированные уведомления
   */
  async cancelAllScheduledNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🗑️ Все запланированные уведомления отменены');
  },

  // Вспомогательная функция для получения заголовка
  getNotificationTitle(typeName: string): string {
    const titles: { [key: string]: string } = {
      'subscription_expiring': 'Истечение подписки',
      'system_update': 'Обновление системы',
      'budget_exceeded': 'Превышение бюджета',
      'promo': 'Специальное предложение',
    };
    return titles[typeName] || 'Уведомление';
  }
};