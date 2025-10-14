// services/operationService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config';

export interface CreateOperationData {
  amount: number;
  category: string;
  description?: string;
  operation_type_id: number;
  created_at?: string;
}

export interface Operation {
  id: number;
  user_id: number;
  description: string | null;
  amount: number;
  created_at: string;
  operation: string;
  category: string;
}

export interface Category {
  id: number;
  name: string;
}

export const operationService = {
  async createOperation(operationData: CreateOperationData) {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      console.log('📤 Sending operation data:', operationData);

      const response = await axios.post(
        `${API_URL}/operations`,
        operationData, // 🔥 Отправляем как есть
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
      console.log('✅ Operation created successfully:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('🔴 Error creating operation:', error);
      console.error('🔴 Response data:', error.response?.data);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Ошибка при создании операции');
      } else if (error.request) {
        throw new Error('Не удалось подключиться к серверу');
      } else {
        throw new Error('Ошибка при создании операции');
      }
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        return this.getDefaultCategories();
      }

      const response = await axios.get(`${API_URL}/categories/user`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      const defaultCategories = this.getDefaultCategories();
      const userCategories = response.data as Category[];
      
      const allCategories = [...defaultCategories, ...userCategories];
      const uniqueCategories = allCategories.filter((category, index, self) =>
        index === self.findIndex((c) => c.name.toLowerCase() === category.name.toLowerCase())
      );

      return uniqueCategories;
    } catch (error: any) {
      console.error('🔴 Error fetching categories:', error);
      return this.getDefaultCategories();
    }
  },

  async createCategoryIfNotExists(name: string): Promise<Category> {
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        return { id: Date.now(), name };
      }

      const existingCategories = await this.getCategories();
      const existing = existingCategories.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existing) {
        return existing;
      }

      const response = await axios.post(
        `${API_URL}/categories/user`,
        { name },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000 
        }
      );
      
      return response.data as Category;
    } catch (error: any) {
      return { id: Date.now(), name };
    }
  },

  getDefaultCategories(): Category[] {
    return [
      { id: 1, name: 'Еда' },
      { id: 2, name: 'Транспорт' },
      { id: 3, name: 'Жилье' },
      { id: 4, name: 'Магазины' },
      { id: 5, name: 'Здоровье' },
      { id: 6, name: 'Развлечения' },
      { id: 7, name: 'Одежда' },
      { id: 8, name: 'Техника' },
      { id: 9, name: 'Путешествия' },
      { id: 10, name: 'Образование' },
      { id: 11, name: 'Коммуналка' },
      { id: 12, name: 'Подписки' },
    ];
  },

  async getUserOperations(filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: 'income' | 'expense';
  }): Promise<Operation[]> {
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) throw new Error('Токен не найден');

      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.type) params.append('type', filters.type);

      const queryString = params.toString();
      const url = `${API_URL}/operations/user${queryString ? `?${queryString}` : ''}`;

      const response = await axios.get(url, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000,
      });

      return response.data as Operation[];

    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Ошибка при получении операций'
      );
    }
  },
};