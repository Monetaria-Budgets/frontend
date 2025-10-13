// components/profile/ProfileInfoCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ProfileInfoCardProps {
  icon: string;
  label: string;
  value: string;
  badge?: string;
  iconColor?: string;
  isPremium?: boolean;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ 
  icon, 
  label, 
  value, 
  badge,
  iconColor,
  isPremium = false
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[
      styles.infoCard, 
      { 
        backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        borderColor: isPremium ? colors.tint : 'transparent',
        borderWidth: isPremium ? 1 : 0,
      }
    ]}>
      <View style={styles.infoRow}>
        <View style={styles.infoIcon}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={iconColor || (isPremium ? colors.tint : colors.icon)} 
          />
        </View>
        <View style={styles.infoContent}>
          <Text style={[
            styles.infoLabel, 
            { color: isPremium ? colors.tint : colors.icon }
          ]}>
            {label}
          </Text>
          <Text style={[
            styles.infoValue, 
            { color: isPremium ? colors.tint : colors.text }
          ]}>
            {value}
          </Text>
        </View>
        {badge && (
          <View style={[
            styles.premiumBadge, 
            { 
              backgroundColor: colors.tint,
              shadowColor: colors.tint,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }
          ]}>
            <Text style={styles.premiumBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      
      {/* Дополнительная информация для премиум пользователей */}
      {isPremium && (
        <View style={styles.premiumFeatures}>
          <Text style={[styles.premiumFeatureText, { color: colors.tint }]}>
            ✓ Расширенная аналитика
          </Text>
          <Text style={[styles.premiumFeatureText, { color: colors.tint }]}>
            ✓ Безлимитные категории
          </Text>
          <Text style={[styles.premiumFeatureText, { color: colors.tint }]}>
            ✓ Приоритетная поддержка
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  premiumFeatures: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  premiumFeatureText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default ProfileInfoCard;