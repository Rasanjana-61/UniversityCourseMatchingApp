import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { BottomNavBar } from "../components/BottomNavBar";

interface SalaryLevel {
  id: string;
  level: string;
  experience: string;
  rangeBadge: string;
  badgeColor: string;
  badgeTextColor: string;
}

const SALARY_LEVELS: SalaryLevel[] = [
  {
    id: "1",
    level: "Entry Level",
    experience: "0-2 years experience",
    rangeBadge: "LKR 80k-150k",
    badgeColor: "#1D4ED8",
    badgeTextColor: "#FFFFFF",
  },
  {
    id: "2",
    level: "Mid Level",
    experience: "2-5 years experience",
    rangeBadge: "LKR 150k-350k",
    badgeColor: "#2563EB",
    badgeTextColor: "#FFFFFF",
  },
  {
    id: "3",
    level: "Senior Level",
    experience: "5+ years and leadership",
    rangeBadge: "LKR 400k+",
    badgeColor: "#15803D",
    badgeTextColor: "#FFFFFF",
  },
];

export const SalaryInfoScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Blue Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen("career-details")}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Salary Information</Text>
          <Text style={styles.headerSubtitle}>Typical monthly salary progression in Sri Lanka</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {SALARY_LEVELS.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.levelTitle}>{item.level}</Text>
              <Text style={styles.experienceText}>{item.experience}</Text>
            </View>
            <View style={[styles.rangeBadge, { backgroundColor: item.badgeColor }]}>
              <Text style={[styles.rangeBadgeText, { color: item.badgeTextColor }]}>
                {item.rangeBadge}
              </Text>
            </View>
          </View>
        ))}

        {/* Source Card */}
        <View style={styles.sourceCard}>
          <Text style={styles.sourceTitle}>Source</Text>
          <Text style={styles.sourceText}>Industry salary survey • Updated Aug 2025</Text>
        </View>
      </ScrollView>

      {/* Persistent Bottom Nav */}
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 6,
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#DBEAFE",
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
  rangeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginLeft: 10,
  },
  rangeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  sourceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sourceTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
});
