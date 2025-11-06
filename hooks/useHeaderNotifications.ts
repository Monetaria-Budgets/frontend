import { useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { AppState } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export const useHeaderNotifications = () => {
  const { loadUnreadCount } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    // Не запускаем интервал если пользователь не авторизован
    if (!user) return;

    let appState = AppState.currentState;
    
    // Интервал для проверки новых уведомлений (только счетчик)
    const interval = setInterval(() => {
      if (user) {
        loadUnreadCount();
      }
    }, 10000); // Каждые 10 секунд

    // Слушатель изменения состояния приложения
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.match(/inactive|background/) && nextAppState === 'active' && user) {
        console.log('📱 Приложение стало активным - обновляем счетчик');
        loadUnreadCount();
      }
      appState = nextAppState;
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [loadUnreadCount, user]);
};