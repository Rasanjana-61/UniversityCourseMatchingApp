import React, { useEffect, useState } from "react";
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

export const CompareCoursesScreen: React.FC = () => {
  const {
    setCurrentScreen,
    comparisonCourseIds,
    setComparisonCourseIds,
    toggleComparisonCourse,
  } = useApp();

  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await api.getCourses();
      if (res && res.data) {
        setAllCourses(res.data);
        // If nothing is selected yet, pre-select first 2 for demonstration
        if (comparisonCourseIds.length === 0 && res.data.length >= 2) {
          setComparisonCourseIds([res.data[0].id, res.data[1].id]);
        }
      }
    } catch (e) {
      console.error("Error loading courses:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectedCourses = allCourses.filter((c) =>
    comparisonCourseIds.includes(c.id)
  );

  const availableToAdd = allCourses.filter(
    (c) => !comparisonCourseIds.includes(c.id)
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Blue Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen("explore")}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Compare Courses</Text>
          <Text style={styles.headerSubtitle}>Select up to three programmes.</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={Brand.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* List of currently selected courses */}
            {selectedCourses.map((course) => (
              <View key={course.id} style={styles.selectedCourseCard}>
                <View style={styles.cardInfo}>
                  <Text style={styles.courseTitle}>{course.name}</Text>
                  <Text style={styles.courseSubtitle}>
                    {course.university_name || course.university_short_name} • Selected
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.selectedPill}
                  onPress={() => toggleComparisonCourse(course.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectedPillText}>Selected</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add another course card */}
            {comparisonCourseIds.length < 3 && (
              <TouchableOpacity
                style={styles.addCard}
                onPress={() => setShowAddModal(true)}
                activeOpacity={0.8}
              >
                <View style={styles.cardInfo}>
                  <Text style={styles.addTitle}>Add another</Text>
                  <Text style={styles.addSubtitle}>+ Select course</Text>
                </View>
                <View style={styles.addPill}>
                  <Text style={styles.addPillText}>+ Add</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Compare Button */}
            <TouchableOpacity
              style={[
                styles.compareButton,
                comparisonCourseIds.length < 2 && styles.compareButtonDisabled,
              ]}
              disabled={comparisonCourseIds.length < 2}
              onPress={() => setCurrentScreen("course-comparison")}
              activeOpacity={0.85}
            >
              <Text style={styles.compareButtonText}>Compare</Text>
            </TouchableOpacity>

            {/* Quick Picker Modal/List if user tapped Add */}
            {showAddModal && (
              <View style={styles.pickerSection}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Choose a Course to Add</Text>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}>
                    <Ionicons name="close-circle" size={24} color={Brand.textMuted} />
                  </TouchableOpacity>
                </View>
                {availableToAdd.slice(0, 8).map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.pickerItem}
                    onPress={() => {
                      toggleComparisonCourse(c.id);
                      setShowAddModal(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickerItemTitle}>{c.name}</Text>
                      <Text style={styles.pickerItemSub}>
                        {c.university_short_name} • {c.stream}
                      </Text>
                    </View>
                    <Ionicons name="add-circle-outline" size={22} color={Brand.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  selectedCourseCard: {
    backgroundColor: "#F0FDF4", // pale green tint matching UI mockup
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardInfo: {
    flex: 1,
    marginRight: 10,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  courseSubtitle: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
  selectedPill: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  selectedPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  addCard: {
    backgroundColor: "#EFF6FF", // soft blue tint matching UI mockup
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DBEAFE",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  addSubtitle: {
    fontSize: 12,
    color: Brand.primary,
    fontWeight: "500",
  },
  addPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  addPillText: {
    color: Brand.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  compareButton: {
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
  compareButtonDisabled: {
    opacity: 0.5,
  },
  compareButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  pickerSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.text,
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
  },
  pickerItemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.text,
  },
  pickerItemSub: {
    fontSize: 11,
    color: Brand.textSecondary,
    marginTop: 2,
  },
});
