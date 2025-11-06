import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useNotification } from '@/contexts/NotificationContext';
import { notificationService } from '@/services/notificationService';
import { LoadingState } from '@/components/notifications/LoadingState';
import { ErrorState } from '@/components/notifications/ErrorState';
import { ModalHeader } from '@/components/notifications/ModalHeader';
import { MessageCard } from '@/components/notifications/MessageCard';
import { InfoPanel } from '@/components/notifications/InfoPanel';
import { ActionButtons } from '@/components/notifications/ActionButtons';

// Компоненты


export default function NotificationDetailModal() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { markAsRead } = useNotification();

  const [notification, setNotification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadNotificationDetail();
    }
  }, [id]);

  const loadNotificationDetail = async () => {
    try {
      setLoading(true);
      const allNotifications = await notificationService.getNotifications(100, 0);
      const notificationId = parseInt(id as string);
      const foundNotification = allNotifications.data.find((n: any) => n.id === notificationId);
      
      if (foundNotification) {
        setNotification(foundNotification);
        
        // Помечаем как прочитанное если еще не прочитано
        if (foundNotification.is_read === 0) {
          await markAsRead(foundNotification.id);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомления:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return <LoadingState colors={colors} />;
  }

  if (!notification) {
    return <ErrorState colors={colors} onClose={handleClose} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModalHeader
        notification={notification}
        onClose={handleClose}
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <MessageCard notification={notification} colors={colors} />
        <InfoPanel notification={notification} colors={colors} />
        <ActionButtons 
          notification={notification} 
          colors={colors}
          onClose={handleClose}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 16,
  },
});