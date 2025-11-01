import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface QuickAction {
  icon: string;
  title: string;
  route: string;
  iconColor?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = (route: string) => {
    // @ts-ignore - игнорируем проверку типов для роутов
    router.push(route);
  };

  return (
    <View style={styles.quickActions}>
      {actions.map((action, index) => (
        <Pressable 
          key={index}
          style={({ pressed }) => [
            styles.quickAction,
            { backgroundColor: colors.card },
            pressed && { transform: [{ scale: 0.95 }], opacity: 0.8 }
          ]}
          onPress={() => handlePress(action.route)}
        >
          <View style={[styles.quickActionIcon, { backgroundColor: (action.iconColor || colors.tint) + '20' }]}>
            <Ionicons name={action.icon as any} size={24} color={action.iconColor || colors.tint} />
          </View>
          <Text style={[styles.quickActionText, { color: colors.text }]}>
            {action.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
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
});