import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { LineChart } from 'react-native-chart-kit';
import { StatisticsDataPoint } from '@/services/statisticsService';

interface BalanceChartProps {
  data: StatisticsDataPoint[];
  period: string;
  isLoading?: boolean;
}

const BalanceChart: React.FC<BalanceChartProps> = ({ 
  data, 
  period, 
  isLoading = false 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { width: screenWidth } = useWindowDimensions();

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 10000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toLocaleString('ru-RU');
  };

  if (isLoading || data.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Динамика остатка</Text>
        <View style={styles.emptyChart}>
          <Text style={[styles.emptyChartText, { color: colors.icon }]}>
            {isLoading ? 'Загрузка данных...' : 'Нет данных за выбранный период'}
          </Text>
        </View>
      </View>
    );
  }

  const chartWidth = Math.max(screenWidth - 64, 280);
  const chartHeight = 200;

  const chartData = {
    labels: data.map((item, index) => {
      if (data.length <= 7 || index % Math.ceil(data.length / 5) === 0 || index === data.length - 1) {
        const date = new Date(item.date);
        switch (period) {
          case 'week': return date.toLocaleDateString('ru-RU', { weekday: 'narrow' });
          case 'month': return date.getDate().toString();
          case 'quarter': return `Н${Math.ceil(date.getDate() / 7)}`;
          case 'year': return date.toLocaleDateString('ru-RU', { month: 'narrow' });
          default: return date.getDate().toString();
        }
      }
      return '';
    }),
    datasets: [
      {
        data: data.map(item => Math.max(0, item.balance)),
        color: () => colors.tint,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    decimalPlaces: 0,
    color: (opacity = 1) => colorScheme === 'dark'
      ? `rgba(255, 255, 255, ${opacity})`
      : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => colorScheme === 'dark'
      ? `rgba(255, 255, 255, ${opacity})`
      : `rgba(0, 0, 0, ${opacity})`,
    propsForDots: { r: '3', strokeWidth: '1', stroke: colors.tint },
    propsForBackgroundLines: {
      stroke: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    formatYLabel: (value: string) => formatAmount(Number(value)),
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Динамика остатка</Text>
      <View style={styles.chartWrapper}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={chartHeight}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withVerticalLines={false}
          withHorizontalLines={true}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          withShadow={false}
          fromZero={false}
          segments={4}
          yLabelsOffset={10}
          xLabelsOffset={-5}
        />
      </View>
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
  title: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  chartWrapper: { paddingHorizontal: 8, alignItems: 'center' },
  chart: { borderRadius: 12 },
  emptyChart: { height: 140, justifyContent: 'center', alignItems: 'center' },
  emptyChartText: { fontSize: 14, fontWeight: '500', textAlign: 'center', opacity: 0.6 },
});

export default BalanceChart;
