// components/profile/ProfileHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ProfileHeaderProps {
  initial: string;
  name: string;
  email: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ initial, name, email }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.profileCard, { 
      backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' 
    }]}>
      <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>
      
      <Text style={[styles.userName, { color: colors.text }]}>
        {name}
      </Text>
      
      <Text style={[styles.userEmail, { color: colors.icon }]}>
        {email}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default ProfileHeader;