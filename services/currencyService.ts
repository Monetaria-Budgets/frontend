import { API_URL } from "@/config";
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CurrencyRate {
  id: number;
  code: string;
  name: string;
  symbol: string;
  nominal: number;
  rate: string;
  previousRate: string;
  change: string;
  changePercentage: string;
  isPopular: boolean;
  lastUpdated: string;
}

// Типы для ответов API
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface RatesResponse extends ApiResponse<CurrencyRate[]> {}
interface RateResponse extends ApiResponse<CurrencyRate> {}
interface RefreshResponse extends ApiResponse<null> {}

class CurrencyService {
  private readonly CACHE_KEY = '@currency_rates_cache';
  private readonly CACHE_DURATION = 1000 * 60 * 30; // 30 минут
  private isRefreshing = false;

  async getRates(showPopular = true): Promise<CurrencyRate[]> {
    try {
      // Проверяем кэш сначала
      const cached = await this.getCachedRates();
      if (cached) {
        console.log('💰 Using cached currency rates');
        return cached;
      }

      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.log('🔐 User not authenticated, returning default rates');
        return this.getDefaultRates();
      }

      console.log('🔄 Fetching currency rates from API...');

      // Простая реализация таймаута без AbortSignal
      const fetchPromise = fetch(
        `${API_URL}/currency/rates?popular=${showPopular}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Таймаут с помощью Promise.race
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as RatesResponse;
      
      if (result.success) {
        await this.cacheRates(result.data);
        console.log('✅ Currency rates fetched successfully');
        return result.data;
      }
      
      throw new Error(result.message || 'Failed to fetch rates');
      
    } catch (error: any) {
      console.error('💥 CurrencyService.getRates error:', error);
      
      // Пробуем вернуть кэшированные данные
      const cached = await this.getCachedRates(true);
      if (cached) {
        console.log('💰 Using expired cache as fallback');
        return cached;
      }
      
      console.log('💰 Returning default rates');
      return this.getDefaultRates();
    }
  }

  async getRateByCode(currencyCode: string): Promise<CurrencyRate> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.log('🔐 User not authenticated');
        throw new Error('User not authenticated');
      }

      const fetchPromise = fetch(
        `${API_URL}/currency/rates/${currencyCode}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as RateResponse;
      
      if (result.success) {
        return result.data;
      }
      
      throw new Error(result.message || 'Failed to fetch rate');
      
    } catch (error: any) {
      console.error('💥 CurrencyService.getRateByCode error:', error);
      
      const cached = await this.getCachedRates(true);
      if (cached) {
        const cachedRate = cached.find(rate => rate.code === currencyCode);
        if (cachedRate) {
          console.log('💰 Using cached rate for:', currencyCode);
          return cachedRate;
        }
      }
      
      throw error;
    }
  }

  async refreshRates(): Promise<void> {
    // Защита от множественных одновременных обновлений
    if (this.isRefreshing) {
      console.log('🔄 Refresh already in progress');
      return;
    }

    try {
      this.isRefreshing = true;
      
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        console.log('🔐 User not authenticated, cannot refresh rates');
        throw new Error('User not authenticated');
      }

      const fetchPromise = fetch(`${API_URL}/currency/update-rates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 15000);
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as RefreshResponse;
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to refresh rates');
      }

      // Очищаем кэш после успешного обновления
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('✅ Currency rates refreshed successfully');
      
    } catch (error: any) {
      console.error('💥 CurrencyService.refreshRates error:', error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Кэширование курсов валют
   */
  private async cacheRates(rates: CurrencyRate[]): Promise<void> {
    try {
      const cacheData = {
        rates,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching rates:', error);
    }
  }

  /**
   * Получение кэшированных курсов
   */
  private async getCachedRates(ignoreExpiration: boolean = false): Promise<CurrencyRate[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached) as { rates: CurrencyRate[], timestamp: number };
      
      if (!ignoreExpiration && Date.now() - cacheData.timestamp > this.CACHE_DURATION) {
        return null;
      }

      return cacheData.rates;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  /**
   * Дефолтные курсы на случай ошибок
   */
  private getDefaultRates(): CurrencyRate[] {
    const defaultRates: CurrencyRate[] = [
      {
        id: 1,
        code: 'USD',
        name: 'Доллар США',
        symbol: '$',
        nominal: 1,
        rate: '1.0',
        previousRate: '1.0',
        change: '0',
        changePercentage: '0%',
        isPopular: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 2,
        code: 'EUR',
        name: 'Евро',
        symbol: '€',
        nominal: 1,
        rate: '0.92',
        previousRate: '0.92',
        change: '0',
        changePercentage: '0%',
        isPopular: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 3,
        code: 'RUB',
        name: 'Российский рубль',
        symbol: '₽',
        nominal: 1,
        rate: '90.0',
        previousRate: '90.0',
        change: '0',
        changePercentage: '0%',
        isPopular: true,
        lastUpdated: new Date().toISOString(),
      },
    ];

    return defaultRates;
  }

  /**
   * Очистка кэша (для тестирования или при логауте)
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CACHE_KEY);
      console.log('🗑️ Currency cache cleared');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const currencyService = new CurrencyService();