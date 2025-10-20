// app/(tabs)/profile.tsx
import React from 'react';
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

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isPinCodeSet } = usePinCodeWithAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
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
  const isPremium = Boolean(user?.premium);

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
    Alert.alert(
      'Premium подписка',
      'Откройте все возможности приложения с Premium подпиской!',
      [
        {
          text: 'Узнать больше',
          onPress: () => console.log('Navigate to premium screen')
        },
        {
          text: 'Купить за 299₽/мес',
          style: 'default',
          onPress: () => console.log('Purchase premium')
        },
        {
          text: 'Отмена',
          style: 'cancel'
        }
      ]
    );
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
        />

        {/* Информационные карточки */}
        <ProfileSection title="Информация аккаунта">
          <ProfileInfoCard
            icon="person"
            label="Роль"
            value={getRole()}
          />
          
          <ProfileInfoCard
            icon={isPremium ? "star" : "star-outline"}
            label="Premium статус"
            value={isPremium ? "Активен" : "Не активен"}
            badge={isPremium ? "PRO" : undefined}
            iconColor={isPremium ? colors.tint : undefined}
            isPremium={isPremium}
          />
        </ProfileSection>

        {/* Действия */}
        <ProfileSection title="Действия">
          <ProfileActionButton
            icon="create-outline"
            title="Редактировать профиль"
            onPress={() => console.log('Редактировать профиль')}
          />

          <ProfileActionButton
            icon="pricetags-outline"
            title="Мои категории"
            onPress={() => router.push('/categories')}
          />

          <ProfileActionButton
            icon={isPinCodeSet ? "lock-closed" : "lock-open-outline"}
            title={isPinCodeSet ? 'Изменить PIN-код' : 'Включить PIN-код'}
            onPress={handlePinCodeAction}
          />

          <ProfileActionButton
            icon="settings-outline"
            title="Настройки"
            onPress={() => console.log('Настройки')}
          />

          {/* Кнопка апгрейда для не-премиум пользователей */}
          {!isPremium && (
            <ProfileActionButton
              icon="rocket-outline"
              title="Перейти на Premium"
              onPress={handleUpgradeToPremium}
            />
          )}
        </ProfileSection>

        {/* Премиум секция для премиум пользователей */}
        {isPremium && (
          <ProfileSection title="Премиум возможности">
            <View style={[styles.premiumSection, { backgroundColor: colors.tint + '15' }]}>
              <Ionicons name="diamond" size={32} color={colors.tint} style={styles.premiumIcon} />
              <Text style={[styles.premiumTitle, { color: colors.tint }]}>
                Премиум активен
              </Text>
              <Text style={[styles.premiumSubtitle, { color: colors.icon }]}>
                Вы используете все возможности приложения
              </Text>
              
              <View style={styles.premiumBenefits}>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    Расширенная аналитика расходов
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    Неограниченное количество категорий
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    Экспорт данных в PDF/Excel
                  </Text>
                </View>
                <View style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.tint} />
                  <Text style={[styles.benefitText, { color: colors.text }]}>
                    Приоритетная поддержка
                  </Text>
                </View>
              </View>
            </View>
          </ProfileSection>
        )}

        {/* Кнопка выхода */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            { 
              backgroundColor: colorScheme === 'dark' ? 'rgba(255,59,48,0.2)' : 'rgba(255,59,48,0.1)',
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
          Версия 1.0.0
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
    paddingVertical: 20,
  },
  premiumSection: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  premiumIcon: {
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  premiumSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  premiumBenefits: {
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
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
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
});