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

interface JobItem {
  id: string;
  title: string;
  subtitle: string;
  demandBadge: string;
  badgeType: "high" | "medium" | "neutral";
}

const JOBS_DATA: JobItem[] = [
  {
    id: "1",
    title: "Software Engineer",
    subtitle: "Entry-level opportunities • Demand: High",
    demandBadge: "High demand",
    badgeType: "high",
  },
  {
    id: "2",
    title: "QA Engineer",
    subtitle: "Testing and automation • Demand: Medium",
    demandBadge: "Medium demand",
    badgeType: "medium",
  },
  {
    id: "3",
    title: "Data / Systems Roles",
    subtitle: "Demand varies by specialization",
    demandBadge: "Varies by role",
    badgeType: "neutral",
  },
  {
    id: "4",
    title: "Product & Support",
    subtitle: "Technical consulting • Customer engineering",
    demandBadge: "Varies by role",
    badgeType: "neutral",
  },
];

export const JobOpportunitiesScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  const getBadgeStyle = (type: "high" | "medium" | "neutral") => {
    switch (type) {
      case "high":
        return {
          bg: "#DCFCE7",
          text: "#15803D",
          border: "#86EFAC",
        };
      case "medium":
        return {
          bg: "#EFF6FF",
          text: "#1D4ED8",
          border: "#93C5FD",
        };
      default:
        return {
          bg: "#F1F5F9",
          text: "#64748B",
          border: "#CBD5E1",
        };
    }
  };

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
          <Text style={styles.headerTitle}>Job Opportunities</Text>
          <Text style={styles.headerSubtitle}>Current pathways for software graduates</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {JOBS_DATA.map((job) => {
          const badgeStyle = getBadgeStyle(job.badgeType);
          return (
            <View key={job.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <View
                  style={[
                    styles.demandBadge,
                    { backgroundColor: badgeStyle.bg, borderColor: badgeStyle.border },
                  ]}
                >
                  <Text style={[styles.demandBadgeText, { color: badgeStyle.text }]}>
                    {job.demandBadge}
                  </Text>
                </View>
              </View>
              <Text style={styles.jobSubtitle}>{job.subtitle}</Text>
            </View>
          );
        })}
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
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    flex: 1,
    marginRight: 8,
  },
  demandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  demandBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  jobSubtitle: {
    fontSize: 12,
    color: Brand.textSecondary,
    lineHeight: 16,
  },
});
