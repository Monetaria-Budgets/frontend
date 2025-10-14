import { API_URL } from "@/config";

export interface CurrencyRate {
  id: number;
  code: string;
  name: string;
  symbol: string;
  nominal: number;
  rate: string;
  change: string;
  changePercentage: string;
  isPopular: boolean;
  lastUpdated: string;
}

class CurrencyService {
  async getRates(showPopular = true): Promise<CurrencyRate[]> {
    try {
      const response = await fetch(
        `${API_URL}/currency/rates?popular=${showPopular}`
      );
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Failed to fetch rates');
    } catch (error) {
      console.error('CurrencyService.getRates error:', error);
      throw error;
    }
  }

  async getRateByCode(currencyCode: string): Promise<CurrencyRate> {
    try {
      const response = await fetch(
        `h${API_URL}/currency/rates/${currencyCode}`
      );
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Failed to fetch rate');
    } catch (error) {
      console.error('CurrencyService.getRateByCode error:', error);
      throw error;
    }
  }

  async refreshRates(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/currency/update-rates`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to refresh rates');
      }
    } catch (error) {
      console.error('CurrencyService.refreshRates error:', error);
      throw error;
    }
  }
}

export const currencyService = new CurrencyService();