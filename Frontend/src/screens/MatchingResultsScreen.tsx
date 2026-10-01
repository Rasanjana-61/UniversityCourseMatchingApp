import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { BottomNavBar } from "../components/BottomNavBar";

export const MatchingResultsScreen: React.FC = () => {
  const { student, matchResults, setCurrentScreen, toggleSave, isCourseSaved } = useApp();
  const [filter, setFilter] = useState<string>("all");

  const allCourses = matchResults?.all || [];

  const filteredCourses = allCourses.filter((course: any) => {
    if (filter === "all") return true;
    if (filter === "safe") return course.matchStatus === "safe";
    if (filter === "target") return course.matchStatus === "target";
    if (filter === "reach") return course.matchStatus === "reach";
    return true;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "safe":
        return { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" };
      case "target":
        return { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" };
      case "reach":
        return { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A" };
      default:
        return { bg: "#F1F5F9", text: "#64748B", border: "#E2E8F0" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen("results-entry")}
          >
            <Ionicons name="arrow-back" size={22} color={Brand.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.title}>Matching Courses</Text>
            <Text style={styles.subtitle}>
              Z-Score: {student.zScore.toFixed(4)} • {student.district}
            </Text>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {[
            { id: "all", label: `All (${allCourses.length})` },
            { id: "target", label: "Eligible (Target)" },
            { id: "safe", label: "High Chance" },
            { id: "reach", label: "Borderline (Reach)" },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.filterChip, filter === item.id && styles.filterChipActive]}
              onPress={() => setFilter(item.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === item.id && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results List */}
        <View style={styles.listContainer}>
          {filteredCourses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={42} color={Brand.textMuted} />
              <Text style={styles.emptyTitle}>No courses found</Text>
              <Text style={styles.emptySubtitle}>Try changing filter or adjusting your criteria.</Text>
            </View>
          ) : (
            filteredCourses.map((course: any) => {
              const saved = isCourseSaved(course.id);
              const badge = getStatusBadgeStyle(course.matchStatus);

              return (
                <View key={course.id} style={styles.courseCard}>
                  {/* Card Header */}
                  <View style={styles.courseHeader}>
                    <View style={styles.universityBadge}>
                      <Text style={styles.universityBadgeText}>
                        {course.university_short_name || "UNIV"}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.universityName}>{course.university_name}</Text>
                      <Text style={styles.locationText}>{course.university_location}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.bookmarkButton}
                      onPress={() => toggleSave(course.id)}
                    >
                      <Ionicons
                        name={saved ? "bookmark" : "bookmark-outline"}
                        size={20}
                        color={saved ? Brand.primary : Brand.textMuted}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Course Title */}
                  <Text style={styles.courseTitle}>{course.name}</Text>
                  <Text style={styles.degreeType}>
                    {course.degree_type} • {course.duration_years} Years
                  </Text>

                  {/* Badges Row */}
                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: badge.bg, borderColor: badge.border },
                      ]}
                    >
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {course.matchStatusLabel}
                      </Text>
                    </View>

                    <View style={styles.scoreBadge}>
                      <Text style={styles.scoreBadgeText}>{course.matchScore}% Match</Text>
                    </View>

                    <View style={styles.cutoffBadge}>
                      <Text style={styles.cutoffText}>Cutoff: {course.requiredCutoff}</Text>
                    </View>
                  </View>

                  {/* Career tags */}
                  {course.career_paths && course.career_paths.length > 0 && (
                    <View style={styles.careerRow}>
                      {course.career_paths.slice(0, 3).map((career: string, idx: number) => (
                        <View key={idx} style={styles.careerPill}>
                          <Text style={styles.careerPillText}>{career}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  filterScroll: {
    marginBottom: 18,
  },
  filterContainer: {
    gap: 8,
  },
  filterChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: Brand.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listContainer: {
    gap: 14,
  },
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  universityBadge: {
    backgroundColor: Brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  universityBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Brand.primary,
  },
  universityName: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.text,
  },
  locationText: {
    fontSize: 11,
    color: Brand.textMuted,
  },
  bookmarkButton: {
    padding: 4,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  degreeType: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  scoreBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  scoreBadgeText: {
    fontSize: 11,
    color: Brand.primary,
    fontWeight: "700",
  },
  cutoffBadge: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cutoffText: {
    fontSize: 11,
    color: Brand.textSecondary,
    fontWeight: "500",
  },
  careerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 10,
  },
  careerPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  careerPillText: {
    fontSize: 11,
    color: Brand.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Brand.text,
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
    marginTop: 4,
  },
});
