import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { BottomNavBar } from "../components/BottomNavBar";

export const AssessmentIntroScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen("home")}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Career Interest Assessment</Text>
          <Text style={styles.headerSubtitle}>Discover study paths that fit how you think and work.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Info Card */}
        <View style={styles.mainCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>10 questions</Text>
          </View>
          <Text style={styles.mainTitle}>
            Discover study paths that fit how you think and work.
          </Text>
          <Text style={styles.mainDesc}>
            A short, guided assessment for Sri Lankan A/L students to explore career directions and university courses that match your interests, strengths and preferred work areas.
          </Text>
          
          <View style={styles.progressRow}>
            <Text style={styles.progressTextBold}>Assessment progress</Text>
            <Text style={styles.progressText}>0 / 10 questions</Text>
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.featureCardLightBlue}>
          <Text style={styles.featureTitle}>What you'll discover</Text>
          <Text style={styles.featureDesc}>Your interests, strengths and preferred work areas.</Text>
        </View>

        <View style={styles.featureCardWhite}>
          <Text style={styles.featureTitle}>10 questions</Text>
          <Text style={styles.featureDesc}>About 5-10 minutes • No wrong answers</Text>
        </View>

        <View style={styles.featureCardGreen}>
          <Text style={styles.featureTitle}>Private & personal</Text>
          <Text style={styles.featureDesc}>Results are visible only to you.</Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={() => setCurrentScreen("assessment-questions")}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>Start Assessment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.howItWorksBtn}>
          <Text style={styles.howItWorksText}>How it works</Text>
        </TouchableOpacity>

      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.background,
  },
  header: {
    backgroundColor: Brand.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#E2E8F0",
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  badge: {
    backgroundColor: Brand.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  badgeText: {
    color: Brand.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Brand.text,
    marginBottom: 12,
    lineHeight: 28,
  },
  mainDesc: {
    fontSize: 14,
    color: Brand.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 16,
  },
  progressTextBold: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.text,
  },
  progressText: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  featureCardLightBlue: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  featureCardWhite: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  featureCardGreen: {
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  startButton: {
    backgroundColor: Brand.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  howItWorksBtn: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  howItWorksText: {
    color: Brand.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});
