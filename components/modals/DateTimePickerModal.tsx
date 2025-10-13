import { View, Text, Pressable, StyleSheet, Modal, Animated, PanResponder } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect, useRef } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DateTimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateTimePickerModal({ 
  visible, 
  onClose, 
  selectedDate, 
  onDateChange 
}: DateTimePickerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [tempDate, setTempDate] = useState(selectedDate);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5; // Активируем только при движении вниз
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Если свайпнули достаточно далеко вниз - закрываем
          handleClose();
        } else {
          // Иначе возвращаем на место
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      // Показываем модалку с анимацией
      panY.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Сбрасываем анимации когда модалка закрыта
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      setTempDate(date);
    }
  };

  const handleSave = () => {
    onDateChange(tempDate);
    handleClose();
  };

  const handleClose = () => {
    // Анимация закрытия
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
      setDatePickerMode('date');
    });
  };

  const handleCancel = () => {
    setTempDate(selectedDate);
    handleClose();
  };

  const switchToTimePicker = () => setDatePickerMode('time');
  const switchToDatePicker = () => setDatePickerMode('date');

  const translateY = panY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, 300],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalContainer}>
        {/* Затемненный оверлей */}
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <Pressable 
            style={styles.overlayPressable}
            onPress={handleCancel}
          />
        </Animated.View>
        
        {/* Контент модалки */}
        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              backgroundColor: colors.background,
              transform: [{ translateY }]
            }
          ]}
          {...panResponder.panHandlers}
        >
          {/* Draggable handle для свайпа */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>
          
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {datePickerMode === 'date' ? 'Выберите дату' : 'Выберите время'}
            </Text>
            <Pressable onPress={handleCancel} style={styles.modalCloseButton}>
              <Ionicons name="close" size={22} color={colors.icon} />
            </Pressable>
          </View>

          <View style={styles.pickerTypeSelector}>
            <Pressable
              style={[
                styles.pickerTypeButton,
                datePickerMode === 'date' && [styles.pickerTypeButtonActive, { backgroundColor: colors.tint }]
              ]}
              onPress={switchToDatePicker}
            >
              <Text style={[
                styles.pickerTypeText,
                datePickerMode === 'date' && styles.pickerTypeTextActive
              ]}>
                Дата
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.pickerTypeButton,
                datePickerMode === 'time' && [styles.pickerTypeButtonActive, { backgroundColor: colors.tint }]
              ]}
              onPress={switchToTimePicker}
            >
              <Text style={[
                styles.pickerTypeText,
                datePickerMode === 'time' && styles.pickerTypeTextActive
              ]}>
                Время
              </Text>
            </Pressable>
          </View>
          
          <DateTimePicker
            value={tempDate}
            mode={datePickerMode}
            display="spinner"
            onChange={handleDateChange}
            locale="ru-RU"
            style={styles.dateTimePicker}
          />
          
          <View style={styles.modalActions}>
            <Pressable
              style={[styles.modalButton, { backgroundColor: 'rgba(122, 122, 122, 0.1)' }]}
              onPress={handleCancel}
            >
              <Text style={[styles.modalButtonText, { color: colors.text }]}>Отмена</Text>
            </Pressable>
            <Pressable
              style={[styles.modalButton, { backgroundColor: colors.tint }]}
              onPress={handleSave}
            >
              <Text style={styles.modalButtonText}>Готово</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayPressable: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  dragHandleContainer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 8,
  },
  pickerTypeSelector: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 16,
    backgroundColor: 'rgba(122, 122, 122, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  pickerTypeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  pickerTypeButtonActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  pickerTypeTextActive: {
    color: '#fff',
  },
  dateTimePicker: {
    height: 200,
    marginVertical: 10,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white'
  },
});