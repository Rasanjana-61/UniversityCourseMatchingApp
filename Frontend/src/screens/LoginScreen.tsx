import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";

export const LoginScreen: React.FC = () => {
  const { setCurrentScreen, updateStudent } = useApp();
  const [email, setEmail] = useState("nethmi@example.com");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (email) {
      updateStudent({ email });
    }
    setCurrentScreen("home");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to continue</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={Brand.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={Brand.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={Brand.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Brand.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={Brand.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Secure Info Card */}
            <View style={styles.securityCard}>
              <Ionicons name="shield-checkmark" size={20} color={Brand.primary} style={styles.shieldIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.securityTitle}>Login securely</Text>
                <Text style={styles.securitySub}>Your account and academic data stay protected.</Text>
              </View>
            </View>

            {/* Primary Login Button */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => setCurrentScreen("forgot-password")}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Create Account Outline Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => setCurrentScreen("register")}
              activeOpacity={0.85}
            >
              <Text style={styles.registerButtonText}>Create an account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 40 : 30,
    paddingBottom: 30,
    flexGrow: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: Brand.textSecondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Brand.text,
    height: "100%",
  },
  eyeIcon: {
    padding: 6,
  },
  securityCard: {
    flexDirection: "row",
    backgroundColor: Brand.primaryLight,
    padding: 14,
    borderRadius: 12,
    marginVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  shieldIcon: {
    marginRight: 12,
  },
  securityTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.primaryDark,
  },
  securitySub: {
    fontSize: 11,
    color: "#3B82F6",
    marginTop: 2,
  },
  loginButton: {
    backgroundColor: Brand.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotButton: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 24,
  },
  forgotText: {
    color: Brand.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  registerButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    color: Brand.text,
    fontSize: 15,
    fontWeight: "600",
  },
});
