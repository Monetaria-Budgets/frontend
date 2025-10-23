// services/premiumService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config';

export interface PremiumStatus {
  isPremium: boolean;
  subscriptionEnd?: string;
  daysRemaining?: number;
}

export const premiumService = {
  /**
   * Проверить премиум статус пользователя
   */
  async checkPremiumStatus(): Promise<PremiumStatus> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.get(
        `${API_URL}/premium/status`,
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
      console.error('❌ Ошибка при проверке премиум статуса:', error);
      
      // Если endpoint не существует, возвращаем false
      if (error.response?.status === 404) {
        return { isPremium: false };
      }
      
      throw new Error(error.response?.data?.error || 'Ошибка при проверке премиум статуса');
    }
  }
};