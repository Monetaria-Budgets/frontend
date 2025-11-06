import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  Text,
  FlatList,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TouchableOpacity } from 'react-native';

// Хуки и компоненты
import { usePremium } from '@/hooks/usePremium';
import { PremiumHeader } from '@/components/premium/PremiumHeader';
import { FeatureCard } from '@/components/premium/FeatureCard';
import { PremiumButton } from '@/components/premium/PremiumButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PremiumScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const {
    premiumStatus,
    loading,
    activating,
    error,
    loadPremiumStatus,
    activatePremium,
  } = usePremium();

  const handleActivatePremium = async () => {
    try {
      Alert.alert(
        'Активация Premium',
        'Вы уверены, что хотите активировать Premium подписку на 30 дней?',
        [
          { text: 'Отмена', style: 'cancel' },
          { 
            text: 'Активировать', 
            style: 'default',
            onPress: async () => {
              try {
                const result = await activatePremium();
                Alert.alert(
                  'Успешно!',
                  `Premium подписка активирована до ${new Date(result.subscriptionEnd).toLocaleDateString('ru-RU')}`,
                  [{ text: 'Отлично' }]
                );
              } catch (err: any) {
                Alert.alert('Ошибка', err.message);
              }
            }
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Ошибка', err.message);
    }
  };

  const features = [
    {
      icon: 'analytics' as const,
      title: 'Расширенная аналитика',
      description: 'Детальные отчеты и графики по финансам',
      isAvailable: premiumStatus?.hasActivePremium || false,
    },
    {
      icon: 'calendar' as const,
      title: 'Автопланирование',
      description: 'Умное прогнозирование расходов',
      isAvailable: premiumStatus?.hasActivePremium || false,
    },
    {
      icon: 'notifications' as const,
      title: 'Умные уведомления',
      description: 'Персональные рекомендации',
      isAvailable: premiumStatus?.hasActivePremium || false,
    },
    {
      icon: 'color-palette' as const,
      title: 'Кастомизация',
      description: 'Темы и цветовые схемы',
      isAvailable: premiumStatus?.hasActivePremium || false,
    },
    {
      icon: 'cloud-upload' as const,
      title: 'Облачное хранение',
      description: 'Синхронизация между устройствами',
      isAvailable: premiumStatus?.hasActivePremium || false,
    },
    {
      icon: 'lock-open' as const,
      title: 'Расширенные лимиты',
      description: 'Больше категорий и операций',
      isAvailable: premiumStatus?.hasActivePremium || false,
    },
    {
      icon: 'download' as const,
      title: 'Экспорт данных',
      description: 'Выгрузка в PDF и Excel',
      isAvailable: premiumStatus?.hasActivePremium || false,
    },
    {
      icon: 'shield-checkmark' as const,
      title: 'Приоритетная поддержка',
      description: 'Быстрые ответы от службы поддержки',
      isAvailable: premiumStatus?.hasActivePremium || false,
    },
  ];

  // Разделяем фичи на два столбца
  const firstColumnFeatures = features.slice(0, Math.ceil(features.length / 2));
  const secondColumnFeatures = features.slice(Math.ceil(features.length / 2));

  const renderFeatureCard = ({ item }: { item: typeof features[0] }) => (
    <FeatureCard
      icon={item.icon}
      title={item.title}
      description={item.description}
      colors={colors}
      isAvailable={item.isAvailable}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen 
        options={{ 
          headerShown: true,
          title: "Premium",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" style={{ marginLeft: 16 }} />
            </TouchableOpacity>
          ),
          headerStyle: {
            backgroundColor: colors.tint,
          },
          headerTintColor: 'white',
        }} 
      />
      
      <View style={styles.scrollContainer}>
        <PremiumHeader
          colors={colors}
          isPremium={premiumStatus?.hasActivePremium || false}
          daysRemaining={premiumStatus?.daysRemaining}
        />
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          // Запрещаем bounce эффект (оттягивание)
          bounces={false}
          overScrollMode="never"
          // Отключаем автоматические отступы
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadPremiumStatus}
              tintColor={colors.tint}
              // Обновление будет работать только при скролле вниз
              progressViewOffset={40}
            />
          }
        >
          <View style={styles.content}>
            {/* Кнопка активации */}
            <View style={styles.buttonSection}>
              <PremiumButton
                onPress={handleActivatePremium}
                loading={activating}
                isPremium={premiumStatus?.hasActivePremium || false}
              />
            </View>

            {/* Возможности Premium в два столбца */}
            <View style={styles.featuresSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Возможности Premium
              </Text>
              
              <View style={styles.featuresGrid}>
                {/* Первый столбец */}
                <View style={styles.column}>
                  {firstColumnFeatures.map((feature, index) => (
                    <FeatureCard
                      key={index}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      colors={colors}
                      isAvailable={feature.isAvailable}
                      compact={true}
                    />
                  ))}
                </View>
                
                {/* Второй столбец */}
                <View style={styles.column}>
                  {secondColumnFeatures.map((feature, index) => (
                    <FeatureCard
                      key={index + firstColumnFeatures.length}
                      icon={feature.icon}
                      title={feature.title}
                      description={feature.description}
                      colors={colors}
                      isAvailable={feature.isAvailable}
                      compact={true}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Информация о подписке */}
            {premiumStatus?.hasActivePremium && premiumStatus.subscriptionEnd && (
              <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Информация о подписке
                </Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  Подписка активна до: {' '}
                  <Text style={{ color: colors.success, fontWeight: '600' }}>
                    {new Date(premiumStatus.subscriptionEnd).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </Text>
                </Text>
                {premiumStatus.daysRemaining && (
                  <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                    Осталось дней: {' '}
                    <Text style={{ color: colors.tint, fontWeight: '600' }}>
                      {premiumStatus.daysRemaining}
                    </Text>
                  </Text>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginTop: -1, // Небольшой хак чтобы убрать возможный зазор
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 1, // Компенсируем marginTop
  },
  content: {
    padding: 16,
    gap: 24,
  },
  buttonSection: {
    marginTop: -20,
  },
  featuresSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 20,
  },
});