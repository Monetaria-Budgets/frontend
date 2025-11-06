import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PremiumCardProps {
  isPremium: boolean;
  hadPremiumBefore: boolean;
  subscriptionEnd?: string;
  daysRemaining?: number;
  onUpgrade: () => void;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  isPremium,
  hadPremiumBefore,
  subscriptionEnd,
  daysRemaining,
  onUpgrade
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Неизвестно';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (!isPremium) {
    return (
      <View style={[styles.premiumCard, { backgroundColor: colors.tint + '15', borderColor: colors.tint + '30' }]}>
        <View style={styles.premiumHeader}>
          <View style={styles.premiumTitleContainer}>
            <Ionicons name="diamond" size={24} color={colors.tint} />
            <Text style={[styles.premiumTitle, { color: colors.tint }]}>
              Премиум подписка
            </Text>
          </View>
          <View style={[styles.premiumBadge, { backgroundColor: colors.tint }]}>
            <Text style={styles.premiumBadgeText}>PRO</Text>
          </View>
        </View>
        
        <Text style={[styles.premiumSubtitle, { color: colors.icon }]}>
          Откройте все возможности приложения
        </Text>
        
        <View style={styles.premiumBenefits}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color={colors.tint} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Неограниченное количество категорий
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color={colors.tint} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Лимиты на все категории
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={18} color={colors.tint} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Расширенная аналитика
            </Text>
          </View>
        </View>

        <View style={styles.pricingContainer}>
          <Text style={[styles.pricingTitle, { color: colors.text }]}>
            Стоимость подписки:
          </Text>
          <View style={styles.pricingRow}>
            <Text style={[styles.pricingAmount, { color: colors.tint }]}>
              {hadPremiumBefore ? '199 ₽' : '99 ₽'}
            </Text>
            <Text style={[styles.pricingPeriod, { color: colors.icon }]}>
              / месяц
            </Text>
            {!hadPremiumBefore && (
              <View style={[styles.discountBadge, { backgroundColor: '#4ECDC4' }]}>
                <Text style={styles.discountBadgeText}>СКИДКА 50%</Text>
              </View>
            )}
          </View>
          {hadPremiumBefore ? (
            <Text style={[styles.regularPriceNote, { color: colors.icon }]}>
              Стандартная цена для продления
            </Text>
          ) : (
            <Text style={[styles.discountNote, { color: colors.icon }]}>
              Специальная цена для новых пользователей
            </Text>
          )}
        </View>
        
        <Pressable
          style={({ pressed }) => [
            styles.premiumButton,
            { backgroundColor: colors.tint },
            pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
          ]}
          onPress={onUpgrade}
        >
          <Text style={styles.premiumButtonText}>
            {hadPremiumBefore ? 'Продлить подписку за 199 ₽' : 'Попробовать за 99 ₽'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>

        {/* Дополнительная информация для тех, у кого уже был премиум */}
        {hadPremiumBefore && (
          <View style={styles.previousUserInfo}>
            <Ionicons name="information-circle" size={16} color={colors.icon} />
            <Text style={[styles.previousUserText, { color: colors.icon }]}>
              У вас уже была подписка ранее. При продлении применяется стандартный тариф.
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.premiumActiveCard, { backgroundColor: colors.tint + '15', borderColor: colors.tint + '30' }]}>
      <View style={styles.premiumActiveHeader}>
        <Ionicons name="diamond" size={32} color={colors.tint} />
        <View>
          <Text style={[styles.premiumActiveTitle, { color: colors.tint }]}>
            Премиум активен
          </Text>
          {subscriptionEnd && (
            <Text style={[styles.premiumActiveSubtitle, { color: colors.icon }]}>
              До: {formatDate(subscriptionEnd)}
            </Text>
          )}
          {daysRemaining !== undefined && (
            <Text style={[styles.daysRemaining, { color: colors.tint }]}>
              Осталось дней: {daysRemaining}
            </Text>
          )}
        </View>
      </View>
      <Text style={[styles.premiumActiveText, { color: colors.text }]}>
        Вы используете все возможности приложения
      </Text>
      
      <View style={styles.activeBenefits}>
        <View style={styles.activeBenefitItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.tint} />
          <Text style={[styles.activeBenefitText, { color: colors.text }]}>
            Неограниченные категории
          </Text>
        </View>
        <View style={styles.activeBenefitItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.tint} />
          <Text style={[styles.activeBenefitText, { color: colors.text }]}>
            Расширенные лимиты
          </Text>
        </View>
        <View style={styles.activeBenefitItem}>
          <Ionicons name="checkmark-circle" size={16} color={colors.tint} />
          <Text style={[styles.activeBenefitText, { color: colors.text }]}>
            Приоритетная поддержка
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  premiumCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  premiumSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  premiumBenefits: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  pricingContainer: {
    marginTop: 8,
  },
  pricingTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  pricingAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  pricingPeriod: {
    fontSize: 14,
    fontWeight: '500',
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  discountNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  regularPriceNote: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previousUserInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 8,
  },
  previousUserText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  premiumActiveCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  premiumActiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumActiveTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  premiumActiveSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  daysRemaining: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  premiumActiveText: {
    fontSize: 14,
    lineHeight: 20,
  },
  activeBenefits: {
    marginTop: 8,
    gap: 6,
  },
  activeBenefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeBenefitText: {
    fontSize: 13,
    fontWeight: '500',
  },
});