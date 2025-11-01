import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ProfileActionButtonProps {
  icon: string;
  title: string;
  subtitle?: string;
  route?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

const ProfileActionButton: React.FC<ProfileActionButtonProps> = ({
  icon,
  title,
  subtitle,
  route,
  onPress,
  showChevron = true
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (route) {
      // @ts-ignore - игнорируем проверку типов для роутов
      router.push(route);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.card },
        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }
      ]}
      onPress={handlePress}
    >
      <View style={styles.buttonContent}>
        <View style={styles.buttonLeft}>
          <Ionicons name={icon as any} size={22} color={colors.icon} style={styles.icon} />
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            {subtitle && (
              <Text style={[styles.subtitle, { color: colors.icon }]}>{subtitle}</Text>
            )}
          </View>
        </View>
        
        {showChevron && (
          <Ionicons name="chevron-forward" size={18} color={colors.icon} />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default ProfileActionButton;