import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

export const CourseDetailsScreen: React.FC = () => {
  const { setCurrentScreen, selectedCourseId, toggleSave, isCourseSaved } = useApp();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      setSaved(isCourseSaved(selectedCourseId));
      loadCourseDetails();
    }
  }, [selectedCourseId]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getCourseById(selectedCourseId!);
      if (res && res.success) {
        setCourse(res.data);
      }
    } catch (e) {
      console.error("Error fetching course details:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (selectedCourseId) {
      setSaved(!saved); // optimistic
      await toggleSave(selectedCourseId);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen("explore")}>
            <Ionicons name="arrow-back" size={24} color={Brand.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen("explore")}>
            <Ionicons name="arrow-back" size={24} color={Brand.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Course details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mocking Z-Score Cutoff Chart Data (since we don't have historical data in DB)
  // Generating a fake trend around the min_z_score
  const currentZ = parseFloat(course.min_z_score) || 1.5;
  const chartData = [
    { year: "2021", score: (currentZ - 0.05).toFixed(4) },
    { year: "2022", score: (currentZ + 0.02).toFixed(4) },
    { year: "2023", score: currentZ.toFixed(4) },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen("explore")}>
            <View style={styles.backCircle}>
              <Ionicons name="arrow-back" size={20} color={Brand.text} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={handleToggleSave} style={styles.actionBtn}>
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={saved ? Brand.primary : Brand.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.univBadge}>
            <Ionicons name="school" size={14} color={Brand.primary} style={{ marginRight: 4 }} />
            <Text style={styles.univBadgeText}>{course.university_name}</Text>
          </View>
          <Text style={styles.courseName}>{course.name}</Text>
          <Text style={styles.degreeType}>
            {course.degree_type} • {course.duration_years} Years
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="stats-chart" size={20} color={Brand.primary} />
            <Text style={styles.statValue}>
              {course.min_z_score ? parseFloat(course.min_z_score).toFixed(4) : "—"}
            </Text>
            <Text style={styles.statLabel}>Min Z-Score</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="location" size={20} color={Brand.primary} />
            <Text style={styles.statValue}>{course.university_location}</Text>
            <Text style={styles.statLabel}>Location</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="book" size={20} color={Brand.primary} />
            <Text style={styles.statValue}>{course.stream}</Text>
            <Text style={styles.statLabel}>Stream</Text>
          </View>
        </View>

        {/* Description / Syllabus Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Syllabus & Overview</Text>
          <Text style={styles.descriptionText}>
            {course.description ||
              "This comprehensive degree programme equips students with theoretical knowledge and practical skills required for the modern industry. Students will engage in lectures, practical sessions, and industry placements."}
          </Text>
        </View>

        {/* Career Opportunities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Career Opportunities</Text>
          <View style={styles.careerGrid}>
            {course.career_paths && course.career_paths.length > 0 ? (
              course.career_paths.map((career: string, index: number) => (
                <View key={index} style={styles.careerCard}>
                  <Ionicons name="briefcase-outline" size={16} color={Brand.primaryDark} style={{ marginRight: 8 }} />
                  <Text style={styles.careerText}>{career}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.descriptionText}>Various opportunities in related industries.</Text>
            )}
          </View>
        </View>

        {/* Z-Score Trend Chart (Mock) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Z-Score Cutoff Trend (Last 3 Years)</Text>
          <View style={styles.chartContainer}>
            {chartData.map((data, index) => {
              // Calculate relative height for visual effect (base 1.0)
              const heightPercent = Math.max(30, (parseFloat(data.score) / 3.0) * 100);
              return (
                <View key={index} style={styles.chartBarCol}>
                  <Text style={styles.chartBarValue}>{data.score}</Text>
                  <View style={[styles.chartBar, { height: `${heightPercent}%` as any }]} />
                  <Text style={styles.chartBarLabel}>{data.year}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Feature Action Buttons: Admission Requirements, Career Details & Compare */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.admissionActionButton}
            onPress={() => setCurrentScreen("admission-requirements")}
            activeOpacity={0.85}
          >
            <Ionicons name="document-text" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.admissionActionButtonText}>View Admission Requirements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={() => setCurrentScreen("career-details")}
            activeOpacity={0.85}
          >
            <Ionicons name="briefcase" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryActionButtonText}>View Career & Salary Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => {
              if (course && course.id) {
                // If not in comparison, add it
                setCurrentScreen("compare-courses");
              }
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="git-compare-outline" size={18} color={Brand.primary} style={{ marginRight: 8 }} />
            <Text style={styles.secondaryActionButtonText}>Compare with other Courses</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#EF4444", fontSize: 16 },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 10,
  },
  backButton: { padding: 4 },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcons: { flexDirection: "row", gap: 10 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  univBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.primaryLight,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  univBadgeText: {
    color: Brand.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  courseName: {
    fontSize: 24,
    fontWeight: "800",
    color: Brand.text,
    marginBottom: 6,
    lineHeight: 32,
  },
  degreeType: {
    fontSize: 14,
    color: Brand.textSecondary,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    marginTop: 8,
    marginBottom: 2,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 11,
    color: Brand.textMuted,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    marginTop: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Brand.cardBorder,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: Brand.textSecondary,
    lineHeight: 22,
  },
  careerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  careerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  careerText: {
    fontSize: 13,
    fontWeight: "500",
    color: Brand.text,
  },
  chartContainer: {
    height: 180,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    paddingTop: 30,
  },
  chartBarCol: {
    alignItems: "center",
    width: 60,
    height: "100%",
    justifyContent: "flex-end",
  },
  chartBarValue: {
    fontSize: 12,
    fontWeight: "700",
    color: Brand.primary,
    marginBottom: 6,
  },
  chartBar: {
    width: 32,
    backgroundColor: Brand.primary,
    borderRadius: 6,
    marginBottom: 8,
    minHeight: 10,
  },
  chartBarLabel: {
    fontSize: 12,
    color: Brand.textSecondary,
    fontWeight: "500",
  },
  actionButtonsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  admissionActionButton: {
    backgroundColor: "#1D4ED8",
    flexDirection: "row",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#1D4ED8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  admissionActionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryActionButton: {
    backgroundColor: Brand.primary,
    flexDirection: "row",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryActionButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryActionButtonText: {
    color: Brand.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});
