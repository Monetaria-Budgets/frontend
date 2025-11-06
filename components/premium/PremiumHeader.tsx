import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/theme';

interface PremiumHeaderProps {
  colors: typeof Colors.light | typeof Colors.dark;
  isPremium: boolean;
  daysRemaining?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PremiumHeader: React.FC<PremiumHeaderProps> = ({
  colors,
  isPremium,
  daysRemaining,
}) => {
  return (
    <LinearGradient
      colors={[colors.tint, '#764ba2']}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        
        <Text style={styles.headerTitle}>
          {isPremium ? 'Premium активен' : 'Monetaria Premium'}
        </Text>
        
        <Text style={styles.headerSubtitle}>
          {isPremium 
            ? `Подписка активна · ${daysRemaining} дней осталось`
            : 'Расширенные возможности для управления финансами'
          }
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 20, // Уменьшил с 60
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});