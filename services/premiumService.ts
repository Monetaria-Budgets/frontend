import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config';

export interface PremiumStatus {
  hasActivePremium: boolean;
  hadPremiumBefore: boolean;
  subscriptionEnd?: string;
  daysRemaining?: number;
}

export interface PremiumActivationResult {
  message: string;
  isFirstSubscription: boolean;
  subscriptionEnd: string;
}

export const premiumService = {
  /**
   * Проверить премиум статус пользователя
   */
  async checkPremiumStatus(): Promise<PremiumStatus> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.log('Токен не найден, возвращаем статус по умолчанию');
        return { 
          hasActivePremium: false, 
          hadPremiumBefore: false 
        };
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

      console.log('✅ Премиум статус получен:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при проверке премиум статуса:', error);
      
      // Для любых ошибок возвращаем статус по умолчанию
      return { 
        hasActivePremium: false, 
        hadPremiumBefore: false 
      };
    }
  },

  /**
   * Активировать премиум подписку
   */
  async activatePremium(): Promise<PremiumActivationResult> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.post(
        `${API_URL}/premium/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Премиум активирован:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при активации премиум подписки:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при активации премиум подписки');
    }
  }
};