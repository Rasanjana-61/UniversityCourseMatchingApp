import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { BottomNavBar } from "../components/BottomNavBar";

export const AssessmentRecommendationsScreen: React.FC = () => {
  const { setCurrentScreen, student, setSelectedCourseId } = useApp();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      // Fetch some courses that match the user's stream to mock recommendations
      const res = await api.getCourses({ stream: student.stream });
      if (res && res.success && res.data.length > 0) {
        // Just take the top 3 as a mock
        setCourses(res.data.slice(0, 3));
      }
    } catch (e) {
      console.error("Error loading recommendations:", e);
    } finally {
      setLoading(false);
    }
  };

  const getMockScore = (index: number) => {
    if (index === 0) return 92;
    if (index === 1) return 87;
    return 79;
  };

  const getMockBgColor = (index: number) => {
    if (index === 0) return "#F0FDF4"; // Green tint
    if (index === 1) return "#EFF6FF"; // Blue tint
    return "#FFFBEB"; // Orange tint
  };

  const getMockBorderColor = (index: number) => {
    if (index === 0) return "#DCFCE7";
    if (index === 1) return "#DBEAFE";
    return "#FEF3C7";
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top Blue Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setCurrentScreen("assessment-profile")}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Recommended for You</Text>
          <Text style={styles.headerSubtitle}>Based on your interests and strengths.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Brand.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listContainer}>
            {courses.map((course, index) => {
              const score = getMockScore(index);
              const bgColor = getMockBgColor(index);
              const borderColor = getMockBorderColor(index);
              
              return (
                <TouchableOpacity 
                  key={course.id} 
                  style={[styles.card, { backgroundColor: bgColor, borderColor: borderColor }]}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedCourseId(course.id);
                    setCurrentScreen("course-details");
                  }}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.courseTitle}>{course.name}</Text>
                    <View style={[styles.scoreBadge, { backgroundColor: index === 0 ? "#059669" : index === 1 ? "#2563EB" : "#D97706" }]}>
                      <Text style={styles.scoreText}>{score}%</Text>
                    </View>
                  </View>

                  {/* Fit Pills */}
                  <View style={styles.fitPillsRow}>
                    <View style={styles.fitPill}>
                      <View style={[styles.dot, { backgroundColor: "#059669" }]} />
                      <Text style={styles.fitPillText}>Academic fit</Text>
                    </View>
                    <View style={styles.fitPill}>
                      <View style={[styles.dot, { backgroundColor: "#2563EB" }]} />
                      <Text style={styles.fitPillText}>Interest fit</Text>
                    </View>
                    <View style={styles.fitPill}>
                      <View style={[styles.dot, { backgroundColor: "#059669" }]} />
                      <Text style={styles.fitPillText}>Career fit</Text>
                    </View>
                  </View>

                  <Text style={styles.summaryText}>
                    {index === 0 ? "Technology + problem solving • Career fit: High" : 
                     index === 1 ? "Analysis + systems thinking • Career fit: High" : 
                     "Business + data • Career fit: Good"}
                  </Text>

                  {/* Why this matches you */}
                  <View style={styles.whyBox}>
                    <Text style={styles.whyBoxTitle}>Why this matches you</Text>
                    <Text style={styles.whyBoxText}>
                      A/L stream: {student.stream} • Subject results:{" "}
                      {student.subjects && student.subjects.length > 0 
                        ? student.subjects.map(s => `${s.name} ${s.grade}`).join(", ") 
                        : "N/A"}{" "}
                      • Interests: Coding, problem solving, tech • Career preference: Software development • Z-score context: Strong fit for engineering and computing pathways.
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {!loading && courses.length > 0 && (
          <TouchableOpacity style={styles.compareBtn}>
            <Text style={styles.compareBtnText}>Compare Top Matches</Text>
          </TouchableOpacity>
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
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Brand.text,
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  fitPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  fitPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  fitPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: Brand.text,
  },
  summaryText: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginBottom: 16,
  },
  whyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  whyBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 6,
  },
  whyBoxText: {
    fontSize: 12,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  compareBtn: {
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
  compareBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
