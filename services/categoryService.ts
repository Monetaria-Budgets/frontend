// services/categoryService.ts
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

export interface CreateCategoryData {
  name: string;
  color: string;
}

export interface UpdateCategoryData {
  name?: string;
  color?: string;
}

export interface CategoryLimit {
  current: number;
  limit: number;
  isPremium: boolean;
}

export const categoryService = {
  /**
   * Получить все категории пользователя
   */
  async getCategories(): Promise<Category[]> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.get(
        `${API_URL}/categories/user`,
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
      console.error('❌ Ошибка при загрузке категорий:', error);
      
      // Если категорий нет - возвращаем пустой массив
      if (error.response?.status === 404) {
        return [];
      }
      
      throw new Error(error.response?.data?.error || 'Ошибка при загрузке категорий');
    }
  },

  /**
   * Создать новую категорию
   */
  async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.post(
        `${API_URL}/categories`,
        categoryData,
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
      console.error('❌ Ошибка при создании категории:', error);
      
      if (error.response?.status === 403) {
        throw new Error('Достигнут лимит категорий. Обновите до премиум для создания большего количества.');
      }
      
      throw new Error(error.response?.data?.error || 'Ошибка при создании категории');
    }
  },

  /**
   * Обновить категорию
   */
  async updateCategory(categoryId: number, updateData: UpdateCategoryData): Promise<Category> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.put(
        `${API_URL}/categories/${categoryId}`,
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
      console.error('❌ Ошибка при обновлении категории:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при обновлении категории');
    }
  },

  /**
   * Удалить категорию
   */
  async deleteCategory(categoryId: number): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      await axios.delete(
        `${API_URL}/categories/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
    } catch (error: any) {
      console.error('❌ Ошибка при удалении категории:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при удалении категории');
    }
  },

  /**
   * Проверить лимит категорий
   */
  async checkCategoryLimit(): Promise<CategoryLimit> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.get(
        `${API_URL}/categories/limit`,
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
      throw new Error(error.response?.data?.error || 'Ошибка при проверке лимита категорий');
    }
  }
};