// components/profile/ProfileHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ProfileHeaderProps {
  initial: string;
  name: string;
  email: string;
  isPremium?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  initial, 
  name, 
  email, 
  isPremium = false 
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.header, { backgroundColor: colors.card }]}>
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.avatarBadges}>
          {isPremium && (
            <View style={[styles.premiumBadge]}>
              <Ionicons name="star" size={12} color="#FFFFFF" />
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.infoSection}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.email, { color: colors.icon }]}>{email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarSection: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  avatarBadges: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#f3b224ff'
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  infoSection: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default ProfileHeader;