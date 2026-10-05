import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";

export const WelcomeScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Center Hero */}
        <View style={styles.heroSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={48} color="#FFFFFF" />
          </View>

          <Text style={styles.title}>CAREER MATCH</Text>
          <Text style={styles.subtitle}>Career Guidance & University Course Matching</Text>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setCurrentScreen("login")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => setCurrentScreen("admin-login")}
            activeOpacity={0.85}
          >
            <View style={styles.adminBtnInner}>
              <Ionicons name="shield-checkmark" size={18} color={Brand.primary} style={{ marginRight: 6 }} />
              <Text style={styles.adminButtonText}>Admin Portal</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.footerText}>Find the right path for your future</Text>
        </View>
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Platform.OS === "ios" ? 40 : 30,
    backgroundColor: "#FFFFFF",
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: Brand.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Brand.primary,
    letterSpacing: 1.2,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Brand.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 20,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: Brand.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    fontSize: 12,
    color: Brand.textMuted,
    textAlign: "center",
  },
  adminButton: {
    width: "100%",
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  adminBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  adminButtonText: {
    color: Brand.primary,
    fontSize: 15,
    fontWeight: "700",
  },
});
