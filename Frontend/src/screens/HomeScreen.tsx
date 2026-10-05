import React, { useEffect, useState, useCallback } from "react";
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
import { api } from "../services/api";
import {
  getAnnouncementsLastSeen,
  countNewAnnouncements,
} from "../services/notificationsService";

export const HomeScreen: React.FC = () => {
  const { student, setCurrentScreen, setActiveTab } = useApp();
  const [notifCount, setNotifCount] = useState(0);

  const fetchCounts = useCallback(async () => {
    let total = 0;
    // 1. Global announcements: only count ones NEWER than last_seen
    const [globalRes, lastSeen] = await Promise.all([
      api.getNotifications(),
      getAnnouncementsLastSeen(),
    ]);
    if (globalRes?.success && Array.isArray(globalRes.data)) {
      total += countNewAnnouncements(globalRes.data, lastSeen);
    }
    // 2. Personal inbox: unread inquiry replies from backend
    if (student.email) {
      const personalRes = await api.getStudentUnreadCount(student.email);
      if (personalRes?.success) total += personalRes.count ?? 0;
    }
    setNotifCount(total);
  }, [student.email]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Good morning, {student.fullName.split(" ")[0]}</Text>
            <Text style={styles.subGreeting}>Your personalized career journey starts here.</Text>
          </View>
          {/* Bell icon */}
          <TouchableOpacity
            style={styles.bellButton}
            onPress={() => setCurrentScreen("notifications")}
          >
            <Ionicons name="notifications-outline" size={22} color={Brand.primary} />
            {notifCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{notifCount > 99 ? "99+" : notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => {
              setActiveTab("profile");
              setCurrentScreen("profile");
            }}
          >
            <Ionicons name="person" size={20} color={Brand.primary} />
          </TouchableOpacity>
        </View>

        {/* Dashboard Status Cards */}
        <View style={styles.cardsContainer}>
          {/* Card 1: Complete your profile */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => setCurrentScreen("stream-select")}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Complete your profile</Text>
              <View style={styles.percentBadge}>
                <Text style={styles.percentText}>70%</Text>
              </View>
            </View>
            <Text style={styles.cardDescription}>Add your A/L results to improve course matches.</Text>
          </TouchableOpacity>

          {/* Card 2: Explore universities */}
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab("search");
              setCurrentScreen("explore");
            }}
          >
            <Text style={styles.cardTitle}>Explore universities</Text>
            <Text style={styles.cardDescription}>Compare programmes across Sri Lanka.</Text>
          </TouchableOpacity>

          {/* Card 3: Saved courses */}
          <TouchableOpacity
            style={[styles.card, styles.savedCard]}
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab("saved");
              setCurrentScreen("saved");
            }}
          >
            <Text style={styles.cardTitle}>Saved courses</Text>
            <Text style={styles.cardDescription}>
              {student.savedCourseIds.length} courses ready to review
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionsContainer}>
          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => setCurrentScreen("stream-select")}
            activeOpacity={0.85}
          >
            <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryActionText}>Find matching courses</Text>
          </TouchableOpacity>

          {/* Secondary Outline 1 */}
          <TouchableOpacity
            style={styles.outlineActionButton}
            onPress={() => setCurrentScreen("assessment-intro")}
            activeOpacity={0.85}
          >
            <Text style={styles.outlineActionText}>Start assessment</Text>
          </TouchableOpacity>

          {/* Secondary Outline 2: Compare Courses */}
          <TouchableOpacity
            style={styles.outlineActionButton}
            onPress={() => {
              setCurrentScreen("compare-courses");
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.outlineActionText}>Compare courses</Text>
          </TouchableOpacity>

          {/* Secondary Outline 3: Scholarships */}
          <TouchableOpacity
            style={styles.outlineActionButton}
            onPress={() => {
              setCurrentScreen("scholarships");
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.outlineActionText}>View Scholarships</Text>
          </TouchableOpacity>
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
    backgroundColor: Brand.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
    marginRight: 8,
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  bellBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  cardsContainer: {
    gap: 14,
    marginBottom: 28,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  savedCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Brand.text,
  },
  percentBadge: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  percentText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  cardDescription: {
    fontSize: 13,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  actionsContainer: {
    gap: 12,
  },
  primaryActionButton: {
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
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  outlineActionButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  outlineActionText: {
    color: Brand.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
