// components/profile/ProfileActionButton.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ProfileActionButtonProps {
  icon: string;
  title: string;
  onPress: () => void;
  showChevron?: boolean;
}

const ProfileActionButton: React.FC<ProfileActionButtonProps> = ({ 
  icon, 
  title, 
  onPress,
  showChevron = true 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        { 
          backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          transform: [{ scale: pressed ? 0.98 : 1 }]
        }
      ]}
      onPress={onPress}
    >
      <View style={styles.actionRow}>
        <View style={styles.actionIcon}>
          <Ionicons name={icon as any} size={22} color={colors.icon} />
        </View>
        <Text style={[styles.actionText, { color: colors.text }]}>
          {title}
        </Text>
        {showChevron && (
          <Ionicons name="chevron-forward" size={18} color={colors.icon} />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
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
});

export default ProfileActionButton;