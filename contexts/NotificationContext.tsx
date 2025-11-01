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
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const notificationState = useNotifications();

  // Автоматически загружаем уведомления при смене пользователя
  useEffect(() => {
    if (user) {
      console.log('👤 Пользователь изменился - загружаем уведомления');
      notificationState.loadUnreadCount();
      notificationState.loadNotifications();
    } else {
      console.log('👤 Пользователь вышел - сбрасываем уведомления');
      // Сбрасываем состояние при выходе
      if (notificationState.notifications.length > 0) {
        notificationState.loadNotifications(0, 0);
      }
      if (notificationState.unreadCount > 0) {
        notificationState.loadUnreadCount();
      }
    }
  }, [user]);

  // Добавляем refresh функцию
  const refresh = async () => {
    try {
      await notificationState.loadUnreadCount();
      await notificationState.loadNotifications();
      console.log('✅ Уведомления обновлены через контекст');
    } catch (err) {
      console.error('❌ Ошибка обновления уведомлений в контексте:', err);
    }
  };

  const contextValue: NotificationContextType = {
    ...notificationState,
    refresh,
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