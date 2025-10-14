// app/(tabs)/currency/components/CurrencyModal.tsx
import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  Pressable, 
  StyleSheet,
  Animated 
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { CurrencyRate } from '@/services/currencyService';
import Ionicons from '@expo/vector-icons/Ionicons';

interface CurrencyModalProps {
  visible: boolean;
  onClose: () => void;
  currency: CurrencyRate | null;
}

export const CurrencyModal = ({ visible, onClose, currency }: CurrencyModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
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

  const formatRate = (rateValue: string) => {
    if (!rateValue) return '—';
    const num = parseFloat(rateValue);
    if (isNaN(num)) return '—';
    if (num >= 10) return num.toFixed(2);
    if (num >= 1) return num.toFixed(3);
    return num.toFixed(4);
  };

  const getChangeColor = () => {
    if (!currency?.changePercentage) return colors.icon;
    const change = parseFloat(currency.changePercentage);
    if (change > 0) return '#34C759';
    if (change < 0) return '#FF3B30';
    return colors.icon;
  };

  const getChangeSymbol = () => {
    if (!currency?.changePercentage) return '→';
    const change = parseFloat(currency.changePercentage);
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };

  // Проверяем, есть ли реальные данные об изменении
  const hasValidChange = currency?.change && parseFloat(currency.change) !== 0;
  const hasValidChangePercentage = currency?.changePercentage && parseFloat(currency.changePercentage) !== 0;

  const handleOverlayPress = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!currency) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleOverlayPress}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Pressable style={styles.overlayPressable} onPress={handleOverlayPress}>
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
          >
            {/* Заголовок */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.currencyCode, { color: colors.text }]}>
                  {currency.code}
                </Text>
                <Text style={[styles.currencyName, { color: colors.icon }]}>
                  {currency.name}
                </Text>
              </View>
              <Pressable onPress={handleOverlayPress} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Основная информация */}
            <View style={styles.modalBody}>
              {/* Текущий курс */}
              <View style={styles.infoSection}>
                <Text style={[styles.label, { color: colors.icon }]}>Текущий курс</Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {formatRate(currency.rate)} ₽
                </Text>
                <Text style={[styles.nominal, { color: colors.icon }]}>
                  за {currency.nominal} {currency.code}
                </Text>
              </View>

              {/* Изменение - показываем только если есть реальные данные */}
              {(hasValidChangePercentage || hasValidChange) && (
                <View style={styles.infoSection}>
                  <Text style={[styles.label, { color: colors.icon }]}>Изменение</Text>
                  <View style={styles.changeRow}>
                    <Text style={[styles.changeSymbol, { color: getChangeColor() }]}>
                      {getChangeSymbol()}
                    </Text>
                    {hasValidChangePercentage && (
                      <Text style={[styles.changePercentage, { color: getChangeColor() }]}>
                        {Math.abs(parseFloat(currency.changePercentage)).toFixed(2)}%
                      </Text>
                    )}
                    {hasValidChange && (
                      <Text style={[styles.changeValue, { color: getChangeColor() }]}>
                        {parseFloat(currency.change) > 0 ? '+' : ''}{parseFloat(currency.change).toFixed(4)}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Предыдущий курс */}
              {currency.previousRate && (
                <View style={styles.infoSection}>
                  <Text style={[styles.label, { color: colors.icon }]}>Предыдущий курс</Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {formatRate(currency.previousRate)} ₽
                  </Text>
                </View>
              )}

              {/* Детали */}
              <View style={styles.infoSection}>
                <Text style={[styles.label, { color: colors.icon }]}>Детали</Text>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.icon }]}>Номинал:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>{currency.nominal}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.icon }]}>Статус:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {currency.isPopular ? 'Популярная' : 'Все валюты'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.icon }]}>Обновлено:</Text>
                  <Text style={[styles.detailValue, { color: colors.text }]}>
                    {currency.lastUpdated ? new Date(currency.lastUpdated).toLocaleString('ru-RU') : 'Неизвестно'}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </Pressable>
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
  },
  modalContent: {
    width: '85%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  currencyCode: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 16,
    opacity: 0.7,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  infoSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  nominal: {
    fontSize: 14,
    opacity: 0.7,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  changeSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  changePercentage: {
    fontSize: 18,
    fontWeight: '600',
  },
  changeValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});