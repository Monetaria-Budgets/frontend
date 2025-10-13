import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { StyleSheet, View, ViewProps } from "react-native";
import { ThemedText } from "./themed-text";

export function InCreatingTable({ children }: ViewProps) {
    const colorScheme = useColorScheme();
    const invertedScheme = colorScheme === 'light' ? 'dark' : 'light';

    return (
        <View style={[
            styles.card,
            { backgroundColor: Colors[invertedScheme ?? 'light'].background },
            { shadowColor: Colors[invertedScheme ?? 'light'].background }
        ]}>
            <ThemedText type='title' style={[
                styles.text, { color: Colors[invertedScheme ?? 'light'].text }
                ]}>
                {children}
            </ThemedText>
            <ThemedText type='title' style={[
                styles.text, { color: Colors[invertedScheme ?? 'light'].text }
                ]}>
                в разработке
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});