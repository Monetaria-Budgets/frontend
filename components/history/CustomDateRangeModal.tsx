// app/(tabs)/history/components/CustomDateRangeModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  Animated,
  ScrollView 
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePickerModal from '@/components/modals/DateTimePickerModal';

interface CustomDateRangeModalProps {
  visible: boolean;
  onClose: () => void;
  onDateRangeSelect: (startDate: Date, endDate: Date) => void;
  initialDates?: {
    startDate: Date;
    endDate: Date;
  } | null;
}

interface QuickSelectItem {
  label: string;
  days?: number;
  custom?: () => Date;
}

export const CustomDateRangeModal = ({ 
  visible, 
  onClose, 
  onDateRangeSelect,
  initialDates 
}: CustomDateRangeModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const [startDate, setStartDate] = useState<Date>(() => {
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() - 1);
    return initialDates?.startDate || defaultDate;
  });
  
  const [endDate, setEndDate] = useState<Date>(() => {
    return initialDates?.endDate || new Date();
  });
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Анимация появления
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Сбрасываем даты при открытии модалки
  useEffect(() => {
    if (visible && initialDates) {
      setStartDate(initialDates.startDate);
      setEndDate(initialDates.endDate);
    }
  }, [visible, initialDates]);

  const handleConfirm = () => {
    // Проверяем, что начальная дата не позже конечной
    if (startDate > endDate) {
      // Меняем даты местами, если они в неправильном порядке
      onDateRangeSelect(endDate, startDate);
    } else {
      onDateRangeSelect(startDate, endDate);
    }
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleCancel = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleOverlayPress = (event: any) => {
    // Закрываем только если нажали на оверлей, а не на контент
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  };

  const handleQuickSelect = (item: QuickSelectItem) => {
    if ('days' in item && item.days !== undefined) {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - item.days);
      setStartDate(start);
      setEndDate(end);
    } else if (item.custom) {
      setStartDate(item.custom());
      setEndDate(new Date());
    }
  };

  const quickSelectItems: QuickSelectItem[] = [
    { label: '7 дней', days: 7 },
    { label: '30 дней', days: 30 },
    { label: '3 месяца', days: 90 },
    { label: '6 месяцев', days: 180 },
    { label: '1 год', days: 365 },
    { 
      label: 'С начала месяца', 
      custom: () => {
        const start = new Date();
        start.setDate(1);
        return start;
      }
    }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isDateRangeValid = startDate <= endDate;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Pressable 
          style={styles.overlayPressable} 
          onPress={handleOverlayPress}
        >
          <Animated.View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: colors.background,
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  })
                }]
              }
            ]}
            // Предотвращаем закрытие при нажатии на контент
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Произвольный период
            </Text>
            
            <ScrollView 
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Быстрый выбор */}
              <View style={styles.quickSelectSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Быстрый выбор
                </Text>
                <View style={styles.quickSelectGrid}>
                  {quickSelectItems.map((item) => (
                    <Pressable
                      key={item.label}
                      style={({ pressed }) => [
                        styles.quickSelectButton,
                        { 
                          backgroundColor: colorScheme === 'dark' 
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(0,0,0,0.05)',
                          transform: [{ scale: pressed ? 0.95 : 1 }]
                        }
                      ]}
                      onPress={() => handleQuickSelect(item)}
                    >
                      <Text style={[styles.quickSelectText, { color: colors.text }]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Выбор дат */}
              <View style={styles.dateSelectionSection}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Выберите период
                </Text>
                
                {/* Начальная дата */}
                <View style={styles.dateInputRow}>
                  <Text style={[styles.dateLabel, { color: colors.text }]}>
                    С:
                  </Text>
                  <Pressable
                    style={[styles.dateInput, { borderColor: colors.border }]}
                    onPress={() => setShowStartDatePicker(true)}
                  >
                    <Text style={[styles.dateInputText, { color: colors.text }]}>
                      {formatDate(startDate)}
                    </Text>
                    <Ionicons name="calendar" size={20} color={colors.icon} />
                  </Pressable>
                </View>

                {/* Конечная дата */}
                <View style={styles.dateInputRow}>
                  <Text style={[styles.dateLabel, { color: colors.text }]}>
                    По:
                  </Text>
                  <Pressable
                    style={[styles.dateInput, { borderColor: colors.border }]}
                    onPress={() => setShowEndDatePicker(true)}
                  >
                    <Text style={[styles.dateInputText, { color: colors.text }]}>
                      {formatDate(endDate)}
                    </Text>
                    <Ionicons name="calendar" size={20} color={colors.icon} />
                  </Pressable>
                </View>

                {/* Валидация */}
                {!isDateRangeValid && (
                  <View style={styles.validationError}>
                    <Ionicons name="warning" size={16} color="#FF3B30" />
                    <Text style={styles.validationErrorText}>
                      Начальная дата не может быть позже конечной
                    </Text>
                  </View>
                )}

                {/* Предпросмотр периода */}
                <View style={styles.previewSection}>
                  <Text style={[styles.previewTitle, { color: colors.text }]}>
                    Выбранный период:
                  </Text>
                  <Text style={[styles.previewText, { color: colors.text }]}>
                    {formatDate(startDate)} - {formatDate(endDate)}
                  </Text>
                  <Text style={[styles.previewSubtext, { color: colors.icon }]}>
                    {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} дней
                  </Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.buttonsContainer}>
              <Pressable
                style={[styles.button, styles.cancelButton, { borderColor: colors.tint }]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, { color: colors.tint }]}>Отмена</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.button, 
                  styles.selectButton, 
                  { 
                    backgroundColor: isDateRangeValid ? colors.tint : colors.icon,
                    opacity: isDateRangeValid ? 1 : 0.5
                  }
                ]}
                onPress={handleConfirm}
                disabled={!isDateRangeValid}
              >
                <Text style={[styles.buttonText, styles.selectButtonText]}>
                  Применить
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>

        {/* Пикеры дат */}
        <DateTimePickerModal
          visible={showStartDatePicker}
          onClose={() => setShowStartDatePicker(false)}
          selectedDate={startDate}
          onDateChange={setStartDate}
          maximumDate={endDate}
        />

        <DateTimePickerModal
          visible={showEndDatePicker}
          onClose={() => setShowEndDatePicker(false)}
          selectedDate={endDate}
          onDateChange={setEndDate}
          minimumDate={startDate}
          maximumDate={new Date()}
        />
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollContent: {
    maxHeight: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  quickSelectSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickSelectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  quickSelectButton: {
    width: '48%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  quickSelectText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  dateSelectionSection: {
    marginBottom: 20,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 30,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateInputText: {
    fontSize: 16,
    fontWeight: '500',
  },
  validationError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,48,0.1)',
    marginBottom: 16,
  },
  validationErrorText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
    flex: 1,
  },
  previewSection: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewSubtext: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  selectButton: {
    // backgroundColor задается инлайн
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectButtonText: {
    color: 'white',
  },
});