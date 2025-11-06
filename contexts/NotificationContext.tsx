import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  loadNotifications: (limit?: number, offset?: number) => Promise<any>;
  loadUnreadCount: () => Promise<any>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  refresh: () => Promise<void>;
  lastUpdate: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const notificationState = useNotifications();
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Функция обновления с проверкой пользователя
  const refreshWithTimestamp = async () => {
    if (!user) {
      console.log('👤 Пользователь не авторизован - пропускаем обновление уведомлений');
      return;
    }
    await notificationState.refresh();
    setLastUpdate(Date.now());
  };

  // Автоматически загружаем уведомления при смене пользователя
  useEffect(() => {
    if (user) {
      console.log('👤 Пользователь изменился - загружаем уведомления');
      notificationState.loadUnreadCount();
      notificationState.loadNotifications();
      setLastUpdate(Date.now());
    } else {
      console.log('👤 Пользователь вышел - сбрасываем уведомления');
      // Сбрасываем состояние при выходе
      if (notificationState.notifications.length > 0 || notificationState.unreadCount > 0) {
        // Используем внутренние методы для сброса без API запросов
        notificationState.notifications.length = 0;
        notificationState.unreadCount = 0;
        notificationState.error = null;
        setLastUpdate(Date.now());
      }
    }
  }, [user]);

  const contextValue: NotificationContextType = {
    ...notificationState,
    refresh: refreshWithTimestamp,
    lastUpdate,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};