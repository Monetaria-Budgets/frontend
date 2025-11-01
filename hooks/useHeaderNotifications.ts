// hooks/useHeaderNotifications.ts
import { useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { AppState } from 'react-native';

export const useHeaderNotifications = () => {
  const { loadUnreadCount } = useNotification();

  useEffect(() => {
    let appState = AppState.currentState;
    
    // Интервал для проверки новых уведомлений (только счетчик)
    const interval = setInterval(() => {
      loadUnreadCount();
      console.log('🔄 Проверка новых уведомлений для шапки...');
    }, 10000); // Каждые 10 секунд

    // Слушатель изменения состояния приложения
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 Приложение стало активным - обновляем счетчик');
        loadUnreadCount();
      }
      appState = nextAppState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [loadUnreadCount]);
};