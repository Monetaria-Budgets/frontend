import React, { useEffect } from 'react';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';

export const RealtimeNotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  // Этот хук будет работать только когда NotificationProvider уже доступен
  useRealtimeNotifications();

  return <>{children}</>;
};