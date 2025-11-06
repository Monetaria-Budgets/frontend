import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config';

export interface Notification {
  id: number;
  user_id: number;
  type_id: number;
  type_name: string;
  message: string;
  source: 'email' | 'push';
  is_read: number;
  created_at: string;
  scheduled_at?: string;
}

export interface NotificationType {
  id: number;
  name: string;
  send_email: boolean;
  send_push: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface UnreadResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
}

export interface UnreadCountResponse {
  success: boolean;
  unreadCount: number;
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export const notificationService = {
  /**
   * Получить все уведомления пользователя
   */
  async getNotifications(limit: number = 50, offset: number = 0): Promise<NotificationsResponse> {
     try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.log('🔔 Токен не найден - пользователь не авторизован');
        return {
          success: true,
          data: [],
          pagination: {
            total: 0,
            limit,
            offset
          }
        };
      }

      console.log('🔔 Frontend: Getting notifications...');
      
      const response = await axios.get(
        `${API_URL}/notifications`,
        {
          params: { 
            limit: limit.toString(), 
            offset: offset.toString() 
          },
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('🔔 Frontend: Notifications response:', response.data);
      return response.data;
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('🔔 Пользователь не авторизован - возвращаем пустой список');
        return {
          success: true,
          data: [],
          pagination: {
            total: 0,
            limit,
            offset
          }
        };
      }
      console.error('❌ Frontend: Ошибка при загрузке уведомлений:', error);
      console.error('❌ Frontend: Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.error || 'Ошибка при загрузке уведомлений');
    }
  },

  /**
   * Получить непрочитанные уведомления
   */
  async getUnreadNotifications(): Promise<UnreadResponse> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.get(
        `${API_URL}/notifications/unread`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при загрузке непрочитанных уведомлений:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при загрузке непрочитанных уведомлений');
    }
  },

  /**
   * Удалить все уведомления пользователя
   */
  async deleteAllNotifications(): Promise<DeleteResponse> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.delete(
        `${API_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при удалении всех уведомлений:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при удалении всех уведомлений');
    }
  },

  /**
   * Получить количество непрочитанных уведомлений
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.get(
        `${API_URL}/notifications/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при получении количества непрочитанных:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при получении количества непрочитанных');
    }
  },

  /**
   * Пометить уведомление как прочитанное
   */
  async markAsRead(notificationId: number): Promise<MarkReadResponse> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.patch(
        `${API_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при отметке уведомления как прочитанного:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при отметке уведомления как прочитанного');
    }
  },

  /**
   * Пометить все уведомления как прочитанные
   */
  async markAllAsRead(): Promise<MarkReadResponse> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.patch(
        `${API_URL}/notifications/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при отметке всех уведомлений как прочитанных:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при отметке всех уведомлений как прочитанных');
    }
  },

  /**
   * Удалить уведомление
   */
  async deleteNotification(notificationId: number): Promise<DeleteResponse> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.delete(
        `${API_URL}/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при удалении уведомления:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при удалении уведомления');
    }
  },

  /**
   * Отправить тестовое уведомление
   */
  async sendTestNotification(message: string, type: string = 'system_update'): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.post(
        `${API_URL}/notifications/test`,
        { message, type },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при отправке тестового уведомления:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при отправке тестового уведомления');
    }
  },

  /**
   * Получить будущие уведомления
   */
  async getFutureNotifications(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.get(
        `${API_URL}/notifications/future`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при получении будущих уведомлений:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при получении будущих уведомлений');
    }
  },

  // Активировать запланированные уведомления
  async activateScheduledNotifications(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.post(
        `${API_URL}/notifications/activate-scheduled`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при активации запланированных уведомлений:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при активации уведомлений');
    }
  }
};