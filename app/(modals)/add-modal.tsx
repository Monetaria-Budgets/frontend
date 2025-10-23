// app/(modals)/add.tsx
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useState, useEffect } from 'react';
import DateTimePickerModal from '@/components/modals/DateTimePickerModal';
import CategoryPickerModal from '@/components/modals/CategoryPickerModal';
import { operationService } from '@/services/operationService';
import { categoryService } from '@/services/categoryService';
import { limitService } from '@/services/limitService'; // Используем правильный сервис
import { eventBus } from '@/utils/eventBus';

// Максимальная сумма операции
const MAX_OPERATION_AMOUNT = 10000000;

export default function AddModal() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isIncome, setIsIncome] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userCategories, setUserCategories] = useState<any[]>([]);
  const [categoriesWithLimits, setCategoriesWithLimits] = useState<any[]>([]); // Категории с лимитами

  // Загружаем категории и лимиты при монтировании
  useEffect(() => {
    loadUserCategories();
    loadCategoriesWithLimits();
  }, []);

  const loadUserCategories = async () => {
    try {
      const categories = await categoryService.getCategories();
      setUserCategories(categories);
    } catch (error) {
      console.error('Error loading user categories:', error);
      setUserCategories([]);
    }
  };

  const loadCategoriesWithLimits = async () => {
    try {
      const categories = await limitService.getCategoriesWithLimits();
      setCategoriesWithLimits(categories);
    } catch (error) {
      console.error('Error loading categories with limits:', error);
      setCategoriesWithLimits([]);
    }
  };

  // Обработчик изменения суммы с валидацией
  const handleAmountChange = (text: string) => {
    // Удаляем все символы, кроме цифр и точки
    const cleanedText = text.replace(/[^\d.]/g, '');
    
    // Проверяем, чтобы точка была только одна
    const parts = cleanedText.split('.');
    if (parts.length > 2) {
      return; // Не допускаем больше одной точки
    }
    
    // Проверяем, чтобы после точки было не больше 2 цифр
    if (parts.length === 2 && parts[1].length > 2) {
      return;
    }
    
    // Проверяем максимальное значение
    if (cleanedText) {
      const numericValue = parseFloat(cleanedText);
      if (numericValue > MAX_OPERATION_AMOUNT) {
        // Если превышает лимит, устанавливаем максимальное значение
        setAmount(MAX_OPERATION_AMOUNT.toString());
        return;
      }
    }
    
    setAmount(cleanedText);
  };

  // Получаем информацию о лимите для выбранной категории
  const getCurrentLimitInfo = () => {
    if (!category || isIncome) return null;

    const categoryWithLimit = categoriesWithLimits.find(cat => cat.name === category);
    if (!categoryWithLimit || !categoryWithLimit.spending_limit) return null;

    const currentSpent = categoryWithLimit.current_spent || 0;
    const limitAmount = categoryWithLimit.spending_limit.amount;
    const remaining = limitAmount - currentSpent;
    const percentage = (currentSpent / limitAmount) * 100;

    return {
      hasLimit: true,
      currentSpent,
      limitAmount,
      remaining,
      percentage,
      isExceeded: currentSpent > limitAmount
    };
  };

  const currentLimitInfo = getCurrentLimitInfo();

  // Очищаем категорию при смене типа операции
  useEffect(() => {
    setCategory('');
  }, [isIncome]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCategorySelect = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryPicker(false);
  };

  const handleClearCategory = () => {
    setCategory('');
  };

  const handleClearDescription = () => {
    setDescription('');
  };

  const handleClearDate = () => {
    setSelectedDate(new Date());
  };

  const handleTypeChange = (income: boolean) => {
    setIsIncome(income);
  };

  const formatDateForBackend = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }

    const operationAmount = parseFloat(amount);
    
    // Проверяем максимальную сумму
    if (operationAmount > MAX_OPERATION_AMOUNT) {
      Alert.alert('Ошибка', `Максимальная сумма операции: ${MAX_OPERATION_AMOUNT.toLocaleString('ru-RU')}₽`);
      return;
    }

    if (!category) {
      Alert.alert('Ошибка', isIncome ? 'Введите название дохода' : 'Выберите категорию');
      return;
    }

    // Проверяем превышение лимита
    if (!isIncome && currentLimitInfo && currentLimitInfo.hasLimit) {
      const newTotalSpent = currentLimitInfo.currentSpent + operationAmount;
      const willExceedLimit = newTotalSpent > currentLimitInfo.limitAmount;

      if (willExceedLimit) {
        const exceededAmount = newTotalSpent - currentLimitInfo.limitAmount;
        
        // Показываем предупреждение о превышении лимита
        const userConfirmed = await new Promise((resolve) => {
          Alert.alert(
            'Превышение лимита',
            `Добавление этой операции превысит лимит категории "${category}" на ${exceededAmount.toLocaleString('ru-RU')}₽\n\nТекущий лимит: ${currentLimitInfo.limitAmount.toLocaleString('ru-RU')}₽\nБудет израсходовано: ${newTotalSpent.toLocaleString('ru-RU')}₽\n\nВы уверены, что хотите продолжить?`,
            [
              {
                text: 'Отмена',
                style: 'cancel',
                onPress: () => resolve(false)
              },
              {
                text: 'Продолжить',
                style: 'destructive',
                onPress: () => resolve(true)
              }
            ]
          );
        });

        if (!userConfirmed) {
          return; // Пользователь отменил операцию
        }
      }
    }

    try {
      setIsLoading(true);

      const operationData = {
        amount: operationAmount,
        category: category,
        description: description || undefined,
        operation_type_id: isIncome ? 1 : 2,
        created_at: formatDateForBackend(selectedDate),
      };

      const result = await operationService.createOperation(operationData);

      eventBus.emit('operationAdded');
      eventBus.emit('limitsUpdated'); // Обновляем лимиты

      Alert.alert('Успех', 'Операция успешно добавлена', [
        {
          text: 'OK',
          onPress: () => {
            setAmount('');
            setCategory('');
            setDescription('');
            setIsIncome(false);
            setSelectedDate(new Date());
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error saving operation:', error);
      Alert.alert('Ошибка', error.message || 'Не удалось сохранить операцию');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик быстрых сумм с проверкой лимита
  const handleQuickAmount = (quickAmount: number) => {
    if (quickAmount > MAX_OPERATION_AMOUNT) {
      setAmount(MAX_OPERATION_AMOUNT.toString());
    } else {
      setAmount(quickAmount.toString());
    }
  };

  // Получаем цвет выбранной категории
  const getCategoryColor = () => {
    if (!category || isIncome) return colors.tint;
    const foundCategory = userCategories.find(cat => cat.name === category);
    return foundCategory?.color || colors.tint;
  };

  // Получаем цвет статуса лимита
  const getLimitStatusColor = () => {
    if (!currentLimitInfo) return colors.icon;
    
    const newAmount = parseFloat(amount) || 0;
    const newTotal = currentLimitInfo.currentSpent + newAmount;
    const newPercentage = (newTotal / currentLimitInfo.limitAmount) * 100;

    if (newTotal > currentLimitInfo.limitAmount) return '#FF3B30';
    if (newPercentage >= 80) return '#FF9500';
    if (newPercentage >= 50) return '#FFCC00';
    return '#34C759';
  };

  // Форматируем сумму для отображения
  const formatCurrency = (value: number) => {
    return value.toLocaleString('ru-RU') + '₽';
  };

  // Проверяем, превышает ли текущая сумма лимит
  const isAmountExceedingLimit = () => {
    if (!amount) return false;
    const numericAmount = parseFloat(amount);
    return numericAmount > MAX_OPERATION_AMOUNT;
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen 
        options={{ 
          headerShown: true,
          header: () => (
            <View style={[styles.header, { 
              backgroundColor: colors.background,
              borderBottomColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
            }]}>
              <Pressable 
                onPress={() => router.back()}
                style={styles.iconButton}
                disabled={isLoading}
              >
                <Ionicons name="close" size={22} color={colors.icon} />
              </Pressable>

              <Text style={[styles.title, { color: colors.text }]}>
                Новая операция
              </Text>

              <Pressable
                onPress={handleSave}
                style={styles.iconButton}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Ionicons name="hourglass" size={22} color={colors.icon} />
                ) : (
                  <Ionicons name="checkmark" size={22} color={colors.tint} />
                )}
              </Pressable>
            </View>
          )
        }} 
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* Сумма */}
        <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.amountLabel, { color: colors.text }]}>Сумма</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[
                styles.amountInput, 
                { color: isAmountExceedingLimit() ? '#FF3B30' : colors.text }
              ]}
              placeholder="0"
              placeholderTextColor={colors.icon}
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              autoFocus
              editable={!isLoading}
              maxLength={12} // Ограничиваем длину ввода
            />
            <Text style={[styles.currency, { color: colors.icon }]}>₽</Text>
          </View>
          {isAmountExceedingLimit() && (
            <Text style={styles.amountWarning}>
              Максимальная сумма: {MAX_OPERATION_AMOUNT.toLocaleString('ru-RU')}₽
            </Text>
          )}
        </View>

        {/* Тип операции */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Тип операции</Text>
          <View style={styles.typeSelector}>
            <Pressable
              style={[
                styles.typeOption,
                !isIncome && [styles.typeOptionActive, { 
                  backgroundColor: colors.tint,
                  borderColor: colors.tint 
                }]
              ]}
              onPress={() => handleTypeChange(false)}
              disabled={isLoading}
            >
              <Ionicons 
                name="arrow-up" 
                size={20} 
                color={!isIncome ? '#fff' : colors.icon} 
              />
              <Text style={[
                styles.typeOptionText,
                !isIncome && styles.typeOptionTextActive
              ]}>
                Расход
              </Text>
            </Pressable>
            
            <Pressable
              style={[
                styles.typeOption,
                isIncome && [styles.typeOptionActive, { 
                  backgroundColor: colors.tint,
                  borderColor: colors.tint 
                }]
              ]}
              onPress={() => handleTypeChange(true)}
              disabled={isLoading}
            >
              <Ionicons 
                name="arrow-down" 
                size={20} 
                color={isIncome ? '#fff' : colors.icon} 
              />
              <Text style={[
                styles.typeOptionText,
                isIncome && styles.typeOptionTextActive
              ]}>
                Доход
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Категория */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {isIncome ? 'Название дохода' : 'Категория'}
          </Text>
          
          {!isIncome ? (
            // Категория для расходов - с выбором из списка
            <Pressable
              style={[styles.inputCard, { 
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
              }]}
              onPress={() => setShowCategoryPicker(true)}
              disabled={isLoading}
            >
              <View style={styles.inputRow}>
                <Ionicons name="pricetag" size={20} color={getCategoryColor()} />
                <Text style={[styles.input, { color: category ? colors.text : colors.icon }]}>
                  {category || "Категория"}
                </Text>
                {category ? (
                  <Pressable 
                    onPress={handleClearCategory}
                    style={styles.clearButton}
                    hitSlop={8}
                    disabled={isLoading}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.icon} />
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-down" size={20} color={colors.icon} />
                )}
              </View>
            </Pressable>
          ) : (
            // Название для доходов - обычный инпут
            <View style={[styles.inputCard, { 
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
            }]}>
              <View style={styles.inputRow}>
                <Ionicons name="pricetag" size={20} color={colors.icon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Название дохода"
                  placeholderTextColor={colors.icon}
                  value={category}
                  onChangeText={setCategory}
                  returnKeyType="next"
                  editable={!isLoading}
                />
                {category ? (
                  <Pressable 
                    onPress={handleClearCategory}
                    style={styles.clearButton}
                    hitSlop={8}
                    disabled={isLoading}
                  >
                    <Ionicons name="close-circle" size={20} color={colors.icon} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}

          {/* Информация о лимите категории */}
          {!isIncome && currentLimitInfo && (
            <View style={styles.limitInfo}>
              <View style={styles.limitHeader}>
                <View style={styles.limitProgress}>
                  <View style={styles.limitLabels}>
                    <Text style={[styles.limitLabel, { color: colors.text }]}>
                      Лимит категории
                    </Text>
                    <Text style={[styles.limitAmount, { color: getLimitStatusColor() }]}>
                      {formatCurrency(currentLimitInfo.currentSpent)} / {formatCurrency(currentLimitInfo.limitAmount)}
                    </Text>
                  </View>
                  
                  {/* Прогресс бар */}
                  <View style={[styles.progressBar, { backgroundColor: colors.background + '80' }]}>
                    <View 
                      style={[
                        styles.progressFill,
                        { 
                          backgroundColor: getLimitStatusColor(),
                          width: `${Math.min(100, currentLimitInfo.percentage)}%`
                        }
                      ]} 
                    />
                  </View>

                  {/* Прогноз после добавления операции */}
                  {amount && parseFloat(amount) > 0 && (
                    <View style={styles.limitForecast}>
                      <Text style={[styles.forecastText, { color: getLimitStatusColor() }]}>
                        После операции: {formatCurrency(currentLimitInfo.currentSpent + parseFloat(amount))} / {formatCurrency(currentLimitInfo.limitAmount)}
                      </Text>
                      {currentLimitInfo.currentSpent + parseFloat(amount) > currentLimitInfo.limitAmount && (
                        <View style={styles.warningBadge}>
                          <Ionicons name="warning" size={14} color="#FFF" />
                          <Text style={styles.warningText}>
                            Превышение на {formatCurrency(currentLimitInfo.currentSpent + parseFloat(amount) - currentLimitInfo.limitAmount)}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Описание */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Описание</Text>
          <View style={[styles.inputCard, { 
            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
          }]}>
            <View style={styles.inputRow}>
              <Ionicons name="document-text" size={20} color={colors.icon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Описание"
                placeholderTextColor={colors.icon}
                value={description}
                onChangeText={setDescription}
                multiline
                returnKeyType="done"
                blurOnSubmit={true}
                editable={!isLoading}
              />
              {description ? (
                <Pressable 
                  onPress={handleClearDescription}
                  style={styles.clearButton}
                  hitSlop={8}
                  disabled={isLoading}
                >
                  <Ionicons name="close-circle" size={20} color={colors.icon} />
                </Pressable>
              ) : null}
            </View>
          </View>
        </View>

        {/* Дата и время */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.dateHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Дата и время</Text>
            <Pressable 
              onPress={handleClearDate}
              style={styles.resetDateButton}
              disabled={isLoading}
            >
              <Ionicons name="refresh" size={16} color={colors.tint} />
              <Text style={[styles.resetDateText, { color: colors.tint }]}>
                Сейчас
              </Text>
            </Pressable>
          </View>
          <Pressable
            style={[styles.inputCard, { 
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
            }]}
            onPress={() => setShowDatePicker(true)}
            disabled={isLoading}
          >
            <View style={styles.inputRow}>
              <Ionicons name="calendar" size={20} color={colors.icon} />
              <View style={styles.dateContent}>
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDate(selectedDate)}
                </Text>
                <Text style={[styles.timeText, { color: colors.icon }]}>
                  {formatTime(selectedDate)}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </View>
          </Pressable>
        </View>

        {/* Быстрые суммы */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Быстрые суммы</Text>
          <View style={styles.quickAmountsGrid}>
            {[100, 500, 1000, 2000, 5000, 10000].map((quickAmount) => (
              <Pressable
                key={quickAmount}
                style={({ pressed }) => [
                  styles.quickAmountButton, 
                  { 
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    transform: [{ scale: pressed ? 0.95 : 1 }]
                  }
                ]}
                onPress={() => handleQuickAmount(quickAmount)}
                disabled={isLoading}
              >
                <Text style={[styles.quickAmountText, { color: colors.text }]}>
                  {quickAmount.toLocaleString('ru-RU')}₽
                </Text>
              </Pressable>
            ))}
          </View>
          {/* Информация о максимальной сумме */}
          <View style={styles.maxAmountInfo}>
            <Ionicons name="information-circle" size={16} color={colors.icon} />
            <Text style={[styles.maxAmountText, { color: colors.icon }]}>
              Максимальная сумма операции: {MAX_OPERATION_AMOUNT.toLocaleString('ru-RU')}₽
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Модалки */}
      <DateTimePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <CategoryPickerModal
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        onCategorySelect={handleCategorySelect}
        selectedCategory={category}
        userCategories={userCategories}
        categoriesWithLimits={categoriesWithLimits} // Передаем информацию о лимитах
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 90,
    paddingTop: 40,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingTop: 20,
  },
  amountCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  amountLabel: {
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  amountInput: {
    fontSize: 52,
    fontWeight: '300',
    textAlign: 'center',
    minWidth: 120,
  },
  currency: {
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 8,
  },
  amountWarning: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resetDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0,122,255,0.1)',
  },
  resetDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(122, 122, 122, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  typeOptionTextActive: {
    color: '#fff',
  },
  inputCard: {
    borderRadius: 16,
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    fontWeight: '500',
  },
  clearButton: {
    padding: 2,
  },
  dateContent: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.7,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAmountButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  maxAmountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  maxAmountText: {
    fontSize: 12,
    flex: 1,
  },
  // Стили для информации о лимите
  limitInfo: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  limitProgress: {
    flex: 1,
    gap: 8,
  },
  limitLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  limitAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  limitForecast: {
    marginTop: 8,
    gap: 4,
  },
  forecastText: {
    fontSize: 12,
    fontWeight: '500',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    alignSelf: 'flex-start',
  },
  warningText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFF',
  },
});