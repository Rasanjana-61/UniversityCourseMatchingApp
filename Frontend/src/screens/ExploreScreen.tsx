import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { BottomNavBar } from "../components/BottomNavBar";

export const ExploreScreen: React.FC = () => {
  const { toggleSave, isCourseSaved } = useApp();
  const [courses, setCourses] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [streamFilter, setStreamFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, univRes] = await Promise.all([
        api.getCourses({
          stream: streamFilter === "All" ? undefined : streamFilter,
          search: search || undefined,
        }),
        api.getUniversities(),
      ]);

      if (coursesRes && coursesRes.data) setCourses(coursesRes.data);
      if (univRes && univRes.data) setUniversities(univRes.data);
    } catch (e) {
      console.error("Error loading explore data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [streamFilter]);

  const handleSearch = () => {
    loadData();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore Programmes</Text>
          <Text style={styles.subtitle}>Discover degree courses across Sri Lankan Universities</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={18} color={Brand.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search degrees, universities..."
            placeholderTextColor={Brand.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => { setSearch(""); loadData(); }}>
              <Ionicons name="close-circle" size={18} color={Brand.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Stream Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {["All", "Physical Science", "Biological Science", "Commerce", "Arts", "Technology"].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.filterChip, streamFilter === s && styles.filterChipActive]}
              onPress={() => setStreamFilter(s)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  streamFilter === s && styles.filterChipTextActive,
                ]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Universities Horizontal List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Partner Universities</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {universities.map((u) => (
            <View key={u.id} style={styles.univCard}>
              <View style={styles.univIcon}>
                <Ionicons name="school-outline" size={20} color={Brand.primary} />
              </View>
              <Text style={styles.univShort}>{u.short_name}</Text>
              <Text style={styles.univName} numberOfLines={1}>{u.name}</Text>
              <Text style={styles.univCount}>{u.courses_count || 0} Programmes</Text>
            </View>
          ))}
        </ScrollView>

        {/* Courses Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Courses ({courses.length})</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={Brand.primary} style={{ marginVertical: 30 }} />
        ) : (
          <View style={styles.courseList}>
            {courses.map((course) => {
              const saved = isCourseSaved(course.id);
              return (
                <View key={course.id} style={styles.courseCard}>
                  <View style={styles.courseHeader}>
                    <View style={styles.univBadge}>
                      <Text style={styles.univBadgeText}>
                        {course.university_short_name || "UNIV"}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.courseUnivName}>{course.university_name}</Text>
                      <Text style={styles.courseLocation}>{course.university_location}</Text>
                    </View>
                    <TouchableOpacity onPress={() => toggleSave(course.id)}>
                      <Ionicons
                        name={saved ? "bookmark" : "bookmark-outline"}
                        size={20}
                        color={saved ? Brand.primary : Brand.textMuted}
                      />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.degreeDetails}>
                    {course.degree_type} • {course.duration_years} Years
                  </Text>
                  <Text style={styles.streamBadge}>{course.stream}</Text>
                </View>
              );
            })}
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
    marginBottom: 16,
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
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Brand.text,
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
    paddingVertical: 6,
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
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Brand.text,
  },
  univCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    padding: 12,
    width: 140,
    marginRight: 10,
  },
  univIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  univShort: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.primary,
  },
  univName: {
    fontSize: 11,
    color: Brand.textSecondary,
    marginTop: 2,
  },
  univCount: {
    fontSize: 10,
    color: Brand.textMuted,
    marginTop: 4,
  },
  courseList: {
    gap: 12,
  },
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  courseHeader: {
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
  courseUnivName: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.text,
  },
  courseLocation: {
    fontSize: 10,
    color: Brand.textMuted,
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
    marginBottom: 8,
  },
  streamBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F1F5F9",
    color: Brand.textSecondary,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
});
