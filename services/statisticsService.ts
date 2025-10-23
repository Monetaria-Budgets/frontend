// services/statisticsService.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config';

export interface StatisticsSummary {
  netFlow: number;
  income: number;
  expense: number;
}

export interface StatisticsDataPoint {
  date: string;
  balance: number;
}

export interface CategoryStat {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  type: 'income' | 'expense';
  transactionCount?: number;
}

export interface Transaction {
  id: number;
  amount: number;
  category: string;
  description: string | null;
  created_at: string;
  type: 'income' | 'expense';
}

export interface AdvancedMetrics {
  essentialExpenses: number;
  discretionaryExpenses: number;
  essentialToIncome: number;
  discretionaryToIncome: number;
  netFlowToIncome: number;
  expenseToIncomeRatio: number;
  incomeRegularity: number;
  expenseConsistency: number;
  financialStability: number;
  financialHealthRating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  financialHealthScore: number;
  recommendations: string[];
}

export interface LimitsStatistics {
  totalLimits: number;
  exceededLimits: number;
  nearExceededLimits: number;
  totalLimitAmount: number;
  totalSpent: number;
  totalExceededAmount: number;
  limitsUtilization: number;
  averageLimitUsage: number;
  limits: Array<{
    id: number;
    categoryId: number;
    categoryName: string;
    categoryColor: string;
    limitAmount: number;
    currentSpent: number;
    percentage: number;
    isExceeded: boolean;
    isNearExceeded: boolean;
    exceededAmount: number;
    remainingAmount: number;
  }>;
}

export interface ExtendedStatisticsData extends AdvancedMetrics {
  period: string;
  periodLabel?: string;
  summary: StatisticsSummary;
  dynamics: StatisticsDataPoint[];
  categories: CategoryStat[];
  recentTransactions: Transaction[];
  allTransactions: Transaction[];
  savingsRate: number;
  averageTransaction: number;
  largestTransaction: number;
  transactionCount: number;
  activeDays: number;
  uniqueCategories: number;
  uniqueIncomeCategories: number;
  uniqueExpenseCategories: number;
  limitsStats: LimitsStatistics;
}

export interface LifetimeStatistics {
  lifetime: {
    totalTransactions: number;
    lifetimeIncome: number;
    lifetimeExpense: number;
    netWorth: number;
    firstTransaction: string | null;
    lastTransaction: string | null;
    totalActiveDays: number;
    trackingPeriodDays: number;
    avgDailyTransactions: number;
    savingsRate: number;
  };
  popularCategories: Array<{
    name: string;
    count: number;
    totalAmount: number;
    type: 'income' | 'expense';
  }>;
  topMonths: Array<{
    month: string;
    income: number;
    expense: number;
    netFlow: number;
    transactions: number;
  }>;
}

export interface BasicStatisticsData {
  period: string;
  summary: StatisticsSummary;
  dynamics: StatisticsDataPoint[];
}

export const statisticsService = {
  async getExtendedStatistics(period: 'week' | 'month' | 'quarter' | 'year' | 'custom'): Promise<ExtendedStatisticsData> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      console.log(`📊 Загрузка расширенной статистики за период: ${period}`);

      const response = await axios.get(
        `${API_URL}/statistics/extended?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log(`✅ Расширенная статистика загружена:`, {
        period: response.data.period,
        income: response.data.summary?.income || 0,
        expense: response.data.summary?.expense || 0,
        financialHealth: response.data.financialHealthRating,
        stability: response.data.financialStability,
        limits: response.data.limitsStats?.totalLimits || 0
      });
      
      return this.normalizeExtendedStatistics(response.data);
      
    } catch (error: any) {
      console.error('❌ Ошибка при загрузке расширенной статистики:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Ошибка при загрузке статистики');
      } else if (error.request) {
        throw new Error('Не удалось подключиться к серверу');
      } else {
        throw new Error('Ошибка при загрузке статистики');
      }
    }
  },

  async getCustomPeriodStatistics(startDate: string, endDate: string): Promise<ExtendedStatisticsData> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      console.log(`📊 Загрузка статистики за период: ${startDate} - ${endDate}`);

      const response = await axios.get(
        `${API_URL}/statistics/extended?period=custom&startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      console.log(`✅ Кастомная статистика загружена`);
      
      return this.normalizeExtendedStatistics(response.data);
      
    } catch (error: any) {
      console.error('❌ Ошибка при загрузке кастомной статистики:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при загрузке статистики');
    }
  },

  async getBasicStatistics(period: 'week' | 'month' | 'quarter' | 'year'): Promise<BasicStatisticsData> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.get(
        `${API_URL}/statistics?period=${period}`,
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
      console.error('Error fetching basic statistics:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при загрузке статистики');
    }
  },

  async getLifetimeStatistics(): Promise<LifetimeStatistics> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      console.log('📊 Загрузка пожизненной статистики...');

      const response = await axios.get(
        `${API_URL}/statistics/lifetime`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Пожизненная статистика загружена');
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при загрузке пожизненной статистики:', error);
      
      if (error.response) {
        throw new Error(error.response.data.error || 'Ошибка при загрузке статистики');
      } else if (error.request) {
        throw new Error('Не удалось подключиться к серверу');
      } else {
        throw new Error('Ошибка при загрузке статистики');
      }
    }
  },

  async getLimitsStatistics(period: 'week' | 'month' | 'quarter' | 'year' | 'custom', startDate?: string, endDate?: string): Promise<LimitsStatistics> {
    try {
      const token = await AsyncStorage.getItem('@token');
      
      if (!token) {
        throw new Error('Токен не найден');
      }

      let url = `${API_URL}/statistics/limits?period=${period}`;
      if (period === 'custom' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return response.data;
      
    } catch (error: any) {
      console.error('❌ Ошибка при загрузке статистики по лимитам:', error);
      throw new Error(error.response?.data?.error || 'Ошибка при загрузке статистики по лимитам');
    }
  },

  async getStatistics(period: 'week' | 'month' | 'quarter' | 'year' | 'custom'): Promise<ExtendedStatisticsData> {
    return this.getExtendedStatistics(period);
  },

  normalizeExtendedStatistics(data: any): ExtendedStatisticsData {
    const normalizedData: ExtendedStatisticsData = {
      period: data.period || 'month',
      periodLabel: data.periodLabel,
      summary: {
        netFlow: Number(data.summary?.netFlow) || Number(data.summary?.balance) || 0,
        income: Number(data.summary?.income) || 0,
        expense: Number(data.summary?.expense) || 0,
      },
      dynamics: Array.isArray(data.dynamics) 
        ? data.dynamics.map((point: any) => ({
            date: point.date || '',
            balance: Number(point.balance) || 0
          }))
        : [],
      categories: Array.isArray(data.categories) 
        ? data.categories.map((cat: any, index: number) => ({
            name: cat.name || 'Без категории',
            amount: Number(cat.amount) || 0,
            percentage: Number(cat.percentage) || 0,
            color: cat.color || this.getCategoryColor(index),
            type: (cat.type === 'income' || cat.type === 'expense') ? cat.type : 'expense',
            transactionCount: Number(cat.transactionCount) || 0
          }))
        : [],
      recentTransactions: Array.isArray(data.recentTransactions) 
        ? data.recentTransactions.map((tx: any) => ({
            id: Number(tx.id) || 0,
            amount: Number(tx.amount) || 0,
            category: tx.category || 'Без категории',
            description: tx.description || null,
            created_at: tx.created_at || new Date().toISOString(),
            type: (tx.type === 'income' || tx.type === 'expense') ? tx.type : 'expense'
          }))
        : [],
      allTransactions: Array.isArray(data.allTransactions) 
        ? data.allTransactions.map((tx: any) => ({
            id: Number(tx.id) || 0,
            amount: Number(tx.amount) || 0,
            category: tx.category || 'Без категории',
            description: tx.description || null,
            created_at: tx.created_at || new Date().toISOString(),
            type: (tx.type === 'income' || tx.type === 'expense') ? tx.type : 'expense'
          }))
        : [],
      savingsRate: Math.max(0, Number(data.savingsRate) || 0),
      averageTransaction: Math.max(0, Number(data.averageTransaction) || 0),
      largestTransaction: Math.max(0, Number(data.largestTransaction) || 0),
      transactionCount: Math.max(0, Number(data.transactionCount) || 0),
      activeDays: Math.max(0, Number(data.activeDays) || 0),
      uniqueCategories: Math.max(0, Number(data.uniqueCategories) || 0),
      uniqueIncomeCategories: Math.max(0, Number(data.uniqueIncomeCategories) || 0),
      uniqueExpenseCategories: Math.max(0, Number(data.uniqueExpenseCategories) || 0),
      essentialExpenses: Math.max(0, Number(data.essentialExpenses) || 0),
      discretionaryExpenses: Math.max(0, Number(data.discretionaryExpenses) || 0),
      essentialToIncome: Math.max(0, Number(data.essentialToIncome) || 0),
      discretionaryToIncome: Math.max(0, Number(data.discretionaryToIncome) || 0),
      netFlowToIncome: Number(data.netFlowToIncome) || 0,
      expenseToIncomeRatio: Math.max(0, Number(data.expenseToIncomeRatio) || 0),
      incomeRegularity: Math.max(0, Number(data.incomeRegularity) || 0),
      expenseConsistency: Math.max(0, Number(data.expenseConsistency) || 0),
      financialStability: Math.max(0, Number(data.financialStability) || 0),
      financialHealthRating: data.financialHealthRating || 'fair',
      financialHealthScore: Math.max(1, Math.min(5, Number(data.financialHealthScore) || 3)),
      recommendations: Array.isArray(data.recommendations) ? data.recommendations : [],
      limitsStats: data.limitsStats || this.createEmptyLimitsStatistics()
    };

    console.log('📈 Нормализованные данные с расширенными метриками:', {
      income: normalizedData.summary.income,
      expense: normalizedData.summary.expense,
      financialHealth: normalizedData.financialHealthRating,
      stability: normalizedData.financialStability,
      recommendations: normalizedData.recommendations.length,
      limits: normalizedData.limitsStats.totalLimits,
      exceededLimits: normalizedData.limitsStats.exceededLimits
    });

    return normalizedData;
  },

  getCategoryColor(index: number): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#FFA726', '#66BB6A', '#AB47BC', '#26C6DA', '#FFCA28',
      '#42A5F5', '#7E57C2', '#26A69A', '#D4E157', '#FF7043',
      '#8D6E63', '#78909C', '#EC407A', '#9CCC65', '#FF9800'
    ];
    return colors[index % colors.length];
  },

  getFilteredCategories(statistics: ExtendedStatisticsData, type?: 'income' | 'expense'): CategoryStat[] {
    if (!statistics?.categories) return [];
    
    if (type) {
      return statistics.categories.filter(cat => cat.type === type);
    }
    
    return statistics.categories;
  },

  getHealthRatingColor(rating: string): string {
    switch (rating) {
      case 'excellent': return '#34C759';
      case 'good': return '#FFCC00';
      case 'fair': return '#FF9500';
      case 'poor': return '#FF3B30';
      case 'critical': return '#FF2D55';
      default: return '#8E8E93';
    }
  },

  getHealthRatingIcon(rating: string): string {
    switch (rating) {
      case 'excellent': return 'trending-up';
      case 'good': return 'happy';
      case 'fair': return 'alert-circle';
      case 'poor': return 'sad';
      case 'critical': return 'warning';
      default: return 'help-circle';
    }
  },

  getHealthRatingDescription(rating: string): string {
    switch (rating) {
      case 'excellent': return 'Отличное финансовое здоровье';
      case 'good': return 'Хорошее финансовое здоровье';
      case 'fair': return 'Удовлетворительное финансовое здоровье';
      case 'poor': return 'Слабое финансовое здоровье';
      case 'critical': return 'Критическое финансовое здоровье';
      default: return 'Недостаточно данных';
    }
  },

  getLimitStatusColor(percentage: number, isExceeded: boolean): string {
    if (isExceeded) return '#FF3B30';
    if (percentage >= 80) return '#FF9500';
    if (percentage >= 50) return '#FFCC00';
    return '#34C759';
  },

  getLimitStatusIcon(percentage: number, isExceeded: boolean): string {
    if (isExceeded) return 'warning';
    if (percentage >= 80) return 'alert-circle';
    if (percentage >= 50) return 'information-circle';
    return 'checkmark-circle';
  },

  getLimitStatusText(percentage: number, isExceeded: boolean): string {
    if (isExceeded) return 'Превышен';
    if (percentage >= 80) return 'Почти превышен';
    if (percentage >= 50) return 'Умеренное использование';
    return 'В пределах лимита';
  },

  calculateClientSideMetrics(statistics: ExtendedStatisticsData) {
    const { summary, categories, allTransactions } = statistics;
    
    const topIncomeCategory = categories
      .filter(cat => cat.type === 'income')
      .sort((a, b) => b.amount - a.amount)[0];
    
    const topExpenseCategory = categories
      .filter(cat => cat.type === 'expense')
      .sort((a, b) => b.amount - a.amount)[0];

    const incomeExpenseRatio = summary.income > 0 
      ? (summary.expense / summary.income) * 100 
      : 0;

    return {
      topIncomeCategory: topIncomeCategory || null,
      topExpenseCategory: topExpenseCategory || null,
      incomeExpenseRatio,
      isPositiveBalance: summary.netFlow > 0,
      isSavingsHealthy: statistics.savingsRate >= 20
    };
  },

  formatCurrency(amount: number, compact: boolean = false): string {
    if (compact && amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M ₽`;
    }
    if (compact && amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K ₽`;
    }
    return `${amount.toLocaleString('ru-RU')} ₽`;
  },

  formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`;
  },

  getPeriodDescription(period: string, periodLabel?: string): string {
    if (period === 'custom' && periodLabel) {
      return periodLabel;
    }
    
    const today = new Date();
    
    switch (period) {
      case 'week':
        return 'Эта неделя';
      case 'month':
        const month = today.toLocaleDateString('ru-RU', { month: 'long' });
        return month.charAt(0).toUpperCase() + month.slice(1);
      case 'quarter':
        const quarter = Math.floor((today.getMonth() + 3) / 3);
        return `${quarter} квартал`;
      case 'year':
        return today.getFullYear().toString();
      default:
        return 'Период';
    }
  },

  hasData(statistics: ExtendedStatisticsData | null): boolean {
    if (!statistics) return false;
    
    const hasTransactions = statistics.recentTransactions.length > 0;
    const hasFinancialData = statistics.summary.income > 0 || statistics.summary.expense > 0;
    const hasCategories = statistics.categories.length > 0;
    
    console.log('🔍 Проверка данных:', {
      hasTransactions,
      hasFinancialData,
      hasCategories,
      income: statistics.summary.income,
      expense: statistics.summary.expense
    });
    
    return hasTransactions || hasFinancialData || hasCategories;
  },

  createEmptyLimitsStatistics(): LimitsStatistics {
    return {
      totalLimits: 0,
      exceededLimits: 0,
      nearExceededLimits: 0,
      totalLimitAmount: 0,
      totalSpent: 0,
      totalExceededAmount: 0,
      limitsUtilization: 0,
      averageLimitUsage: 0,
      limits: []
    };
  },

  createEmptyStatistics(period: string = 'month'): ExtendedStatisticsData {
    const emptyStats: ExtendedStatisticsData = {
      period,
      summary: {
        netFlow: 0,
        income: 0,
        expense: 0
      },
      dynamics: [],
      categories: [],
      recentTransactions: [],
      allTransactions: [],
      savingsRate: 0,
      averageTransaction: 0,
      largestTransaction: 0,
      transactionCount: 0,
      activeDays: 0,
      uniqueCategories: 0,
      uniqueIncomeCategories: 0,
      uniqueExpenseCategories: 0,
      essentialExpenses: 0,
      discretionaryExpenses: 0,
      essentialToIncome: 0,
      discretionaryToIncome: 0,
      netFlowToIncome: 0,
      expenseToIncomeRatio: 0,
      incomeRegularity: 0,
      expenseConsistency: 0,
      financialStability: 0,
      financialHealthRating: 'fair',
      financialHealthScore: 3,
      recommendations: ['Начните добавлять транзакции для анализа'],
      limitsStats: this.createEmptyLimitsStatistics()
    };

    console.log('📭 Создана пустая статистика для периода:', period);
    return emptyStats;
  },

  getOperationIcon(type: 'income' | 'expense'): string {
    return type === 'income' ? 'trending-up' : 'trending-down';
  },

  getOperationColor(type: 'income' | 'expense'): string {
    return type === 'income' ? '#34C759' : '#FF3B30';
  },

  groupTransactionsByDate(transactions: Transaction[]) {
    const groups: { [key: string]: Transaction[] } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.created_at).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, transactions]) => ({
        date,
        transactions: transactions.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }));
  }
};

export default statisticsService;