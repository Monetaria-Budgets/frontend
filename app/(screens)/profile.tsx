import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  // Вспомогательные функции для безопасного отображения
  const getInitial = () => {
    const login = user?.login;
    if (typeof login === 'string' && login.length > 0) {
      return login.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getLogin = () => typeof user?.login === 'string' ? user.login : 'Пользователь';
  const getEmail = () => typeof user?.email === 'string' ? user.email : 'email@example.com';
  const getRole = () => typeof user?.role === 'string' ? user.role : 'Пользователь';
  const isPremium = Boolean(user?.premium);

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
        <View style={[styles.profileCard, { 
          backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
        }]}>
          <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
            <Text style={styles.avatarText}>
              {getInitial()}
            </Text>
          </View>
          
          <Text style={[styles.userName, { color: colors.text }]}>
            {getLogin()}
          </Text>
          
          <Text style={[styles.userEmail, { color: colors.icon }]}>
            {getEmail()}
          </Text>
        </View>

        {/* Информационные карточки */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Информация аккаунта
          </Text>
          
          {/* Роль */}
          <View style={[styles.infoCard, { 
            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
          }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="person" size={20} color={colors.icon} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.icon }]}>
                  Роль
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {getRole()}
                </Text>
              </View>
            </View>
          </View>

          {/* Статус Premium */}
          <View style={[styles.infoCard, { 
            backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
          }]}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons 
                  name={isPremium ? "star" : "star-outline"} 
                  size={20} 
                  color={isPremium ? colors.tint : colors.icon} 
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.icon }]}>
                  Premium статус
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {isPremium ? "Активен" : "Не активен"}
                </Text>
              </View>
              {isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: colors.tint }]}>
                  <Text style={styles.premiumBadgeText}>PRO</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Действия */}
        <View style={styles.actionsSection}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Действия
          </Text>
          
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                transform: [{ scale: pressed ? 0.98 : 1 }]
              }
            ]}
            onPress={() => console.log('Редактировать профиль')}
          >
            <View style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Ionicons name="create-outline" size={22} color={colors.icon} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                Редактировать профиль
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.icon} />
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { 
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                transform: [{ scale: pressed ? 0.98 : 1 }]
              }
            ]}
            onPress={() => console.log('Настройки')}
          >
            <View style={styles.actionRow}>
              <View style={styles.actionIcon}>
                <Ionicons name="settings-outline" size={22} color={colors.icon} />
              </View>
              <Text style={[styles.actionText, { color: colors.text }]}>
                Настройки
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.icon} />
            </View>
          </Pressable>
        </View>

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
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  actionsSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    alignItems: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
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