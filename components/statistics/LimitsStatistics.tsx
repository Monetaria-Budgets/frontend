// components/statistics/LimitsStatistics.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LimitsStatistics as LimitsStatisticsType } from '@/services/statisticsService';

interface LimitsStatisticsProps {
  limitsStats: LimitsStatisticsType;
}

const LimitsStatisticsComponent: React.FC<LimitsStatisticsProps> = ({ limitsStats }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const getLimitStatusColor = (percentage: number, isExceeded: boolean) => {
    if (isExceeded) return '#FF3B30';
    if (percentage >= 80) return '#FF9500';
    if (percentage >= 50) return '#FFCC00';
    return '#34C759';
  };

  const getLimitStatusIcon = (percentage: number, isExceeded: boolean) => {
    if (isExceeded) return 'warning';
    if (percentage >= 80) return 'alert-circle';
    if (percentage >= 50) return 'information-circle';
    return 'checkmark-circle';
  };

  if (limitsStats.totalLimits === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          📊 Лимиты расходов
        </Text>
        <View style={styles.emptyState}>
          <Ionicons name="speedometer" size={48} color={colors.icon} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Лимиты не установлены
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.icon }]}>
            Установите лимиты для контроля расходов по категориям
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        📊 Лимиты расходов
      </Text>

      {/* Общая статистика */}
      <View style={styles.overview}>
        <View style={styles.overviewItem}>
          <Text style={[styles.overviewValue, { color: colors.text }]}>
            {limitsStats.totalLimits}
          </Text>
          <Text style={[styles.overviewLabel, { color: colors.icon }]} numberOfLines={2}>
            Всего лимитов
          </Text>
        </View>
        
        <View style={styles.overviewItem}>
          <Text style={[styles.overviewValue, {color: limitsStats.exceededLimits === 0 ? '#34C759' : '#FF3B30'}]}>
            {limitsStats.exceededLimits}
          </Text>
          <Text style={[styles.overviewLabel, { color: colors.icon }]} numberOfLines={2}>
            Превышено
          </Text>
        </View>
        
        <View style={styles.overviewItem}>
          <Text style={[styles.overviewValue, {color: limitsStats.nearExceededLimits === 0 ? '#34C759' : '#FF9500'}]}>
            {limitsStats.nearExceededLimits}
          </Text>
          <Text style={[styles.overviewLabel, { color: colors.icon }]} numberOfLines={2}>
            Почти превышено
          </Text>
        </View>
        
        <View style={styles.overviewItem}>
          <Text style={[styles.overviewValue, { color: colors.text }]}>
            {formatPercentage(limitsStats.averageLimitUsage)}
          </Text>
          <Text style={[styles.overviewLabel, { color: colors.icon }]} numberOfLines={2}>
            Среднее использование
          </Text>
        </View>
      </View>

      {/* Прогресс общих лимитов */}
      <View style={styles.totalProgress}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.text }]} numberOfLines={1}>
            Общее использование лимитов
          </Text>
          <Text style={[styles.progressPercentage, { color: colors.text }]}>
            {formatPercentage(limitsStats.limitsUtilization)}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.background + '80' }]}>
          <View 
            style={[
              styles.progressFill,
              { 
                backgroundColor: getLimitStatusColor(limitsStats.limitsUtilization, limitsStats.exceededLimits > 0),
                width: `${Math.min(100, limitsStats.limitsUtilization)}%`
              }
            ]} 
          />
        </View>
        <View style={styles.progressStats}>
          <Text style={[styles.progressStat, { color: colors.icon }]} numberOfLines={1}>
            Потрачено: {formatAmount(limitsStats.totalSpent)}
          </Text>
          <Text style={[styles.progressStat, { color: colors.icon }]} numberOfLines={1}>
            Лимит: {formatAmount(limitsStats.totalLimitAmount)}
          </Text>
          {limitsStats.totalExceededAmount > 0 && (
            <Text style={[styles.progressStat, { color: '#FF3B30' }]} numberOfLines={1}>
              Превышение: {formatAmount(limitsStats.totalExceededAmount)}
            </Text>
          )}
        </View>
      </View>

      {/* Детали по каждому лимиту */}
      <View style={styles.limitsList}>
        {limitsStats.limits.map((limit, index) => (
          <View 
            key={limit.id}
            style={[
              styles.limitItem,
              { backgroundColor: colors.background },
              index === 0 && styles.firstLimitItem,
              index === limitsStats.limits.length - 1 && styles.lastLimitItem
            ]}
          >
            <View style={styles.limitHeader}>
              <View style={styles.categoryInfo}>
                <View 
                  style={[
                    styles.categoryColor,
                    { backgroundColor: limit.categoryColor }
                  ]}
                />
                <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={1}>
                  {limit.categoryName}
                </Text>
              </View>
              
              <View style={styles.limitStatus}>
                <Ionicons 
                  name={getLimitStatusIcon(limit.percentage, limit.isExceeded) as any}
                  size={16}
                  color={getLimitStatusColor(limit.percentage, limit.isExceeded)}
                />
                <Text 
                  style={[
                    styles.statusText,
                    { color: getLimitStatusColor(limit.percentage, limit.isExceeded) }
                  ]}
                  numberOfLines={1}
                >
                  {formatPercentage(limit.percentage)}
                </Text>
              </View>
            </View>

            <View style={styles.limitProgress}>
              <View style={[styles.progressBar, { backgroundColor: colors.background + '80' }]}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      backgroundColor: getLimitStatusColor(limit.percentage, limit.isExceeded),
                      width: `${Math.min(100, limit.percentage)}%`
                    }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.limitDetails}>
              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: colors.icon }]} numberOfLines={1}>
                  Потрачено:
                </Text>
                <Text style={[styles.amountValue, { color: colors.text }]} numberOfLines={1}>
                  {formatAmount(limit.currentSpent)}
                </Text>
              </View>
              
              <View style={styles.amountRow}>
                <Text style={[styles.amountLabel, { color: colors.icon }]} numberOfLines={1}>
                  Лимит:
                </Text>
                <Text style={[styles.amountValue, { color: colors.text }]} numberOfLines={1}>
                  {formatAmount(limit.limitAmount)}
                </Text>
              </View>

              {limit.isExceeded ? (
                <View style={styles.amountRow}>
                  <Text style={[styles.amountLabel, { color: '#FF3B30' }]} numberOfLines={1}>
                    Превышение:
                  </Text>
                  <Text style={[styles.amountValue, { color: '#FF3B30' }]} numberOfLines={1}>
                    {formatAmount(limit.exceededAmount)}
                  </Text>
                </View>
              ) : (
                <View style={styles.amountRow}>
                  <Text style={[styles.amountLabel, { color: colors.icon }]} numberOfLines={1}>
                    Осталось:
                  </Text>
                  <Text style={[styles.amountValue, { color: colors.text }]} numberOfLines={1}>
                    {formatAmount(limit.remainingAmount)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
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
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.6,
  },
  overview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  overviewItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: '25%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  overviewValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  overviewLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
  },
  totalProgress: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 0,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  progressStat: {
    fontSize: 12,
    opacity: 0.7,
    flexShrink: 1,
    marginRight: 8,
    marginBottom: 4,
  },
  limitsList: {
    // Убрал maxHeight и скролл
  },
  limitItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  firstLimitItem: {
    marginTop: 0,
  },
  lastLimitItem: {
    marginBottom: 0,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  categoryColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
    flexShrink: 0,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  limitStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 0,
  },
  limitProgress: {
    marginBottom: 12,
  },
  limitDetails: {
    gap: 6,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 13,
    opacity: 0.7,
    flexShrink: 1,
    marginRight: 8,
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 0,
    textAlign: 'right',
  },
});

export default LimitsStatisticsComponent;