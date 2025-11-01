// components/home/CategoriesChart.tsx - ПОЛНАЯ ВЕРСИЯ
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import PieChart from "react-native-pie-chart";
import Ionicons from '@expo/vector-icons/Ionicons';

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

interface CategoriesChartProps {
  categories: CategoryData[];
  hasExpenses?: boolean;
}

const CategoriesChart: React.FC<CategoriesChartProps> = ({ categories, hasExpenses = true }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  // Если нет расходов - показываем сообщение
  if (!hasExpenses || categories.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Расходы по категориям
          </Text>
          <Pressable 
            onPress={() => router.push("/(tabs)/statistics")}
            style={({ pressed }) => [
              styles.moreButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Text style={[styles.moreText, { color: colors.tint }]}>
              Все
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.tint} />
          </Pressable>
        </View>

        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.icon + '20' }]}>
            <Ionicons name="pie-chart-outline" size={32} color={colors.icon} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Расходов в этом месяце пока нет
          </Text>
          <Text style={[styles.emptyText, { color: colors.icon }]}>
            Когда вы добавите расходы, здесь появится статистика
          </Text>
        </View>
      </View>
    );
  }

  const slices = categories.map(c => ({
    value: c.amount,
    color: c.color,
  }));

  const totalAmount = categories.reduce((sum, cat) => sum + cat.amount, 0);

  // Функция для правильного склонения слова "категория"
  const getCategoryWord = (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return 'категория';
    if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return 'категории';
    return 'категорий';
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Расходы по категориям
        </Text>
        <Pressable 
          onPress={() => router.push("/(tabs)/statistics")}
          style={({ pressed }) => [
            styles.moreButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Text style={[styles.moreText, { color: colors.tint }]}>
            Все
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.tint} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Диаграмма занимает всю ширину сверху */}
        <View style={styles.chartContainer}>
          <View style={styles.pieWrapper}>
            <PieChart
              widthAndHeight={140}
              series={slices}
              cover={{ radius: 0.8, color: 'transparent' }}
            />
            <View style={[styles.centerCircle, { backgroundColor: colors.background }]}>
              <View style={styles.centerContent}>
                <Text style={[styles.totalAmount, { color: colors.tint }]}>
                  {totalAmount.toLocaleString("ru-RU")} ₽
                </Text>
                <Text style={[styles.categoriesInfo, { color: colors.icon }]}>
                  {categories.length} {getCategoryWord(categories.length)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Список категорий под диаграммой */}
        <View style={[styles.categoriesList, { borderRadius: 12, overflow: 'hidden' }]}>
          {categories.map((cat, index) => {
            const isFirst = index === 0;
            const isLast = index === categories.length - 1;
            
            return (
              <View 
                key={cat.name} 
                style={[
                  styles.categoryItem,
                  { 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  isFirst && styles.firstCategoryItem,
                  isLast && styles.lastCategoryItem,
                ]}
              >
                <View style={styles.categoryContent}>
                  <View style={styles.categoryLeft}>
                    <View 
                      style={[
                        styles.colorDot, 
                        { backgroundColor: cat.color }
                      ]} 
                    />
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {cat.name}
                    </Text>
                  </View>
                  
                  <View style={styles.categoryRight}>
                    <Text style={[styles.categoryAmount, { color: colors.text }]}>
                      {cat.amount.toLocaleString("ru-RU")} ₽
                    </Text>
                    <View style={[
                      styles.percentageBadge,
                      { backgroundColor: colorScheme === 'dark' ? '#374151' : '#F3F4F6' }
                    ]}>
                      <Text style={[
                        styles.percentageText, 
                        { color: colors.icon }
                      ]}>
                        {cat.percentage}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  moreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    gap: 20,
    paddingHorizontal: 0,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  pieWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  categoriesInfo: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: 'center',
    opacity: 0.8,
  },
  categoriesList: {
    marginHorizontal: 0,
  },
  categoryItem: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    marginHorizontal: 0,
  },
  firstCategoryItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastCategoryItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 1,
  },
  categoryContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  categoryRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: "600",
  },
  percentageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 45,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.6,
    lineHeight: 18,
  },
});

export default CategoriesChart;