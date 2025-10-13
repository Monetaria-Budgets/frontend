import { Platform, StyleSheet, View } from 'react-native';

import { ThemedGradientView } from '@/components/themed-gradient-view';
import { InCreatingTable } from '@/components/in-creating-table';

export default function CurrenciesScreen() {

  return (
    <ThemedGradientView style={styles.container}>
      <InCreatingTable>
        Страница валют
      </InCreatingTable>
    </ThemedGradientView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
})
