import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { BottomNavBar } from "../components/BottomNavBar";

export const AssessmentProfileScreen: React.FC = () => {
  const { setCurrentScreen, assessmentScores } = useApp();

  const scores = assessmentScores || {
    Technology: 85,
    Business: 65,
    Creative: 45,
    Social: 35,
  };

  const PROFILES = [
    {
      key: "Technology",
      title: "Technology",
      desc: "Systems, logic and digital problem solving",
      color: "#2563EB", // Brand primary (blue)
      bgColor: "#F8FAFC",
      score: scores.Technology,
    },
    {
      key: "Business",
      title: "Business",
      desc: "Strategy, leadership and decision making",
      color: "#059669", // Green
      bgColor: "#F0FDF4",
      score: scores.Business,
    },
    {
      key: "Creative",
      title: "Creative",
      desc: "Ideas, communication and design",
      color: "#D97706", // Orange
      bgColor: "#FFFBEB",
      score: scores.Creative,
    },
    {
      key: "Social",
      title: "Social",
      desc: "Helping, teaching and collaboration",
      color: "#4F46E5", // Indigo
      bgColor: "#EEF2FF",
      score: scores.Social,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen("assessment-questions")}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Your Interest Profile</Text>
          <Text style={styles.headerSubtitle}>Assessment complete • Great work!</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {PROFILES.map((prof) => (
            <View key={prof.key} style={[styles.profileCard, { backgroundColor: prof.bgColor }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>{prof.title}</Text>
                <View style={[styles.scoreBadge, { backgroundColor: prof.color }]}>
                  <Text style={styles.scoreBadgeText}>{prof.score}%</Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Interest score</Text>
                <Text style={[styles.progressVal, { color: prof.color }]}>{prof.score}%</Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { backgroundColor: prof.color, width: `${prof.score}%` }]} />
              </View>

              <Text style={styles.cardDesc}>{prof.desc}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.viewRecommendationsBtn}
          onPress={() => setCurrentScreen("assessment-recommendations")}
          activeOpacity={0.8}
        >
          <Text style={styles.viewRecommendationsText}>View Recommendations</Text>
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  listContainer: {
    gap: 16,
    marginBottom: 32,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: Brand.textSecondary,
    fontWeight: "500",
  },
  progressVal: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  viewRecommendationsBtn: {
    backgroundColor: Brand.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  viewRecommendationsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
