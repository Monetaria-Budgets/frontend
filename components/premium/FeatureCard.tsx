import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';

interface FeatureCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  colors: typeof Colors.light | typeof Colors.dark;
  isAvailable: boolean;
  compact?: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  colors,
  isAvailable,
  compact = false,
}) => {
  if (compact) {
    return (
      <View style={[styles.cardCompact, { backgroundColor: colors.card }]}>
        <View style={styles.cardHeaderCompact}>
          <View style={[
            styles.iconContainerCompact, 
            { backgroundColor: isAvailable ? colors.tint + '20' : colors.gray200 }
          ]}>
            <Ionicons 
              name={icon} 
              size={16} 
              color={isAvailable ? colors.tint : colors.textSecondary} 
            />
          </View>
          <View style={[
            styles.badgeCompact,
            { backgroundColor: isAvailable ? colors.success + '20' : colors.gray200 }
          ]}>
            <Text style={[
              styles.badgeTextCompact,
              { color: isAvailable ? colors.success : colors.textSecondary }
            ]}>
              {isAvailable ? '✓' : '★'}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.titleCompact, { color: colors.text }]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={[styles.descriptionCompact, { color: colors.textSecondary }]} numberOfLines={2}>
          {description}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[
          styles.iconContainer, 
          { backgroundColor: isAvailable ? colors.tint + '20' : colors.gray200 }
        ]}>
          <Ionicons 
            name={icon} 
            size={22} 
            color={isAvailable ? colors.tint : colors.textSecondary} 
          />
        </View>
        <View style={styles.badge}>
          <Text style={[
            styles.badgeText,
            { color: isAvailable ? colors.success : colors.textSecondary }
          ]}>
            {isAvailable ? '✓ Доступно' : 'Премиум'}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Компактный стиль для двух колонок
  cardCompact: {
    padding: 16,
    borderRadius: 12,
    height: 160, // Фиксированная высота для компактных карточек
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainerCompact: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCompact: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTextCompact: {
    fontSize: 10,
    fontWeight: '700',
  },
  titleCompact: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 18,
  },
  descriptionCompact: {
    fontSize: 12,
    lineHeight: 16,
  },

  // Оригинальный стиль (оставляем для обратной совместимости)
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    height: 160, // Фиксированная высота для обычных карточек
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});