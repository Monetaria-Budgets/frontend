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
import ProfileActionButton from '@/components/profile/ProfileActionButton';
import ProfileSection from '@/components/profile/ProfileSection';
import { PremiumCard } from '@/components/profile/PremiumCard';
import { QuickActions } from '@/components/profile/QuickActions';
import { LogoutButton } from '@/components/profile/LogoutButton';

// Сервисы
import { premiumService, PremiumStatus } from '@/services/premiumService';

interface QuickAction {
  icon: string;
  title: string;
  route: string;
  iconColor?: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isPinCodeSet } = usePinCodeWithAuth();
  
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus>({ 
    hasActivePremium: false, 
    hadPremiumBefore: false 
  });
  const [loadingPremium, setLoadingPremium] = useState(true);

  useEffect(() => {
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    try {
      setLoadingPremium(true);
      console.log('🔍 ProfileScreen: Загружаем премиум статус...');
      const status = await premiumService.checkPremiumStatus();
      console.log('🔍 ProfileScreen: Получен премиум статус:', {
        hasActivePremium: status.hasActivePremium,
        hadPremiumBefore: status.hadPremiumBefore,
        subscriptionEnd: status.subscriptionEnd,
        daysRemaining: status.daysRemaining
      });
      setPremiumStatus(status);
    } catch (error) {
      console.error('❌ ProfileScreen: Ошибка загрузки премиум статуса:', error);
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
            // @ts-ignore
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
  
  // Используем правильный премиум статус
  const isPremium = premiumStatus.hasActivePremium;
  const hadPremiumBefore = premiumStatus.hadPremiumBefore;

  // Отладочная информация в режиме разработки
  if (__DEV__) {
    console.log('🔍 ProfileScreen: Передаем в PremiumCard:', {
      isPremium,
      hadPremiumBefore,
      subscriptionEnd: premiumStatus.subscriptionEnd,
      daysRemaining: premiumStatus.daysRemaining
    });
  }

  const handlePinCodeAction = () => {
    if (isPinCodeSet) {
      Alert.alert(
        'PIN-код',
        'Что вы хотите сделать?',
        [
          { 
            text: 'Изменить PIN', 
            onPress: () => {
              // @ts-ignore
              router.push('/(auth)/pin-code?change=true');
            }
          },
          { 
            text: 'Отключить PIN', 
            onPress: () => {
              // @ts-ignore
              router.push('/(auth)/pin-code?disable=true');
            }
          },
          { text: 'Отмена', style: 'cancel' }
        ]
      );
    } else {
      // @ts-ignore
      router.push('/(auth)/pin-code?setup=true');
    }
  };

  const handleUpgradeToPremium = () => {
    // @ts-ignore
    router.push('/premium');
  };

  // Данные для быстрых действий
  const quickActions: QuickAction[] = [
    {
      icon: "pricetags",
      title: "Категории",
      route: "/categories"
    },
    {
      icon: "speedometer",
      title: "Лимиты", 
      route: "/limits",
      iconColor: "#4ECDC4"
    }
  ];

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

        {/* Быстрый доступ */}
        <ProfileSection title="Быстрый доступ">
          <QuickActions actions={quickActions} />
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

          <ProfileInfoCard
            icon="time-outline"
            label="История подписок"
            value={
              isPremium ? "Активная подписка" : 
              hadPremiumBefore ? "Была подписка" : "Никогда не было"
            }
            badge={
              isPremium ? "ACTIVE" : 
              hadPremiumBefore ? "HAD" : "NEW"
            }
            badgeColor={
              isPremium ? colors.tint : 
              hadPremiumBefore ? "#FFA500" : colors.icon
            }
          />
        </ProfileSection>

        {/* Управление аккаунтом */}
        <ProfileSection title="Управление аккаунтом">
          <ProfileActionButton
            icon="notifications-outline"
            title="Уведомления"
            subtitle="Настройка оповещений"
            route="/notifications"
          />
          
          <ProfileActionButton
            icon="color-palette-outline"
            title="Внешний вид"
            subtitle="Тема и оформление"
            route="/appearance"
          />
          
          <ProfileActionButton
            icon="shield-checkmark-outline"
            title="Безопасность"
            subtitle="PIN-код и пароль"
            onPress={handlePinCodeAction}
          />
        </ProfileSection>

        {/* Поддержка */}
        <ProfileSection title="Поддержка">
          <ProfileActionButton
            icon="help-circle-outline"
            title="Справка"
            subtitle="Частые вопросы"
            route="/support"
          />
          
          <ProfileActionButton
            icon="chatbubble-ellipses-outline"
            title="Обратная связь"
            subtitle="Напишите нам"
            route="/feedback"
          />
          
          <ProfileActionButton
            icon="information-circle-outline"
            title="О приложении"
            subtitle="Версия и лицензия"
            route="/about"
          />
        </ProfileSection>

        {/* Премиум секция */}
        <ProfileSection title={isPremium ? "Премиум статус" : "Премиум возможности"}>
          <PremiumCard
            isPremium={isPremium}
            hadPremiumBefore={hadPremiumBefore}
            subscriptionEnd={premiumStatus.subscriptionEnd}
            daysRemaining={premiumStatus.daysRemaining}
            onUpgrade={handleUpgradeToPremium}
          />
        </ProfileSection>

        {/* Кнопка выхода */}
        <LogoutButton onPress={handleLogout} />

        {/* Версия приложения */}
        <Text style={[styles.versionText, { color: colors.icon }]}>
          Версия 1.0.0 • Build 42
        </Text>
      </ScrollView>
    </View>
  );
}

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
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
  },
});