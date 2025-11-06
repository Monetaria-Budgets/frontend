import { useState, useCallback } from 'react';
import { notificationService, Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Проверка авторизации перед любым запросом
  const checkAuth = useCallback(() => {
    if (!user) {
      throw new Error('Пользователь не авторизован');
    }
  }, [user]);

  const loadNotifications = useCallback(async (limit: number = 50, offset: number = 0) => {
    try {
      checkAuth();
      setLoading(true);
      setError(null);
      
      const response = await notificationService.getNotifications(limit, offset);
      
      if (response.success) {
        setNotifications(response.data);
      } else {
        throw new Error('Не удалось загрузить уведомления');
      }
    } catch (err: any) {
      // Игнорируем ошибки связанные с отсутствием авторизации
      if (err.message !== 'Пользователь не авторизован') {
        setError(err.message);
        console.error('❌ Ошибка загрузки уведомлений:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  const loadUnreadCount = useCallback(async () => {
    try {
      checkAuth();
      
      const response = await notificationService.getUnreadCount();
      
      if (response.success) {
        setUnreadCount(response.unreadCount);
      } else {
        throw new Error('Не удалось загрузить количество непрочитанных');
      }
    } catch (err: any) {
      // Игнорируем ошибки связанные с отсутствием авторизации
      if (err.message !== 'Пользователь не авторизован') {
        setError(err.message);
        console.error('❌ Ошибка загрузки количества непрочитанных:', err);
      }
    }
  }, [checkAuth]);

  const markAsRead = useCallback(async (notificationId: number) => {
    try {
      checkAuth();
      
      const response = await notificationService.markAsRead(notificationId);
      
      if (response.success) {
        // Обновляем локальное состояние
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: 1 }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        throw new Error('Не удалось отметить уведомление как прочитанное');
      }
    } catch (err: any) {
      if (err.message !== 'Пользователь не авторизован') {
        setError(err.message);
        console.error('❌ Ошибка отметки уведомления как прочитанного:', err);
        throw err;
      }
    }
  }, [checkAuth]);

  const markAllAsRead = useCallback(async () => {
    try {
      checkAuth();
      
      const response = await notificationService.markAllAsRead();
      
      if (response.success) {
        // Обновляем локальное состояние
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, is_read: 1 }))
        );
        setUnreadCount(0);
      } else {
        throw new Error('Не удалось отметить все уведомления как прочитанные');
      }
    } catch (err: any) {
      if (err.message !== 'Пользователь не авторизован') {
        setError(err.message);
        console.error('❌ Ошибка отметки всех уведомлений как прочитанных:', err);
        throw err;
      }
    }
  }, [checkAuth]);

  const deleteNotification = useCallback(async (notificationId: number) => {
    try {
      checkAuth();
      
      const response = await notificationService.deleteNotification(notificationId);
      
      if (response.success) {
        // Удаляем из локального состояния
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
        
        // Обновляем счетчик если уведомление было непрочитанным
        if (deletedNotification?.is_read === 0) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      } else {
        throw new Error('Не удалось удалить уведомление');
      }
    } catch (err: any) {
      if (err.message !== 'Пользователь не авторизован') {
        setError(err.message);
        console.error('❌ Ошибка удаления уведомления:', err);
        throw err;
      }
    }
  }, [checkAuth, notifications]);

  const deleteAllNotifications = useCallback(async () => {
    try {
      checkAuth();
      
      const response = await notificationService.deleteAllNotifications();
      
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        throw new Error('Не удалось удалить все уведомления');
      }
    } catch (err: any) {
      if (err.message !== 'Пользователь не авторизован') {
        setError(err.message);
        console.error('❌ Ошибка удаления всех уведомлений:', err);
        throw err;
      }
    }
  }, [checkAuth]);

  const refresh = useCallback(async () => {
    await Promise.all([
      loadNotifications(),
      loadUnreadCount()
    ]);
  }, [loadNotifications, loadUnreadCount]);

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
    deleteAllNotifications,
    refresh,
  };
};