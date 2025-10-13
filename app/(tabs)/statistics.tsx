import { Platform, StyleSheet, View } from 'react-native';

import { ThemedGradientView } from '@/components/themed-gradient-view';
import { InCreatingTable } from '@/components/in-creating-table';


export default function StatisticsScreen() {
  return (
    <ThemedGradientView style={styles.container}>
      <InCreatingTable>
        Страница статистики
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
  }
})
