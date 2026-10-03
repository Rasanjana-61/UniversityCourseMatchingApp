import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { BottomNavBar } from "../components/BottomNavBar";
import { UniversityLogo } from "../components/UniversityLogo";
import { useLiveRefresh } from "../hooks/use-live-refresh";

const STREAM_FILTERS = [
  "All",
  "Physical Science",
  "Biological Science",
  "Commerce",
  "Arts",
  "Technology",
];

type ViewMode = "universities" | "courses";

export const ExploreScreen: React.FC = () => {
  const { toggleSave, isCourseSaved, setSelectedCourseId, setSelectedUniversityId, setCurrentScreen } = useApp();
  const [courses, setCourses] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [streamFilter, setStreamFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("universities");
  const [expandedUniv, setExpandedUniv] = useState<number | null>(null);

  const refreshUniversities = useCallback(async (signal: AbortSignal) => {
    const res = await api.getUniversities(signal);
    if (!signal.aborted && res?.success) setUniversities(res.data);
  }, []);
  useLiveRefresh(refreshUniversities);

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [coursesRes, univRes] = await Promise.all([
        api.getCourses({
          stream: streamFilter === "All" ? undefined : streamFilter,
          search: search.trim() || undefined,
        }),
        api.getUniversities(),
      ]);
      if (coursesRes?.data) setCourses(coursesRes.data);
      if (univRes?.data) setUniversities(univRes.data);
    } catch (e) {
      console.error("Error loading explore data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [streamFilter, search]);

  useEffect(() => {
    loadData();
  }, [streamFilter]);

  const handleSearch = () => loadData();

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  // Group courses by university for universities view
  const coursesByUniv = universities.map((u) => ({
    ...u,
    courses: courses.filter((c) => c.university_id === u.id),
  }));

  const filteredUnivs = coursesByUniv.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.short_name.toLowerCase().includes(q) ||
      u.location.toLowerCase().includes(q) ||
      u.courses.some((c: any) => c.name.toLowerCase().includes(q))
    );
  });

  const STREAMS_CONFIG: Record<string, { color: string; icon: any; title: string }> = {
    "Physical Science": { color: "#2563EB", icon: "calculator-outline", title: "Physical Science" },
    "Biological Science": { color: "#059669", icon: "flask-outline", title: "Biological Science" },
    "Commerce": { color: "#D97706", icon: "briefcase-outline", title: "Commerce" },
    "Arts": { color: "#7C3AED", icon: "color-palette-outline", title: "Arts" },
    "Technology": { color: "#DC2626", icon: "hardware-chip-outline", title: "Technology" },
  };

  const getStreamColor = (st: string) => {
    if (!st) return Brand.primary;
    if (st.includes("Physical")) return "#2563EB";
    if (st.includes("Bio")) return "#059669";
    if (st.includes("Commerce")) return "#D97706";
    if (st.includes("Art")) return "#7C3AED";
    if (st.includes("Tech")) return "#DC2626";
    return Brand.primary;
  };

  const filteredCourses = courses.filter((c) => {
    if (streamFilter !== "All" && c.stream?.toLowerCase() !== streamFilter.toLowerCase()) {
      return false;
    }
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.code || "").toLowerCase().includes(q) ||
      (c.university_name || "").toLowerCase().includes(q) ||
      (c.stream || "").toLowerCase().includes(q)
    );
  });

  const getMinZLabel = (z: number | string | null | undefined) => {
    if (z === null || z === undefined || z === "") return "—";
    const num = typeof z === "number" ? z : parseFloat(String(z));
    if (isNaN(num)) return "—";
    return num.toFixed(4);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Brand.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore Universities</Text>
          <Text style={styles.subtitle}>
            Browse all government universities & degree programmes in Sri Lanka
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Brand.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search universities, courses..."
            placeholderTextColor={Brand.textMuted}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                loadData();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={Brand.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewToggleRow}>
          <TouchableOpacity
            style={[
              styles.viewToggleBtn,
              viewMode === "universities" && styles.viewToggleBtnActive,
            ]}
            onPress={() => setViewMode("universities")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="school-outline"
              size={15}
              color={viewMode === "universities" ? "#FFFFFF" : Brand.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.viewToggleText,
                viewMode === "universities" && styles.viewToggleTextActive,
              ]}
            >
              Universities
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewToggleBtn,
              viewMode === "courses" && styles.viewToggleBtnActive,
            ]}
            onPress={() => setViewMode("courses")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="library-outline"
              size={15}
              color={viewMode === "courses" ? "#FFFFFF" : Brand.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.viewToggleText,
                viewMode === "courses" && styles.viewToggleTextActive,
              ]}
            >
              All Courses
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Discovery Navigation Bar */}
        <View style={styles.quickNavRow}>
          <TouchableOpacity
            style={styles.quickNavChip}
            onPress={() => setCurrentScreen("compare-courses")}
            activeOpacity={0.8}
          >
            <Ionicons name="git-compare-outline" size={14} color={Brand.primary} style={{ marginRight: 6 }} />
            <Text style={styles.quickNavChipText}>Compare Courses</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickNavChip}
            onPress={() => setCurrentScreen("scholarships")}
            activeOpacity={0.8}
          >
            <Ionicons name="ribbon-outline" size={14} color="#D97706" style={{ marginRight: 6 }} />
            <Text style={[styles.quickNavChipText, { color: "#D97706" }]}>Scholarships</Text>
          </TouchableOpacity>
        </View>

        {/* Stream Filter Chips — shown in Courses view */}
        {viewMode === "courses" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {STREAM_FILTERS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.filterChip,
                  streamFilter === s && styles.filterChipActive,
                ]}
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
        )}

        {loading ? (
          <ActivityIndicator
            color={Brand.primary}
            size="large"
            style={{ marginVertical: 48 }}
          />
        ) : viewMode === "universities" ? (
          /* ── Universities View ── */
          <View style={styles.sectionList}>
            {filteredUnivs.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="school-outline" size={48} color={Brand.textMuted} />
                <Text style={styles.emptyTitle}>No universities found</Text>
                <Text style={styles.emptySub}>Try a different search term</Text>
              </View>
            ) : (
              filteredUnivs.map((u) => {
                const isExpanded = expandedUniv === u.id;
                return (
                  <View key={u.id} style={styles.univCard}>
                    {/* University Header Row */}
                    <TouchableOpacity
                      style={styles.univCardHeader}
                      onPress={() => {
                        setSelectedUniversityId(u.id);
                        setCurrentScreen("university-details");
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.univIconBox}>
                        <UniversityLogo
                          name={u.name}
                          shortName={u.short_name}
                          logoUrl={u.logo_url}
                          textStyle={styles.univShortText}
                        />
                      </View>
                      <View style={styles.univInfo}>
                        <Text style={styles.univName}>{u.name}</Text>
                        <View style={styles.univMetaRow}>
                          <Ionicons
                            name="location-outline"
                            size={12}
                            color={Brand.textMuted}
                          />
                          <Text style={styles.univMeta}>
                            {" "}{u.location}
                          </Text>
                          <View style={styles.metaDot} />
                          <Text style={styles.univMeta}>
                            {u.courses.length} Programmes
                          </Text>
                        </View>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={18}
                        color={Brand.textMuted}
                      />
                    </TouchableOpacity>

                    {/* University Description */}
                    {!isExpanded && u.description ? (
                      <Text style={styles.univDesc} numberOfLines={2}>
                        {u.description}
                      </Text>
                    ) : null}

                    {/* Expanded: show all courses of this university */}
                    {isExpanded && (
                      <View style={styles.univCoursesSection}>
                        <Text style={styles.coursesInUnivLabel}>
                          Available Programmes
                        </Text>
                        {u.description ? (
                          <Text style={styles.univDescExpanded}>
                            {u.description}
                          </Text>
                        ) : null}
                        {u.courses.length === 0 ? (
                          <Text style={styles.noCoursesText}>
                            No courses available
                          </Text>
                        ) : (
                          u.courses.map((course: any) => {
                            const saved = isCourseSaved(course.id);
                            return (
                              <TouchableOpacity
                                key={course.id}
                                style={styles.inlineCoursePill}
                                onPress={() => {
                                  setSelectedCourseId(course.id);
                                  setCurrentScreen("course-details");
                                }}
                                activeOpacity={0.8}
                              >
                                <View style={styles.inlineCourseLeft}>
                                  <Text style={styles.inlineCourseName}>
                                    {course.name}
                                  </Text>
                                  <View style={styles.inlineCourseMetaRow}>
                                    <Text style={styles.inlineCourseStream}>
                                      {course.stream}
                                    </Text>
                                    <View style={styles.metaDot} />
                                    <Text style={styles.inlineCourseZ}>
                                      Min Z: {getMinZLabel(course.min_z_score)}
                                    </Text>
                                    <View style={styles.metaDot} />
                                    <Text style={styles.inlineCourseYears}>
                                      {course.duration_years} Yrs
                                    </Text>
                                  </View>
                                </View>
                                <TouchableOpacity
                                  onPress={() => toggleSave(course.id)}
                                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                  <Ionicons
                                    name={saved ? "bookmark" : "bookmark-outline"}
                                    size={18}
                                    color={saved ? Brand.primary : Brand.textMuted}
                                  />
                                </TouchableOpacity>
                              </TouchableOpacity>
                            );
                          })
                        )}
                        {u.website ? (
                          <View style={styles.websiteRow}>
                            <Ionicons
                              name="globe-outline"
                              size={13}
                              color={Brand.primary}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={styles.websiteText}>{u.website}</Text>
                          </View>
                        ) : null}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        ) : (
          /* ── All Courses View ── */
          <View style={styles.sectionList}>
            <Text style={styles.courseCountLabel}>
              {filteredCourses.length} Programmes Found
            </Text>
            {filteredCourses.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="library-outline" size={48} color={Brand.textMuted} />
                <Text style={styles.emptyTitle}>No courses found</Text>
                <Text style={styles.emptySub}>
                  Try searching by degree name or university
                </Text>
              </View>
            ) : (
              (streamFilter === "All"
                ? Object.keys(STREAMS_CONFIG).filter((st) =>
                    filteredCourses.some((c) => c.stream?.toLowerCase() === st.toLowerCase())
                  )
                : [streamFilter]
              ).map((streamKey) => {
                const conf = STREAMS_CONFIG[streamKey] || {
                  color: Brand.primary,
                  icon: "book-outline",
                  title: streamKey,
                };
                const streamCourses = filteredCourses.filter(
                  (c) => c.stream?.toLowerCase() === streamKey.toLowerCase()
                );
                if (streamCourses.length === 0) return null;

                return (
                  <View key={streamKey} style={styles.categoryBlock}>
                    {/* Category Header */}
                    <View style={styles.categoryHeaderRow}>
                      <View style={[styles.categoryIconWrap, { backgroundColor: `${conf.color}15` }]}>
                        <Ionicons name={conf.icon} size={16} color={conf.color} />
                      </View>
                      <Text style={styles.categoryTitleText}>{conf.title}</Text>
                      <View style={[styles.categoryBadgeWrap, { backgroundColor: `${conf.color}15` }]}>
                        <Text style={[styles.categoryBadgeText, { color: conf.color }]}>
                          {streamCourses.length} {streamCourses.length === 1 ? "Program" : "Programs"}
                        </Text>
                      </View>
                    </View>

                    {/* Courses in this Category */}
                    {streamCourses.map((course) => {
                      const saved = isCourseSaved(course.id);
                      const sColor = getStreamColor(course.stream);
                      return (
                        <TouchableOpacity
                          key={course.id}
                          style={styles.courseCard}
                          onPress={() => {
                            setSelectedCourseId(course.id);
                            setCurrentScreen("course-details");
                          }}
                          activeOpacity={0.9}
                        >
                          {/* Course card header */}
                          <View style={styles.courseCardHeader}>
                            <View style={styles.univBadge}>
                              <Text style={styles.univBadgeText}>
                                {course.university_short_name || "UNIV"}
                              </Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                              <Text style={styles.courseUnivName}>
                                {course.university_name}
                              </Text>
                              <Text style={styles.courseLocation}>
                                {course.university_location}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => toggleSave(course.id)}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
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

                          {/* Bottom info row */}
                          <View style={styles.courseInfoRow}>
                            <View style={[styles.streamBadgeWrap, { backgroundColor: `${sColor}15` }]}>
                              <View style={[styles.streamDot, { backgroundColor: sColor }]} />
                              <Text style={[styles.streamBadge, { color: sColor }]}>{course.stream}</Text>
                            </View>
                            <View style={styles.zScoreWrap}>
                              <Ionicons
                                name="stats-chart-outline"
                                size={12}
                                color={Brand.primary}
                                style={{ marginRight: 3 }}
                              />
                              <Text style={styles.zScoreText}>
                                Min Z: {getMinZLabel(course.min_z_score)}
                              </Text>
                            </View>
                          </View>

                          {/* Career paths */}
                          {course.career_paths && course.career_paths.length > 0 && (
                            <View style={styles.careerRow}>
                              {course.career_paths.slice(0, 3).map(
                                (career: string, idx: number) => (
                                  <View key={idx} style={styles.careerPill}>
                                    <Text style={styles.careerPillText}>#{career}</Text>
                                  </View>
                                )
                              )}
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })
            )}
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
    paddingBottom: 32,
  },
  header: {
    marginBottom: 14,
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
    lineHeight: 18,
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
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Brand.text,
  },
  viewToggleRow: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },
  viewToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 9,
  },
  viewToggleBtnActive: {
    backgroundColor: Brand.primary,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  viewToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.textSecondary,
  },
  viewToggleTextActive: {
    color: "#FFFFFF",
  },
  quickNavRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  quickNavChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  quickNavChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.primary,
  },
  filterScroll: {
    marginBottom: 14,
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
  sectionList: {
    gap: 12,
  },
  courseCountLabel: {
    fontSize: 13,
    color: Brand.textSecondary,
    fontWeight: "500",
    marginBottom: 4,
  },

  /* ── University Cards ── */
  univCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  univCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  univIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  univShortText: {
    fontSize: 12,
    fontWeight: "800",
    color: Brand.primary,
    letterSpacing: 0.5,
  },
  univInfo: {
    flex: 1,
  },
  univName: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  univMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  univMeta: {
    fontSize: 11,
    color: Brand.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Brand.textMuted,
    marginHorizontal: 5,
  },
  univDesc: {
    fontSize: 12,
    color: Brand.textSecondary,
    lineHeight: 17,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  univCoursesSection: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  coursesInUnivLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Brand.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  univDescExpanded: {
    fontSize: 12,
    color: Brand.textSecondary,
    lineHeight: 17,
    marginBottom: 8,
  },
  noCoursesText: {
    fontSize: 13,
    color: Brand.textMuted,
    fontStyle: "italic",
  },
  inlineCoursePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inlineCourseLeft: {
    flex: 1,
  },
  inlineCourseName: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.text,
    marginBottom: 4,
  },
  inlineCourseMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inlineCourseStream: {
    fontSize: 11,
    color: Brand.primary,
    fontWeight: "500",
  },
  inlineCourseZ: {
    fontSize: 11,
    color: Brand.textSecondary,
  },
  inlineCourseYears: {
    fontSize: 11,
    color: Brand.textMuted,
  },
  websiteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  websiteText: {
    fontSize: 11,
    color: Brand.primary,
  },

  /* ── Course Cards ── */
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  courseCardHeader: {
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
    marginBottom: 3,
  },
  degreeDetails: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginBottom: 10,
  },
  courseInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  streamBadgeWrap: {},
  streamBadge: {
    backgroundColor: "#F1F5F9",
    color: Brand.textSecondary,
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  zScoreWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  zScoreText: {
    fontSize: 11,
    color: Brand.primary,
    fontWeight: "600",
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
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  careerPillText: {
    fontSize: 11,
    color: Brand.textSecondary,
  },

  /* ── Category Section Styles ── */
  categoryBlock: {
    marginBottom: 20,
  },
  categoryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  categoryTitleText: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
    flex: 1,
  },
  categoryBadgeWrap: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  streamDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },

  /* ── Empty State ── */
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Brand.text,
    marginTop: 12,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: Brand.textSecondary,
    textAlign: "center",
  },
});
