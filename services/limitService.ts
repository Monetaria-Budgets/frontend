// services/limitService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config';

export interface Category {
  id: number;
  name: string;
  color: string;
  type: 'expense';
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface SpendingLimit {
  id: number;
  category_id: number;
  amount: number;
  created_at: string;
  user_id: number;
}

export interface CreateLimitData {
  category_id: number;
  amount: number;
}

export interface UpdateLimitData {
  amount?: number;
}

export interface LimitInfo {
  current: number;
  limit: number;
  isPremium: boolean;
}

export interface CategoryWithLimit {
  id: number;
  name: string;
  color: string;
  type: 'expense';
  user_id: number;
  created_at: string;
  spending_limit?: SpendingLimit;
  current_spent?: number;
  is_exceeded?: boolean;
}

export const limitService = {
  /**
   * Получить все лимиты пользователя
   */
  async getLimits(): Promise<SpendingLimit[]> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.log('🔐 Пользователь не авторизован, возвращаем пустой массив лимитов');
        return [];
      }

      const response = await axios.get(
        `${API_URL}/spending-limits`,
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
      console.error('❌ Ошибка при загрузке лимитов:', error);
      
      if (error.response?.status === 404 || error.response?.status === 401) {
        console.log('🔐 Неавторизованный доступ или лимиты не найдены');
        return [];
      }
      
      return [];
    }
  },

  /**
   * Получить категории с лимитами
   */
  async getCategoriesWithLimits(): Promise<CategoryWithLimit[]> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.log('🔐 Пользователь не авторизован, возвращаем пустой массив категорий с лимитами');
        return [];
      }

      const response = await axios.get(
        `${API_URL}/spending-limits/categories`,
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
      console.error('❌ Ошибка при загрузке категорий с лимитами:', error);
      
      if (error.response?.status === 401) {
        console.log('🔐 Неавторизованный доступ к категориям с лимитами');
        return [];
      }
      
      throw new Error(error.response?.data?.error || 'Ошибка при загрузке категорий с лимитами');
    }
  },

  /**
   * Создать лимит
   */
  async createLimit(limitData: CreateLimitData): Promise<SpendingLimit> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Пользователь не авторизован');
      }

      const response = await axios.post(
        `${API_URL}/spending-limits`,
        limitData,
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
      console.error('❌ Ошибка при создании лимита:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Достигнут лимит на установку лимитов. Обновите до премиум для создания большего количества.');
      }
      
      throw new Error(error.response?.data?.error || 'Ошибка при создании лимита');
    }
  },

  /**
   * Обновить лимит
   */
  async updateLimit(limitId: number, updateData: UpdateLimitData): Promise<SpendingLimit> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Пользователь не авторизован');
      }

      const response = await axios.put(
        `${API_URL}/spending-limits/${limitId}`,
        updateData,
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
      console.error('❌ Ошибка при обновлении лимита:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при обновлении лимита');
    }
  },

  /**
   * Удалить лимит
   */
  async deleteLimit(limitId: number): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Пользователь не авторизован');
      }

      await axios.delete(
        `${API_URL}/spending-limits/${limitId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
    } catch (error: any) {
      console.error('❌ Ошибка при удалении лимита:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при удалении лимита');
    }
  },

  /**
   * Проверить лимит на создание лимитов
   */
  async checkLimitLimit(): Promise<LimitInfo | null> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.log('🔐 Пользователь не авторизован, невозможно проверить лимит лимитов');
        return null;
      }

      const response = await axios.get(
        `${API_URL}/spending-limits/limit`,
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
      console.error('❌ Ошибка при проверке лимита:', error);
      
      if (error.response?.status === 401) {
        console.log('🔐 Неавторизованный доступ к проверке лимита');
        return null;
      }
      
      return null;
    }
  }
};