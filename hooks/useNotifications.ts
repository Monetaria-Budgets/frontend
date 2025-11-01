import { useState, useCallback } from 'react';
import { notificationService, Notification, UnreadCountResponse } from '@/services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async (limit: number = 50, offset: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications(limit, offset);
      setNotifications(response.data);
      console.log(`📥 Загружено ${response.data.length} уведомлений`);
      return response;
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Ошибка загрузки уведомлений:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response: UnreadCountResponse = await notificationService.getUnreadCount();
      setUnreadCount(response.unreadCount);
      console.log(`🔔 Непрочитанных уведомлений: ${response.unreadCount}`);
      return response;
    } catch (err: any) {
      console.error('❌ Ошибка загрузки счетчика непрочитанных:', err);
      throw err;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Обновляем локальное состояние
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: 1 }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      console.log(`✅ Уведомление ${notificationId} помечено как прочитанное`);
      
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Ошибка отметки как прочитанного:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Обновляем локальное состояние
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: 1 }))
      );
      
      setUnreadCount(0);
      console.log('✅ Все уведомления помечены как прочитанные');
      
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Ошибка отметки всех как прочитанных:', err);
      throw err;
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Обновляем локальное состояние
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      // Обновляем счетчик если уведомление было непрочитанным
      if (notificationToDelete && notificationToDelete.is_read === 0) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      console.log(`🗑️ Уведомление ${notificationId} удалено`);
      
    } catch (err: any) {
      setError(err.message);
      console.error('❌ Ошибка удаления уведомления:', err);
      throw err;
    }
  }, [notifications]);

  const refresh = useCallback(() => {
    loadUnreadCount();
    loadNotifications();
  }, [loadUnreadCount, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh,
  };
};