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

export const AdmissionRequirementsScreen: React.FC = () => {
  const { setCurrentScreen, selectedCourseId, toggleSave, isCourseSaved } = useApp();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (selectedCourseId) {
      setIsSaved(isCourseSaved(selectedCourseId));
      loadRequirements();
    } else {
      // Default fallback
      setData({
        courseName: "BSc Software Engineering",
        universityName: "University of Kelaniya",
        stream: "Physical Science",
        eligiblePill: "3 passes",
        streamNote:
          "Admission is based on district Z-score ranking for the selected stream and required subjects.",
        requiredSubjects: [
          { type: "Core", name: "Combined Mathematics" },
          { type: "Core", name: "Physics" },
        ],
        subjectsNote:
          "Students must sit for the required subjects in one sitting to be eligible for selection.",
        grades: {
          min: "At least three passes",
          recommended: "Stronger grades improve district Z-score ranking",
          note: "Meeting the minimum grade requirement does not guarantee admission.",
        },
        selection: {
          ranking: "Based on district Z-score ranking",
          cutOff: "Final cut-off depends on the university intake and district competition",
          note: "Admission is competitive and subject to the university's selection criteria.",
        },
        documents: {
          required: "Certified copies of A/L results and NIC",
          optional: "Additional certificates such as sports, leadership or extra-curricular achievements",
          note: "Keep scanned copies ready before the application window opens.",
        },
        deadlines: {
          results: "A/L results release",
          applications: "Application window opens after results release",
          note: "Keep track of the university's application timeline and document submission dates.",
        },
      });
      setLoading(false);
    }
  }, [selectedCourseId]);

  const loadRequirements = async () => {
    try {
      setLoading(true);
      const res = await api.getCourseAdmissionRequirements(selectedCourseId!);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error("Error loading admission criteria:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRequirements = async () => {
    if (selectedCourseId) {
      await toggleSave(selectedCourseId);
      setIsSaved(!isSaved);
      Alert.alert(
        "Saved",
        "Admission requirements for this course have been saved to your profile!"
      );
    } else {
      Alert.alert("Saved", "Requirements saved successfully!");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen("course-details")}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Brand.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const d = data || {};

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Blue Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen("course-details")}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Admission Requirements</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {d.courseName || "Course Programme"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card 1: A/L Stream & Eligible */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.streamBadge}>
              <Text style={styles.streamBadgeText}>A/L stream</Text>
            </View>
            <Text style={styles.cardMainHeading}>{d.stream || "Physical Science"}</Text>
          </View>

          <View style={styles.subPillsRow}>
            <View style={styles.eligiblePill}>
              <Text style={styles.eligiblePillText}>Eligible</Text>
            </View>
            <View style={styles.passesPill}>
              <Text style={styles.passesPillText}>{d.eligiblePill || "3 passes"}</Text>
            </View>
          </View>

          <Text style={styles.cardFootnote}>{d.streamNote}</Text>
        </View>

        {/* Card 2: Required A/L Subjects */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredBadgeText}>Required</Text>
            </View>
            <Text style={styles.cardMainHeading}>A/L subjects</Text>
          </View>

          <View style={styles.subjectsList}>
            {d.requiredSubjects?.map((sub: any, idx: number) => (
              <View key={idx} style={styles.subjectItem}>
                <View style={styles.corePill}>
                  <Text style={styles.corePillText}>{sub.type || "Core"}</Text>
                </View>
                <Text style={styles.subjectName}>{sub.name}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.cardFootnote}>{d.subjectsNote}</Text>
        </View>

        {/* Card 3: Minimum Grades */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.minimumBadge}>
              <Text style={styles.minimumBadgeText}>Minimum</Text>
            </View>
            <Text style={styles.cardMainHeading}>Grades</Text>
          </View>

          <View style={styles.gradeRow}>
            <View style={styles.minPill}>
              <Text style={styles.minPillText}>Min</Text>
            </View>
            <Text style={styles.gradeText}>{d.grades?.min}</Text>
          </View>

          <View style={[styles.gradeRow, { marginTop: 8 }]}>
            <View style={styles.recPill}>
              <Text style={styles.recPillText}>Recommended</Text>
            </View>
            <Text style={styles.gradeText}>{d.grades?.recommended}</Text>
          </View>

          <Text style={styles.cardFootnote}>{d.grades?.note}</Text>
        </View>

        {/* Card 4: Z-Score and cut-off */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.selectionBadge}>
              <Text style={styles.selectionBadgeText}>Selection</Text>
            </View>
            <Text style={styles.cardMainHeading}>Z-score and cut-off</Text>
          </View>

          <View style={styles.gradeRow}>
            <View style={styles.rankingPill}>
              <Text style={styles.rankingPillText}>Ranking</Text>
            </View>
            <Text style={styles.gradeText}>{d.selection?.ranking}</Text>
          </View>

          <View style={[styles.gradeRow, { marginTop: 8 }]}>
            <View style={styles.cutoffPill}>
              <Text style={styles.cutoffPillText}>Cut-off</Text>
            </View>
            <Text style={styles.gradeText}>{d.selection?.cutOff}</Text>
          </View>

          <Text style={styles.cardFootnote}>{d.selection?.note}</Text>
        </View>

        {/* Card 5: Supporting Documents */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.documentsBadge}>
              <Text style={styles.documentsBadgeText}>Documents</Text>
            </View>
            <Text style={styles.cardMainHeading}>Supporting documents</Text>
          </View>

          <View style={styles.gradeRow}>
            <View style={styles.reqDocPill}>
              <Text style={styles.reqDocPillText}>Required</Text>
            </View>
            <Text style={styles.gradeText}>{d.documents?.required}</Text>
          </View>

          <View style={[styles.gradeRow, { marginTop: 8 }]}>
            <View style={styles.optDocPill}>
              <Text style={styles.optDocPillText}>Optional</Text>
            </View>
            <Text style={styles.gradeText}>{d.documents?.optional}</Text>
          </View>

          <Text style={styles.cardFootnote}>{d.documents?.note}</Text>
        </View>

        {/* Card 6: Deadlines */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.timelineBadge}>
              <Text style={styles.timelineBadgeText}>Timeline</Text>
            </View>
            <Text style={styles.cardMainHeading}>Deadlines</Text>
          </View>

          <View style={styles.gradeRow}>
            <View style={styles.resultsPill}>
              <Text style={styles.resultsPillText}>Results</Text>
            </View>
            <Text style={styles.gradeText}>{d.deadlines?.results}</Text>
          </View>

          <View style={[styles.gradeRow, { marginTop: 8 }]}>
            <View style={styles.appPill}>
              <Text style={styles.appPillText}>Applications</Text>
            </View>
            <Text style={styles.gradeText}>{d.deadlines?.applications}</Text>
          </View>

          <Text style={styles.cardFootnote}>{d.deadlines?.note}</Text>
        </View>

        {/* Save Requirements Button */}
        <TouchableOpacity
          style={styles.saveRequirementsBtn}
          onPress={handleSaveRequirements}
          activeOpacity={0.85}
        >
          <Text style={styles.saveRequirementsBtnText}>
            {isSaved ? "Saved in Bookmarks" : "Save Requirements"}
          </Text>
        </TouchableOpacity>
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  cardMainHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
  },
  subPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  cardFootnote: {
    fontSize: 12,
    color: Brand.textMuted,
    lineHeight: 17,
    marginTop: 8,
  },

  /* Stream pills */
  streamBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  streamBadgeText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
  },
  eligiblePill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  eligiblePillText: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "700",
  },
  passesPill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  passesPillText: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Subjects */
  requiredBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  requiredBadgeText: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "700",
  },
  subjectsList: {
    gap: 8,
    marginBottom: 4,
  },
  subjectItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  corePill: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  corePillText: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "600",
  },
  subjectName: {
    fontSize: 13,
    color: Brand.text,
    fontWeight: "500",
  },

  /* Grades */
  minimumBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  minimumBadgeText: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "700",
  },
  gradeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  minPill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  minPillText: {
    color: "#B45309",
    fontSize: 11,
    fontWeight: "700",
  },
  recPill: {
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  recPillText: {
    color: "#C2410C",
    fontSize: 11,
    fontWeight: "700",
  },
  gradeText: {
    fontSize: 12,
    color: Brand.textSecondary,
    flex: 1,
  },

  /* Selection */
  selectionBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selectionBadgeText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
  },
  rankingPill: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rankingPillText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
  },
  cutoffPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cutoffPillText: {
    color: Brand.primary,
    fontSize: 11,
    fontWeight: "700",
  },

  /* Documents */
  documentsBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  documentsBadgeText: {
    color: Brand.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  reqDocPill: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reqDocPillText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
  },
  optDocPill: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optDocPillText: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Deadlines */
  timelineBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timelineBadgeText: {
    color: Brand.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  resultsPill: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  resultsPillText: {
    color: Brand.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  appPill: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  appPillText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Action button */
  saveRequirementsBtn: {
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
    marginTop: 8,
  },
  saveRequirementsBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
