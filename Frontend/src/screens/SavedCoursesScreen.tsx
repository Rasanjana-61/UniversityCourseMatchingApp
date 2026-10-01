import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { BottomNavBar } from "../components/BottomNavBar";

export const SavedCoursesScreen: React.FC = () => {
  const { student, toggleSave, setCurrentScreen, setActiveTab } = useApp();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedCourses = async () => {
    setLoading(true);
    try {
      const res = await api.getSavedCourses(student.email);
      if (res && res.data) {
        setCourses(res.data);
      }
    } catch (e) {
      console.error("Error loading saved courses:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSavedCourses();
  }, [student.savedCourseIds]);

  const handleRemove = async (courseId: number) => {
    await toggleSave(courseId);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Saved Courses</Text>
          <Text style={styles.subtitle}>Review and compare your bookmarked university programmes</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={Brand.primary} style={{ marginVertical: 30 }} />
        ) : courses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="bookmark-outline" size={36} color={Brand.primary} />
            </View>
            <Text style={styles.emptyTitle}>No saved courses yet</Text>
            <Text style={styles.emptySubtitle}>
              Explore degree programmes and tap the bookmark icon to save your favourites here.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => {
                setActiveTab("search");
                setCurrentScreen("explore");
              }}
            >
              <Text style={styles.exploreBtnText}>Browse Courses</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {courses.map((course) => (
              <View key={course.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.univBadge}>
                    <Text style={styles.univBadgeText}>
                      {course.university_short_name || "UNIV"}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.univName}>{course.university_name}</Text>
                    <Text style={styles.univLoc}>{course.university_location}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemove(course.id)}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="bookmark" size={20} color={Brand.primary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.degreeDetails}>
                  {course.degree_type} • {course.duration_years} Years
                </Text>

                <View style={styles.footerRow}>
                  <Text style={styles.streamBadge}>{course.stream}</Text>
                  <Text style={styles.minZBadge}>Min Z: {course.min_z_score}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreBtn: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  univBadge: {
    backgroundColor: Brand.primaryLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  univBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Brand.primary,
  },
  univName: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.text,
  },
  univLoc: {
    fontSize: 10,
    color: Brand.textMuted,
  },
  removeBtn: {
    padding: 4,
  },
  courseName: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  degreeDetails: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streamBadge: {
    backgroundColor: "#F1F5F9",
    color: Brand.textSecondary,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  minZBadge: {
    fontSize: 11,
    color: Brand.primary,
    fontWeight: "600",
  },
});
