// services/operationService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config';
import { Category } from './categoryService'; // 🔥 Импортируем отсюда

export interface CreateOperationData {
  amount: number;
  category: string;
  description?: string;
  operation_type_id: number;
  created_at?: string;
}

export interface UpdateOperationData {
  amount?: number;
  category?: string;
  description?: string;
  operation_type_id?: number;
  created_at?: string;
}

export type OperationType = 'income' | 'expense';

export interface Operation {
  id: number;
  user_id: number;
  description: string | null;
  amount: number;
  created_at: string;
  operation: OperationType;
  category: string;
}

// 🔥 УДАЛЕН интерфейс Category - используем из categoryService

export const operationService = {
  async createOperation(operationData: CreateOperationData) {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      console.log('📤 Sending operation data:', operationData);

      // 🔥 Убедимся, что description не undefined
      const dataToSend = {
        ...operationData,
        description: operationData.description || null
      };

      const response = await axios.post(
        `${API_URL}/operations`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // Увеличим таймаут
        }
      );
      
      console.log('✅ Operation created successfully:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('🔴 Error creating operation:', error);
      
      // Более детальный лог ошибки
      if (error.response) {
        console.error('🔴 Response status:', error.response.status);
        console.error('🔴 Response data:', error.response.data);
        console.error('🔴 Response headers:', error.response.headers);
        
        throw new Error(error.response.data.error || `Ошибка сервера: ${error.response.status}`);
      } else if (error.request) {
        console.error('🔴 No response received:', error.request);
        throw new Error('Не удалось подключиться к серверу. Проверьте интернет-соединение.');
      } else {
        console.error('🔴 Request setup error:', error.message);
        throw new Error('Ошибка при настройке запроса: ' + error.message);
      }
    }
  },

  async updateOperation(operationId: number, updateData: UpdateOperationData) {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      console.log('✏️ Updating operation:', operationId, updateData);

      const response = await axios.put(
        `${API_URL}/operations/${operationId}`, // 🔥 Правильный endpoint
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
      console.log('✅ Operation updated successfully:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('🔴 Error updating operation:', error);
      console.error('🔴 Response data:', error.response?.data);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Ошибка при обновлении операции');
      } else if (error.request) {
        throw new Error('Не удалось подключиться к серверу');
      } else {
        throw new Error('Ошибка при обновлении операции');
      }
    }
  },

  async deleteOperation(operationId: number) {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      console.log('🗑️ Deleting operation:', operationId);

      const response = await axios.delete(
        `${API_URL}/operations/${operationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
      console.log('✅ Operation deleted successfully');
      return response.data;
      
    } catch (error: any) {
      console.error('🔴 Error deleting operation:', error);
      console.error('🔴 Response data:', error.response?.data);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Ошибка при удалении операции');
      } else if (error.request) {
        throw new Error('Не удалось подключиться к серверу');
      } else {
        throw new Error('Ошибка при удалении операции');
      }
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        return [];
      }

      const response = await axios.get(`${API_URL}/categories/user`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });

      return response.data as Category[];

    } catch (error: any) {
      console.error('🔴 Error fetching categories:', error);
      return [];
    }
  },

  async createCategoryIfNotExists(name: string): Promise<Category> {
    try {
      const token = await AsyncStorage.getItem('@token');
      if (!token) {
        // 🔥 Возвращаем объект с полями из categoryService
        return { 
          id: Date.now(), 
          name: name,
          color: '#666666',
          type: 'expense',
          user_id: 0,
          created_at: new Date().toISOString()
        };
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
      return { 
        id: Date.now(), 
        name: name,
        color: '#666666',
        type: 'expense',
        user_id: 0,
        created_at: new Date().toISOString()
      };
    }
  },

  async getUserOperations(filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    type?: OperationType;
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

      const operations = response.data as any[];
      return operations.map(op => ({
        ...op,
        operation: this.normalizeOperationType(op.operation),
        amount: parseFloat(op.amount),
      }));

    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || 'Ошибка при получении операций'
      );
    }
  },

  normalizeOperationType(operationType: string): OperationType {
    const lowerType = operationType.toLowerCase();
    if (lowerType === 'income' || lowerType === 'доход' || lowerType === 'приход') {
      return 'income';
    }
    if (lowerType === 'expense' || lowerType === 'расход' || lowerType === 'трата') {
      return 'expense';
    }
    return 'expense';
  },
};