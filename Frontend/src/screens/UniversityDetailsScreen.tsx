import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

export const UniversityDetailsScreen: React.FC = () => {
  const { setCurrentScreen, selectedUniversityId, setSelectedCourseId, toggleSave, isCourseSaved } = useApp();
  const [university, setUniversity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedUniversityId) {
      loadUniversityDetails();
    }
  }, [selectedUniversityId]);

  const loadUniversityDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getUniversityById(selectedUniversityId!);
      if (res && res.success) {
        setUniversity(res.data);
      }
    } catch (e) {
      console.error("Error fetching university details:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePress = (courseId: number) => {
    setSelectedCourseId(courseId);
    setCurrentScreen("course-details");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
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

  if (!university) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen("explore")}>
            <Ionicons name="arrow-back" size={24} color={Brand.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>University details not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Use a generic placeholder image or icon for university cover
  const CoverPlaceholder = () => (
    <View style={styles.coverPlaceholder}>
      <Ionicons name="business" size={60} color="#CBD5E1" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Cover Section */}
        <View style={styles.coverSection}>
          <CoverPlaceholder />
          
          {/* Absolute Back Button over Cover */}
          <View style={styles.absoluteHeader}>
            <TouchableOpacity style={styles.backButtonCircle} onPress={() => setCurrentScreen("explore")}>
              <Ionicons name="arrow-back" size={20} color={Brand.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Header */}
        <View style={styles.infoContainer}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>{university.short_name}</Text>
          </View>
          
          <Text style={styles.univName}>{university.name}</Text>
          
          <View style={styles.metaRow}>
            <Ionicons name="location" size={14} color={Brand.textMuted} />
            <Text style={styles.metaText}>{university.location}, Sri Lanka</Text>
          </View>

          {university.website ? (
            <View style={styles.metaRow}>
              <Ionicons name="globe" size={14} color={Brand.primary} />
              <Text style={[styles.metaText, { color: Brand.primary }]}>{university.website}</Text>
            </View>
          ) : null}

          {/* Action Row */}
          <View style={styles.actionRow}>
             <TouchableOpacity style={styles.mapBtn}>
               <Ionicons name="map-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
               <Text style={styles.mapBtnText}>View on Map</Text>
             </TouchableOpacity>
             <View style={styles.establishedBadge}>
                <Text style={styles.establishedText}>Est. {university.established_year || "N/A"}</Text>
             </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the University</Text>
          <Text style={styles.descriptionText}>
            {university.description || "One of the premier government universities in Sri Lanka, offering a wide range of undergraduate and postgraduate programmes with excellent research facilities and a vibrant campus life."}
          </Text>
        </View>

        {/* Campus Facilities (Mocked for UI) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campus Facilities</Text>
          <View style={styles.facilitiesGrid}>
            <View style={styles.facilityBox}>
              <Ionicons name="bed-outline" size={24} color={Brand.primary} />
              <Text style={styles.facilityText}>Hostels</Text>
            </View>
            <View style={styles.facilityBox}>
              <Ionicons name="library-outline" size={24} color={Brand.primary} />
              <Text style={styles.facilityText}>Library</Text>
            </View>
            <View style={styles.facilityBox}>
              <Ionicons name="fitness-outline" size={24} color={Brand.primary} />
              <Text style={styles.facilityText}>Sports</Text>
            </View>
            <View style={styles.facilityBox}>
              <Ionicons name="wifi-outline" size={24} color={Brand.primary} />
              <Text style={styles.facilityText}>Free Wi-Fi</Text>
            </View>
          </View>
        </View>

        {/* Courses Offered */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programmes Offered ({university.courses?.length || 0})</Text>
          
          <View style={styles.coursesList}>
            {university.courses && university.courses.length > 0 ? (
              university.courses.map((course: any) => {
                const saved = isCourseSaved(course.id);
                return (
                  <TouchableOpacity 
                    key={course.id} 
                    style={styles.courseCard}
                    onPress={() => handleCoursePress(course.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.courseLeft}>
                      <Text style={styles.courseTitle}>{course.name}</Text>
                      <View style={styles.courseMeta}>
                        <Text style={styles.streamBadge}>{course.stream}</Text>
                        <Text style={styles.durationText}>{course.duration_years} Years</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      onPress={() => toggleSave(course.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      style={styles.saveBtn}
                    >
                      <Ionicons
                        name={saved ? "bookmark" : "bookmark-outline"}
                        size={22}
                        color={saved ? Brand.primary : Brand.textMuted}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.descriptionText}>No courses listed yet.</Text>
            )}
          </View>
        </View>

        {/* Action Buttons: Admission & Compare */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.admissionBtn}
            onPress={() => setCurrentScreen("admission-requirements")}
            activeOpacity={0.85}
          >
            <Text style={styles.admissionBtnText}>View Admission Information</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.admissionBtn, { backgroundColor: "#0284C7" }]}
            onPress={() => setCurrentScreen("scholarships")}
            activeOpacity={0.85}
          >
            <Text style={styles.admissionBtnText}>View Scholarships & Financial Aid</Text>
          </TouchableOpacity>

          <View style={styles.twoBtnRow}>
            <TouchableOpacity
              style={styles.halfBtnOutline}
              onPress={() => setCurrentScreen("saved")}
              activeOpacity={0.85}
            >
              <Text style={styles.halfBtnText}>Saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.halfBtnOutline}
              onPress={() => setCurrentScreen("compare-courses")}
              activeOpacity={0.85}
            >
              <Text style={styles.halfBtnText}>Compare</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#EF4444", fontSize: 16 },
  headerRow: { padding: 16 },
  backButton: { padding: 4 },
  scrollContent: { paddingBottom: 40 },
  
  coverSection: {
    height: 200,
    position: "relative",
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  absoluteHeader: {
    position: "absolute",
    top: 16,
    left: 20,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Brand.cardBorder,
    position: "relative",
  },
  logoWrap: {
    position: "absolute",
    top: -40,
    left: 20,
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: Brand.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },
  univName: {
    fontSize: 24,
    fontWeight: "800",
    color: Brand.text,
    marginBottom: 8,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaText: {
    fontSize: 13,
    color: Brand.textSecondary,
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 12,
  },
  mapBtn: {
    flexDirection: "row",
    backgroundColor: Brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  mapBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  establishedBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  establishedText: {
    color: Brand.textSecondary,
    fontSize: 13,
    fontWeight: "600",
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
  facilitiesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  facilityBox: {
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    width: "23%",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  facilityText: {
    fontSize: 11,
    color: Brand.textSecondary,
    fontWeight: "500",
    marginTop: 6,
  },
  coursesList: {
    gap: 12,
  },
  courseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  courseLeft: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 6,
  },
  courseMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  streamBadge: {
    backgroundColor: "#EFF6FF",
    color: Brand.primary,
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
    overflow: "hidden",
  },
  durationText: {
    fontSize: 12,
    color: Brand.textMuted,
  },
  saveBtn: {
    padding: 6,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    marginLeft: 10,
  },
  bottomActions: {
    paddingHorizontal: 20,
    marginTop: 10,
    gap: 12,
  },
  admissionBtn: {
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
  },
  admissionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  twoBtnRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfBtnOutline: {
    flex: 1,
    height: 44,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  halfBtnText: {
    color: Brand.text,
    fontSize: 14,
    fontWeight: "600",
  },
});
