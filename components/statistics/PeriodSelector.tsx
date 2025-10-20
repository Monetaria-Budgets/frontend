// components/statistics/PeriodSelector.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import CustomPeriodModal from './CustomPeriodModal';
import { PeriodType, CustomPeriod } from '@/hooks/useStatistics';

interface PeriodSelectorProps {
  selectedPeriod: PeriodType;
  onPeriodChange: (period: PeriodType, customPeriod?: CustomPeriod) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ 
  selectedPeriod, 
  onPeriodChange 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showCustomModal, setShowCustomModal] = useState(false);

  const periods: { key: PeriodType; label: string; icon: string }[] = [
    { key: 'week', label: 'Неделя', icon: 'calendar-outline' },
    { key: 'month', label: 'Месяц', icon: 'calendar' },
    { key: 'quarter', label: 'Квартал', icon: 'business' },
    { key: 'year', label: 'Год', icon: 'trending-up' },
  ];

  const handleCustomPeriodSelect = (startDate: string, endDate: string) => {
    onPeriodChange('custom', { startDate, endDate });
    setShowCustomModal(false);
  };

  const handlePeriodSelect = (period: PeriodType) => {
    onPeriodChange(period);
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {periods.map((period) => {
            const isSelected = selectedPeriod === period.key;
            
            return (
              <Pressable
                key={period.key}
                style={[
                  styles.periodButton,
                  isSelected && [
                    styles.periodButtonSelected,
                    { 
                      backgroundColor: colors.tint,
                      borderColor: colors.tint 
                    }
                  ],
                  !isSelected && { borderColor: colors.border }
                ]}
                onPress={() => handlePeriodSelect(period.key)}
              >
                <Ionicons 
                  name={period.icon as any} 
                  size={16} 
                  color={isSelected ? 'white' : colors.icon} 
                />
                <Text style={[
                  styles.periodText,
                  { color: isSelected ? 'white' : colors.text },
                ]}>
                  {period.label}
                </Text>
              </Pressable>
            );
          })}
          
          {/* Кнопка кастомного периода */}
          <Pressable
            style={[
              styles.customButton,
              selectedPeriod === 'custom' && [
                styles.periodButtonSelected,
                { 
                  backgroundColor: colors.tint,
                  borderColor: colors.tint 
                }
              ],
              !(selectedPeriod === 'custom') && { borderColor: colors.border }
            ]}
            onPress={() => setShowCustomModal(true)}
          >
            <Ionicons 
              name="options" 
              size={16} 
              color={selectedPeriod === 'custom' ? 'white' : colors.icon} 
            />
            <Text style={[
              styles.periodText,
              { color: selectedPeriod === 'custom' ? 'white' : colors.text },
            ]}>
              Выбрать
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      <CustomPeriodModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onPeriodSelect={handleCustomPeriodSelect}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 8,
  },
  scrollContent: {
    gap: 8,
    paddingHorizontal: 4,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    minHeight: 44,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    minHeight: 44,
  },
  periodButtonSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PeriodSelector;