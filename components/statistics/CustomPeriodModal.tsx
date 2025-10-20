// components/statistics/CustomPeriodModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  Pressable, 
  Platform,
  ScrollView
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface CustomPeriodModalProps {
  visible: boolean;
  onClose: () => void;
  onPeriodSelect: (startDate: string, endDate: string) => void;
}

const CustomPeriodModal: React.FC<CustomPeriodModalProps> = ({ 
  visible, 
  onClose, 
  onPeriodSelect 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // 30 дней назад по умолчанию
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      if (selectedDate > endDate) {
        setEndDate(selectedDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate && selectedDate >= startDate) {
      setEndDate(selectedDate);
    }
  };

  const handleApply = () => {
    onPeriodSelect(formatDate(startDate), formatDate(endDate));
    onClose();
  };

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start);
    setEndDate(end);
  };

  const isFormValid = startDate <= endDate;
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const quickPeriods = [
    { label: '7 дней', days: 7 },
    { label: '30 дней', days: 30 },
    { label: '90 дней', days: 90 },
    { label: 'Год', days: 365 },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Выберите период
          </Text>
          <Pressable 
            onPress={onClose} 
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.7 : 1 }
            ]}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView}>
          {/* Быстрый выбор */}
          <View style={styles.quickSelectSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Быстрый выбор
            </Text>
            <View style={styles.quickSelectGrid}>
              {quickPeriods.map((period) => (
                <Pressable
                  key={period.days}
                  style={[
                    styles.quickSelectButton,
                    { backgroundColor: colors.card, borderColor: colors.border }
                  ]}
                  onPress={() => handleQuickSelect(period.days)}
                >
                  <Text style={[styles.quickSelectText, { color: colors.text }]}>
                    {period.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Ручной выбор */}
          <View style={styles.customSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Ручной выбор
            </Text>
            
            <View style={styles.dateSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Начальная дата
              </Text>
              <Pressable 
                style={[
                  styles.dateInput, 
                  { 
                    backgroundColor: colors.card, 
                    borderColor: showStartPicker ? colors.tint : colors.border 
                  }
                ]}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons name="calendar" size={20} color={colors.icon} />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDisplayDate(startDate)}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.icon} />
              </Pressable>
            </View>

            <View style={styles.dateSection}>
              <Text style={[styles.label, { color: colors.text }]}>
                Конечная дата
              </Text>
              <Pressable 
                style={[
                  styles.dateInput, 
                  { 
                    backgroundColor: colors.card, 
                    borderColor: showEndPicker ? colors.tint : colors.border 
                  }
                ]}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons name="calendar" size={20} color={colors.icon} />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDisplayDate(endDate)}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.icon} />
              </Pressable>
            </View>

            {/* Информация о периоде */}
            <View style={[styles.periodInfo, { backgroundColor: colors.tint + '15' }]}>
              <Text style={[styles.periodInfoText, { color: colors.tint }]}>
                Выбран период: {daysDiff} {daysDiff === 1 ? 'день' : daysDiff < 5 ? 'дня' : 'дней'}
              </Text>
            </View>

            {!isFormValid && (
              <View style={styles.errorContainer}>
                <Ionicons name="warning" size={16} color="#FF3B30" />
                <Text style={styles.errorText}>
                  Конечная дата не может быть раньше начальной
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Pressable 
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Отмена
            </Text>
          </Pressable>
          
          <Pressable 
            style={[
              styles.applyButton, 
              { 
                backgroundColor: isFormValid ? colors.tint : colors.border,
                opacity: isFormValid ? 1 : 0.6
              }
            ]}
            onPress={handleApply}
            disabled={!isFormValid}
          >
            <Ionicons name="checkmark" size={20} color="white" />
            <Text style={styles.applyButtonText}>
              Применить
            </Text>
          </Pressable>
        </View>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartDateChange}
            maximumDate={new Date()}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndDateChange}
            minimumDate={startDate}
            maximumDate={new Date()}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  quickSelectSection: {
    padding: 20,
    gap: 12,
  },
  customSection: {
    padding: 20,
    gap: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  quickSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickSelectButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
  },
  quickSelectText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  dateSection: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  periodInfo: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodInfoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF3B3015',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomPeriodModal;