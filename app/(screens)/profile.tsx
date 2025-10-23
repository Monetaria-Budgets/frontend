// app/(tabs)/profile.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';
import { usePinCodeWithAuth } from "@/hooks/usePinCodeWithAuth";

// Импортируем компоненты
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfoCard from '@/components/profile/ProfileInfoCard';
import ProfileActionButton from '@/components/profile/ProfileActionButton'; // ТЕПЕРЬ ИСПОЛЬЗУЕМ!
import ProfileSection from '@/components/profile/ProfileSection';

// Сервисы
import { premiumService, PremiumStatus } from '@/services/premiumService';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isPinCodeSet } = usePinCodeWithAuth();
  
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({ isPremium: false });
  const [loadingPremium, setLoadingPremium] = useState(true);

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      setLoadingPremium(true);
      const status = await premiumService.checkPremiumStatus();
      setPremiumStatus(status);
    } catch (error) {
      console.error('Ошибка загрузки премиум статуса:', error);
    } finally {
      setLoadingPremium(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Выход из аккаунта',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Выйти', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          }
        }
      ]
    );
  };

  // Вспомогательные функции
  const getInitial = () => {
    const login = user?.login;
    if (typeof login === 'string' && login.length > 0) {
      return login.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getName = () => typeof user?.name === 'string' ? user.name : 'Пользователь';
  const getEmail = () => typeof user?.email === 'string' ? user.email : 'email@example.com';
  const getRole = () => typeof user?.role === 'string' ? user.role : 'Пользователь';
  
  // Используем реальный премиум статус из premiumuser таблицы
  const isPremium = premiumStatus.isPremium;

  const handlePinCodeAction = () => {
    if (isPinCodeSet) {
      Alert.alert(
        'PIN-код',
        'Что вы хотите сделать?',
        [
          { 
            text: 'Изменить PIN', 
            onPress: () => router.push('/pin-code?change=true') 
          },
          { 
            text: 'Отключить PIN', 
            onPress: () => router.push('/pin-code?disable=true')
          },
          { text: 'Отмена', style: 'cancel' }
        ]
      );
    } else {
      router.push('/pin-code?setup=true');
    }
  };

  const handleUpgradeToPremium = () => {
    router.push('/premium');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Неизвестно';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{ 
          headerShown: true,
          headerTitle: "Профиль",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} style={{ paddingHorizontal: 10 }}/>
            </Pressable>
          ),
        }} 
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Аватар и основная информация */}
        <ProfileHeader
          initial={getInitial()}
          name={getName()}
          email={getEmail()}
          isPremium={isPremium}
        />

        {/* Быстрый доступ - ТОЛЬКО СУЩЕСТВУЮЩИЕ СТРАНИЦЫ */}
        <ProfileSection title="Быстрый доступ">
          <View style={styles.quickActions}>
            <Pressable 
              style={({ pressed }) => [
                styles.quickAction,
                { backgroundColor: colors.card },
                pressed && { transform: [{ scale: 0.95 }], opacity: 0.8 }
              ]}
              onPress={() => router.push('/categories')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.tint + '20' }]}>
                <Ionicons name="pricetags" size={24} color={colors.tint} />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Категории
              </Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [
                styles.quickAction,
                { backgroundColor: colors.card },
                pressed && { transform: [{ scale: 0.95 }], opacity: 0.8 }
              ]}
              onPress={() => router.push('/limits')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#4ECDC4' + '20' }]}>
                <Ionicons name="speedometer" size={24} color="#4ECDC4" />
              </View>
              <Text style={[styles.quickActionText, { color: colors.text }]}>
                Лимиты
              </Text>
            </Pressable>
          </View>
        </ProfileSection>

        {/* Информационные карточки */}
        <ProfileSection title="Информация аккаунта">
          
          <ProfileInfoCard
            icon={isPremium ? "star" : "star-outline"}
            label="Premium статус"
            value={isPremium ? "Активен" : "Не активен"}
            badge={isPremium ? "PRO" : "BASIC"}
            badgeColor={isPremium ? colors.tint : colors.icon}
            iconColor={isPremium ? colors.tint : undefined}
            isPremium={isPremium}
          />

          <ProfileInfoCard
            icon={isPinCodeSet ? "lock-closed" : "lock-open-outline"}
            label="Защита PIN-кодом"
            value={isPinCodeSet ? "Включена" : "Отключена"}
            badge={isPinCodeSet ? "ON" : "OFF"}
            badgeColor={isPinCodeSet ? "#4ECDC4" : colors.icon}
          />
        </ProfileSection>

        {/* УПРАВЛЕНИЕ АККАУНТОМ - ТЕПЕРЬ ИСПОЛЬЗУЕМ ProfileActionButton */}
        <ProfileSection title="Управление аккаунтом">
          <ProfileActionButton
            icon="notifications-outline"
            title="Уведомления"
            subtitle="Настройка оповещений"
            onPress={() => router.push('/notifications')}
          />
          
          <ProfileActionButton
            icon="color-palette-outline"
            title="Внешний вид"
            subtitle="Тема и оформление"
            onPress={() => router.push('/appearance')}
          />
          
          <ProfileActionButton
            icon="shield-checkmark-outline"
            title="Безопасность"
            subtitle="PIN-код и пароль"
            onPress={handlePinCodeAction}
          />
        </ProfileSection>

        {/* ПОДДЕРЖКА - ТЕПЕРЬ ИСПОЛЬЗУЕМ ProfileActionButton */}
        <ProfileSection title="Поддержка">
          <ProfileActionButton
            icon="help-circle-outline"
            title="Справка"
            subtitle="Частые вопросы"
            onPress={() => router.push('/support')}
          />
          
          <ProfileActionButton
            icon="chatbubble-ellipses-outline"
            title="Обратная связь"
            subtitle="Напишите нам"
            onPress={() => router.push('/feedback')}
          />
          
          <ProfileActionButton
            icon="information-circle-outline"
            title="О приложении"
            subtitle="Версия и лицензия"
            onPress={() => router.push('/about')}
          />
        </ProfileSection>

        {/* Премиум секция */}
        {!isPremium ? (
          <ProfileSection title="Премиум возможности">
            <View style={[styles.premiumCard, { backgroundColor: colors.tint + '15', borderColor: colors.tint + '30' }]}>
              <View style={styles.premiumHeader}>
                <View style={styles.premiumTitleContainer}>
                  <Ionicons name="diamond" size={24} color={colors.tint} />
                  <Text style={[styles.premiumTitle, { color: colors.tint }]}>
                    Премиум подписка
                  </Text>
                </View>
                <View style={[styles.premiumBadge, { backgroundColor: colors.tint }]}>
                  <Text style={styles.premiumBadgeText}>PRO</Text>
                </View>
              </View>
              
              <Text style={[styles.premiumSubtitle, { color: colors.icon }]}>
                Откройте все возможности приложения
              </Text>
              
              <View style={styles.premiumBenefits}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.tint} />
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    Неограниченное количество категорий
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.tint} />
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    Лимиты на все категории
                  </Text>
                </View>
              </View>
              
              <Pressable
                style={({ pressed }) => [
                  styles.premiumButton,
                  { backgroundColor: colors.tint },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
                ]}
                onPress={handleUpgradeToPremium}
              >
                <Text style={styles.premiumButtonText}>Перейти на Premium</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </ProfileSection>
        ) : (
          <ProfileSection title="Премиум статус">
            <View style={[styles.premiumActiveCard, { backgroundColor: colors.tint + '15', borderColor: colors.tint + '30' }]}>
              <View style={styles.premiumActiveHeader}>
                <Ionicons name="diamond" size={32} color={colors.tint} />
                <View>
                  <Text style={[styles.premiumActiveTitle, { color: colors.tint }]}>
                    Премиум активен
                  </Text>
                  {premiumStatus.subscriptionEnd && (
                    <Text style={[styles.premiumActiveSubtitle, { color: colors.icon }]}>
                      До: {formatDate(premiumStatus.subscriptionEnd)}
                    </Text>
                  )}
                </View>
              </View>
              <Text style={[styles.premiumActiveText, { color: colors.text }]}>
                Вы используете все возможности приложения
              </Text>
            </View>
          </ProfileSection>
        )}

        {/* Кнопка выхода */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { 
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,59,48,0.2)' : 'rgba(255,59,48,0.1)',
              borderColor: colorScheme === 'dark' ? 'rgba(255,59,48,0.3)' : 'rgba(255,59,48,0.2)',
              transform: [{ scale: pressed ? 0.95 : 1 }]
            }
          ]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </Pressable>

        {/* Версия приложения */}
        <Text style={[styles.versionText, { color: colors.icon }]}>
          Версия 1.0.0 • Build 42
        </Text>
      </ScrollView>
    </View>
  );
}

// Стили остаются без изменений
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  premiumCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  premiumSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  premiumBenefits: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumActiveCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  premiumActiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumActiveTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  premiumActiveSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  premiumActiveText: {
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
});