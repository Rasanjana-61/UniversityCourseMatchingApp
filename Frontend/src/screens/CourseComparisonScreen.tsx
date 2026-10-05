import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { BottomNavBar } from "../components/BottomNavBar";

export const CourseComparisonScreen: React.FC = () => {
  const { setCurrentScreen, comparisonCourseIds, toggleSave } = useApp();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComparisonData();
  }, [comparisonCourseIds]);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      if (comparisonCourseIds.length === 0) {
        setCourses([]);
        return;
      }
      const fetched = await Promise.all(
        comparisonCourseIds.map((id) => api.getCourseById(id))
      );
      const validCourses = fetched
        .filter((res) => res && res.success)
        .map((res) => res.data);
      setCourses(validCourses);
    } catch (e) {
      console.error("Error loading comparison details:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveComparison = () => {
    courses.forEach((c) => {
      toggleSave(c.id);
    });
    Alert.alert("Success", "Courses in this comparison have been saved to your Bookmarks!");
  };

  const titleText =
    courses.length >= 2
      ? `${courses[0].name} vs ${courses[1].name}`
      : "Comparison Details";

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Blue Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen("compare-courses")}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Course Comparison</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {titleText}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Brand.primary} style={{ marginTop: 40 }} />
        ) : courses.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No courses selected to compare.</Text>
          </View>
        ) : (
          <>
            {/* Row 1: Entry Requirements */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Entry Requirements</Text>
              <Text style={styles.cardContent}>
                {courses.map((c) => `3 passes + Z-score ${parseFloat(c.min_z_score).toFixed(2)}`).join(" | ")}
              </Text>
            </View>

            {/* Row 2: Study & Cost */}
            <View style={[styles.card, styles.blueTintCard]}>
              <Text style={styles.cardTitle}>Study & Cost</Text>
              <Text style={styles.cardContent}>
                {courses.map((c) => `${c.duration_years || 4} years • State/Public`).join(" | ")}
              </Text>
            </View>

            {/* Row 3: Career Outcomes */}
            <View style={[styles.card, styles.greenTintCard]}>
              <Text style={styles.cardTitle}>Career Outcomes</Text>
              <Text style={styles.cardContent}>
                {courses
                  .map((c) => {
                    const careers = c.career_paths || ["Software", "Data"];
                    return careers.slice(0, 2).join(", ");
                  })
                  .join(" | ")}
              </Text>
            </View>

            {/* Row 4: Location */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Location</Text>
              <Text style={styles.cardContent}>
                {courses
                  .map((c) => c.university_location || c.university_name || "Sri Lanka")
                  .join(" | ")}
              </Text>
            </View>

            {/* Save comparison action button */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveComparison}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Save comparison</Text>
            </TouchableOpacity>
          </>
        )}
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
  center: {
    paddingVertical: 50,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Brand.textSecondary,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  blueTintCard: {
    backgroundColor: "#F8FAFC",
  },
  greenTintCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 13,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: Brand.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 10,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
