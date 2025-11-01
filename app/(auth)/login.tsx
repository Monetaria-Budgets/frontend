import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function LoginScreen() {
  const { login, loading} = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(loginInput, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      Alert.alert(err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Image source={require("@/assets/logo.png")} style={styles.logo} />

          <TextInput
            placeholder="Ваш логин"
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={loginInput}
            onChangeText={setLoginInput}
          />
          <TextInput
            placeholder="Ваш пароль"
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity 
              onPress={handleLogin} 
              style={styles.buttonContainer}
              disabled={loading}    
          >
            <LinearGradient colors={["#007bff", "#0056d2"]} style={styles.button}>
              <Text style={styles.buttonText}>{loading ? "Вход..." : "Войти"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => Alert.alert("Функция восстановления пароля")}
          >
            <Text style={[styles.footerLink, { color: colors.tint }]}>
              Забыли пароль?
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
              <Text
                style={[
                  styles.footerLink,
                  styles.footerLinkActive,
                  { color: colors.tint },
                ]}
              >
                Нет аккаунта? Зарегистрироваться
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 30,
    resizeMode: "contain",
  },
  input: {
    width: "100%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  buttonContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 15,
  },
  button: {
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  footerLink: {
    fontSize: 14,
  },
  footerLinkActive: {
    fontWeight: "500",
    textAlign: "center",
  },
});