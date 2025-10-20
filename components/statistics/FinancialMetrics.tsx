// components/statistics/FinancialMetrics.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface FinancialMetricsProps {
  statistics: any;
}

interface MetricRating {
  value: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
}

const FinancialMetrics: React.FC<FinancialMetricsProps> = ({ statistics }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Форматирование чисел
  const formatAmount = (amount: number) => {
    if (!amount) return '0 ₽';
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  const formatPercentage = (value: number) => `${(value || 0).toFixed(1)}%`;

  // Расчет всех метрик
  const calculateMetrics = () => {
    const expenseCategories = statistics.categories?.filter((c: any) => c.type === 'expense') || [];
    const incomeCategories = statistics.categories?.filter((c: any) => c.type === 'income') || [];
    const totalExpense = statistics.summary?.expense || 0;
    const totalIncome = statistics.summary?.income || 0;
    const netFlow = statistics.summary?.netFlow || 0;
    const incomeCount = statistics.incomeCount || 0;
    const expenseCount = statistics.expenseCount || 0;
    const transactionCount = statistics.transactionCount || 0;
    const activeDays = statistics.activeDays || 0;
    
    // Основные расчеты
    const averageExpense = expenseCount > 0 ? totalExpense / expenseCount : 0;
    const averageIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;
    const expenseTransactions = statistics.allTransactions?.filter((tx: any) => tx.type === 'expense') || [];
    const incomeTransactions = statistics.allTransactions?.filter((tx: any) => tx.type === 'income') || [];
    const largestExpense = expenseTransactions.length > 0 ? Math.max(...expenseTransactions.map((tx: any) => tx.amount)) : 0;
    const largestIncome = incomeTransactions.length > 0 ? Math.max(...incomeTransactions.map((tx: any) => tx.amount)) : 0;
    const savingsRate = statistics.savingsRate || 0;
    
    // Дополнительные расчеты
    const avgPerDay = activeDays > 0 ? transactionCount / activeDays : 0;
    const avgExpensePerDay = activeDays > 0 ? totalExpense / activeDays : 0;
    const avgIncomePerDay = activeDays > 0 ? totalIncome / activeDays : 0;
    const expenseToIncomeRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
    const netFlowToIncome = totalIncome > 0 ? (netFlow / totalIncome) * 100 : 0;
    
    // Финансовое здоровье
    const essentialExpenses = expenseCategories
      .filter((cat: any) => ['Еда', 'Транспорт', 'Жилье', 'Коммуналка', 'Здоровье'].includes(cat.name))
      .reduce((sum: number, cat: any) => sum + cat.amount, 0);
    
    const discretionaryExpenses = expenseCategories
      .filter((cat: any) => ['Развлечения', 'Рестораны', 'Одежда', 'Хобби'].includes(cat.name))
      .reduce((sum: number, cat: any) => sum + cat.amount, 0);
    
    const essentialToIncome = totalIncome > 0 ? (essentialExpenses / totalIncome) * 100 : 0;
    const discretionaryToIncome = totalIncome > 0 ? (discretionaryExpenses / totalIncome) * 100 : 0;

    return {
      // Основные
      netFlow, totalIncome, totalExpense, savingsRate, expenseToIncomeRatio,
      
      // Расходы
      expenseCount, averageExpense, avgExpensePerDay, largestExpense,
      essentialExpenses, discretionaryExpenses, essentialToIncome, discretionaryToIncome,
      
      // Доходы
      incomeCount, averageIncome, avgIncomePerDay, largestIncome,
      
      // Активность
      transactionCount, activeDays, avgPerDay,
      expenseCategoriesCount: expenseCategories.length,
      incomeCategoriesCount: incomeCategories.length,
      
      // Производные
      netFlowToIncome
    };
  };

  // Оценка метрик
  const rateMetric = (type: string, value: number): MetricRating => {
    const rules: { [key: string]: any } = {
      savingsRate: {
        excellent: { min: 20, message: 'Отличная норма сбережений!' },
        good: { min: 10, message: 'Хорошая норма сбережений' },
        fair: { min: 5, message: 'Норма сбережений ниже рекомендованной' },
        poor: { min: 0, message: 'Рекомендуем увеличить сбережения' }
      },
      expenseToIncomeRatio: {
        excellent: { max: 60, message: 'Отличное соотношение расходов к доходам' },
        good: { max: 75, message: 'Хорошее соотношение' },
        fair: { max: 90, message: 'Высокое соотношение расходов к доходам' },
        poor: { max: 100, message: 'Критическое соотношение' }
      },
      essentialToIncome: {
        excellent: { max: 40, message: 'Низкие обязательные расходы' },
        good: { max: 50, message: 'Нормальные обязательные расходы' },
        fair: { max: 65, message: 'Высокие обязательные расходы' },
        poor: { max: 100, message: 'Очень высокие обязательные расходы' }
      },
      discretionaryToIncome: {
        excellent: { max: 15, message: 'Оптимальные дискреционные расходы' },
        good: { max: 25, message: 'Умеренные дискреционные расходы' },
        fair: { max: 40, message: 'Высокие дискреционные расходы' },
        poor: { max: 100, message: 'Очень высокие дискреционные расходы' }
      },
      avgPerDay: {
        excellent: { max: 5, message: 'Оптимальная активность' },
        good: { max: 10, message: 'Умеренная активность' },
        fair: { max: 15, message: 'Высокая активность' },
        poor: { max: 1000, message: 'Очень высокая активность' }
      },
      netFlowToIncome: {
        excellent: { min: 20, message: 'Отличный денежный поток' },
        good: { min: 10, message: 'Хороший денежный поток' },
        fair: { min: 0, message: 'Слабый денежный поток' },
        poor: { min: -1000, message: 'Отрицательный денежный поток' }
      }
    };

    const rule = rules[type];
    if (!rule) return { value, level: 'fair', message: '' };

    if (value >= (rule.excellent?.min || -1000) && value <= (rule.excellent?.max || 1000)) {
      return { value, level: 'excellent', message: rule.excellent.message };
    } else if (value >= (rule.good?.min || -1000) && value <= (rule.good?.max || 1000)) {
      return { value, level: 'good', message: rule.good.message };
    } else if (value >= (rule.fair?.min || -1000) && value <= (rule.fair?.max || 1000)) {
      return { value, level: 'fair', message: rule.fair.message };
    } else {
      return { value, level: 'poor', message: rule.poor.message };
    }
  };

  const getRatingColor = (level: string) => {
    switch (level) {
      case 'excellent': return '#34C759';
      case 'good': return '#FFCC00';
      case 'fair': return '#FF9500';
      case 'poor': return '#FF3B30';
      default: return colors.icon;
    }
  };

  const getRatingIcon = (level: string) => {
    switch (level) {
      case 'excellent': return 'happy';
      case 'good': return 'thumbs-up';
      case 'fair': return 'alert-circle';
      case 'poor': return 'sad';
      default: return 'help-circle';
    }
  };

  const metrics = calculateMetrics();

  const metricGroups = [
    {
      title: '💰 Финансовое здоровье',
      metrics: [
        { 
          label: 'Норма сбережений', 
          value: metrics.savingsRate, 
          formatted: formatPercentage(metrics.savingsRate),
          rating: rateMetric('savingsRate', metrics.savingsRate)
        },
        { 
          label: 'Соотношение расходов/доходов', 
          value: metrics.expenseToIncomeRatio, 
          formatted: formatPercentage(metrics.expenseToIncomeRatio),
          rating: rateMetric('expenseToIncomeRatio', metrics.expenseToIncomeRatio)
        },
        { 
          label: 'Обязательные расходы к доходу', 
          value: metrics.essentialToIncome, 
          formatted: formatPercentage(metrics.essentialToIncome),
          rating: rateMetric('essentialToIncome', metrics.essentialToIncome)
        },
        { 
          label: 'Дискреционные расходы к доходу', 
          value: metrics.discretionaryToIncome, 
          formatted: formatPercentage(metrics.discretionaryToIncome),
          rating: rateMetric('discretionaryToIncome', metrics.discretionaryToIncome)
        },
        { 
          label: 'Чистый поток к доходу', 
          value: metrics.netFlowToIncome, 
          formatted: formatPercentage(metrics.netFlowToIncome),
          rating: rateMetric('netFlowToIncome', metrics.netFlowToIncome)
        },
      ]
    },
    {
      title: '📉 Анализ расходов',
      metrics: [
        { 
          label: 'Всего расходов', 
          value: metrics.totalExpense, 
          formatted: formatAmount(metrics.totalExpense) 
        },
        { 
          label: 'Обязательные расходы', 
          value: metrics.essentialExpenses, 
          formatted: formatAmount(metrics.essentialExpenses) 
        },
        { 
          label: 'Дискреционные расходы', 
          value: metrics.discretionaryExpenses, 
          formatted: formatAmount(metrics.discretionaryExpenses) 
        },
        { 
          label: 'Средний расход', 
          value: metrics.averageExpense, 
          formatted: formatAmount(metrics.averageExpense) 
        },
        { 
          label: 'Средний расход в день', 
          value: metrics.avgExpensePerDay, 
          formatted: formatAmount(metrics.avgExpensePerDay) 
        },
        { 
          label: 'Крупнейшая трата', 
          value: metrics.largestExpense, 
          formatted: formatAmount(metrics.largestExpense) 
        },
        { 
          label: 'Операций расходов', 
          value: metrics.expenseCount, 
          formatted: metrics.expenseCount.toString() 
        },
      ]
    },
    {
      title: '📈 Анализ доходов',
      metrics: [
        { 
          label: 'Всего доходов', 
          value: metrics.totalIncome, 
          formatted: formatAmount(metrics.totalIncome) 
        },
        { 
          label: 'Средний доход', 
          value: metrics.averageIncome, 
          formatted: formatAmount(metrics.averageIncome) 
        },
        { 
          label: 'Средний доход в день', 
          value: metrics.avgIncomePerDay, 
          formatted: formatAmount(metrics.avgIncomePerDay) 
        },
        { 
          label: 'Крупнейший доход', 
          value: metrics.largestIncome, 
          formatted: formatAmount(metrics.largestIncome) 
        },
        { 
          label: 'Операций доходов', 
          value: metrics.incomeCount, 
          formatted: metrics.incomeCount.toString() 
        },
      ]
    },
    {
      title: '📊 Активность и разнообразие',
      metrics: [
        { 
          label: 'Всего операций', 
          value: metrics.transactionCount, 
          formatted: metrics.transactionCount.toString() 
        },
        { 
          label: 'Активных дней', 
          value: metrics.activeDays, 
          formatted: metrics.activeDays.toString() 
        },
        { 
          label: 'Среднее операций в день', 
          value: metrics.avgPerDay, 
          formatted: metrics.avgPerDay.toFixed(1),
          rating: rateMetric('avgPerDay', metrics.avgPerDay)
        },
        { 
          label: 'Категорий расходов', 
          value: metrics.expenseCategoriesCount, 
          formatted: metrics.expenseCategoriesCount.toString() 
        },
        { 
          label: 'Категорий доходов', 
          value: metrics.incomeCategoriesCount, 
          formatted: metrics.incomeCategoriesCount.toString() 
        },
      ]
    }
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        📊 Финансовые метрики и аналитика
      </Text>
      
      {metricGroups.map(group => (
        <View key={group.title} style={styles.group}>
          <Text style={[styles.groupTitle, { color: colors.text }]}>
            {group.title}
          </Text>
          
          <View style={styles.metricsGrid}>
            {group.metrics
              .filter(m => m.value > 0 || group.title.includes('Активность'))
              .map(metric => (
                <View 
                  key={metric.label} 
                  style={[
                    styles.metricCard, 
                    { 
                      backgroundColor: colors.background,
                      borderColor: metric.rating ? getRatingColor(metric.rating.level) : 'transparent',
                      borderWidth: metric.rating ? 2 : 0
                    }
                  ]}
                >
                  <View style={styles.metricHeader}>
                    <Text 
                      style={[styles.metricValue, { color: colors.text }]} 
                      numberOfLines={1}
                    >
                      {metric.formatted}
                    </Text>
                    
                    {metric.rating && (
                      <Ionicons 
                        name={getRatingIcon(metric.rating.level) as any} 
                        size={16} 
                        color={getRatingColor(metric.rating.level)} 
                      />
                    )}
                  </View>
                  
                  <Text 
                    style={[styles.metricLabel, { color: colors.icon }]} 
                    numberOfLines={2}
                  >
                    {metric.label}
                  </Text>
                  
                  {metric.rating && metric.rating.message && (
                    <Text 
                      style={[
                        styles.metricRating, 
                        { color: getRatingColor(metric.rating.level) }
                      ]}
                      numberOfLines={2}
                    >
                      {metric.rating.message}
                    </Text>
                  )}
                </View>
              ))}
          </View>
        </View>
      ))}
      
      {/* Общая оценка финансового здоровья */}
      {metrics.totalIncome > 0 && (
        <View style={[styles.healthScore, { backgroundColor: colors.background }]}>
          <Text style={[styles.healthTitle, { color: colors.text }]}>
            💡 Рекомендации
          </Text>
          <View style={styles.recommendations}>
            {rateMetric('savingsRate', metrics.savingsRate).level === 'poor' && (
              <Text style={[styles.recommendation, { color: colors.text }]}>
                • Старайтесь сберегать минимум 10% от доходов
              </Text>
            )}
            {rateMetric('essentialToIncome', metrics.essentialToIncome).level === 'poor' && (
              <Text style={[styles.recommendation, { color: colors.text }]}>
                • Снизьте обязательные расходы до 50% от доходов
              </Text>
            )}
            {rateMetric('discretionaryToIncome', metrics.discretionaryToIncome).level === 'poor' && (
              <Text style={[styles.recommendation, { color: colors.text }]}>
                • Контролируйте дискреционные расходы
              </Text>
            )}
            {metrics.netFlow < 0 && (
              <Text style={[styles.recommendation, { color: colors.text }]}>
                • Срочно сократите расходы - отрицательный баланс
              </Text>
            )}
            {metrics.savingsRate >= 15 && metrics.netFlow > 0 && (
              <Text style={[styles.recommendation, { color: colors.text }]}>
                • Отличные результаты! Продолжайте в том же духе
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { 
    fontSize: 20, 
    fontWeight: '800', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  group: { 
    marginBottom: 24 
  },
  groupTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 12 
  },
  metricsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    gap: 12 
  },
  metricCard: {
    flexBasis: '48%',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  metricValue: { 
    fontSize: 16, 
    fontWeight: '700', 
    flex: 1 
  },
  metricLabel: { 
    fontSize: 12, 
    opacity: 0.7,
    marginBottom: 4 
  },
  metricRating: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  healthScore: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  recommendations: {
    gap: 4,
  },
  recommendation: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default FinancialMetrics;