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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";

export const ForgotPasswordScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSendReset = () => {
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* Top navigation */}
          <TouchableOpacity
            style={styles.backNav}
            onPress={() => setCurrentScreen("login")}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={Brand.primary} />
            <Text style={styles.backNavText}>Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.subtitle}>Enter your registered email to receive a reset link</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={Brand.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={Brand.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* How it works info card */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color={Brand.primary} style={styles.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>How it works</Text>
                <Text style={styles.infoSub}>
                  We'll send a secure password reset link to your email address. The link will expire after 30 minutes for your security.
                </Text>
              </View>
            </View>

            {sent ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={22} color={Brand.success} />
                <Text style={styles.successText}>Reset link sent! Please check your inbox.</Text>
              </View>
            ) : null}

            {/* Send Reset Link Button */}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendReset}
              activeOpacity={0.85}
            >
              <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.sendButtonText}>Send Reset Link</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Back to Login Secondary */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentScreen("login")}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={16} color={Brand.primary} style={{ marginRight: 6 }} />
              <Text style={styles.backButtonText}>Back to Login</Text>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Didn't receive the email? Check your spam folder or try again.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 20 : 15,
  },
  backNav: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  backNavText: {
    marginLeft: 6,
    color: Brand.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  header: {
    marginBottom: 28,
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
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 20,
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
  infoCard: {
    flexDirection: "row",
    backgroundColor: Brand.primaryLight,
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.primaryDark,
  },
  infoSub: {
    fontSize: 12,
    color: "#2563EB",
    marginTop: 4,
    lineHeight: 18,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.successLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  successText: {
    color: Brand.success,
    fontSize: 13,
    fontWeight: "500",
  },
  sendButton: {
    flexDirection: "row",
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
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  dividerText: {
    marginHorizontal: 12,
    color: Brand.textMuted,
    fontSize: 12,
  },
  backButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  backButtonText: {
    color: Brand.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  footerNote: {
    fontSize: 11,
    color: Brand.textMuted,
    textAlign: "center",
  },
});
