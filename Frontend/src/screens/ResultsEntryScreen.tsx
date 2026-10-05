import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { BottomNavBar } from "../components/BottomNavBar";
import { api } from "../services/api";

const DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

const STREAM_DEFAULT_SUBJECTS: Record<string, string[]> = {
  "Physical Science": ["Combined Maths", "Physics", "Chemistry"],
  "Biological Science": ["Biology", "Chemistry", "Physics"],
  Commerce: ["Accounting", "Business Studies", "Economics"],
  Arts: ["Political Science", "Economics", "Sinhala"],
  Technology: ["Engineering Technology", "Science for Tech (SFT)", "ICT"],
};

const GRADES = ["A", "B", "C", "S"];

export const ResultsEntryScreen: React.FC = () => {
  const { student, updateStudent, setCurrentScreen, executeMatch, isLoading } = useApp();

  const currentStream = student.stream || "Physical Science";
  const defaultSubs = STREAM_DEFAULT_SUBJECTS[currentStream] || [
    "Subject 1",
    "Subject 2",
    "Subject 3",
  ];

  const [sub1, setSub1] = useState({
    name: student.subjects?.[0]?.name || defaultSubs[0],
    grade: student.subjects?.[0]?.grade || "A",
  });
  const [sub2, setSub2] = useState({
    name: student.subjects?.[1]?.name || defaultSubs[1],
    grade: student.subjects?.[1]?.grade || "B",
  });
  const [sub3, setSub3] = useState({
    name: student.subjects?.[2]?.name || defaultSubs[2],
    grade: student.subjects?.[2]?.grade || "A",
  });

  const [district, setDistrict] = useState(student.district || "Colombo");
  const [zScoreStr, setZScoreStr] = useState(
    student.zScore && student.zScore > 0 ? student.zScore.toFixed(4) : "1.8245"
  );
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Update subjects if stream changes
  useEffect(() => {
    const subs = STREAM_DEFAULT_SUBJECTS[currentStream] || [
      "Subject 1",
      "Subject 2",
      "Subject 3",
    ];
    setSub1((prev) => ({ ...prev, name: subs[0] }));
    setSub2((prev) => ({ ...prev, name: subs[1] }));
    setSub3((prev) => ({ ...prev, name: subs[2] }));
  }, [currentStream]);

  const handleFindEligibleCourses = async () => {
    const numZ = parseFloat(zScoreStr) || 1.8245;
    const subjectsArray = [sub1, sub2, sub3];

    // 1. Update context
    updateStudent({
      stream: currentStream,
      district,
      zScore: numZ,
      subjects: subjectsArray,
    });

    // 2. Persist to Backend DB
    try {
      setSaveStatus("Saving...");
      await api.saveProfile({
        fullName: student.fullName,
        email: student.email,
        stream: currentStream,
        zScore: numZ,
        district,
        school: student.school,
        subjects: subjectsArray,
      });
    } catch (e) {
      console.log("Could not sync profile to DB:", e);
    }

    // 3. Execute Matching Engine
    await executeMatch(currentStream, numZ, district);
    setCurrentScreen("matching-results");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen("stream-select")}
            activeOpacity={0.7}
          >
            <View style={styles.backCircle}>
              <Ionicons name="arrow-back" size={18} color={Brand.primary} />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.title}>Enter Your A/L Results</Text>
            <Text style={styles.subtitle}>Stream: {currentStream}</Text>
          </View>
        </View>

        {/* Progress Step Header */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.stepText}>Step 3 of 4</Text>
            <Text style={styles.stepLabel}>Academic Assessment</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: "75%" }]} />
          </View>
        </View>

        {/* Results Card */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Subject Grades</Text>
              <Text style={styles.sectionSubheading}>Select the grade obtained for each subject</Text>
            </View>
            <View style={styles.streamBadge}>
              <Text style={styles.streamBadgeText}>{currentStream}</Text>
            </View>
          </View>

          {/* Subject 1 */}
          <View style={styles.subjectItem}>
            <View style={styles.subjectNameRow}>
              <Ionicons name="book-outline" size={16} color={Brand.primary} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.subjectNameInput}
                value={sub1.name}
                onChangeText={(text) => setSub1({ ...sub1, name: text })}
                placeholder="Subject 1"
              />
            </View>
            <View style={styles.gradeContainer}>
              {GRADES.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradePill, sub1.grade === g && styles.gradePillActive]}
                  onPress={() => setSub1({ ...sub1, grade: g })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.gradeText, sub1.grade === g && styles.gradeTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subject 2 */}
          <View style={styles.subjectItem}>
            <View style={styles.subjectNameRow}>
              <Ionicons name="book-outline" size={16} color={Brand.primary} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.subjectNameInput}
                value={sub2.name}
                onChangeText={(text) => setSub2({ ...sub2, name: text })}
                placeholder="Subject 2"
              />
            </View>
            <View style={styles.gradeContainer}>
              {GRADES.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradePill, sub2.grade === g && styles.gradePillActive]}
                  onPress={() => setSub2({ ...sub2, grade: g })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.gradeText, sub2.grade === g && styles.gradeTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subject 3 */}
          <View style={styles.subjectItem}>
            <View style={styles.subjectNameRow}>
              <Ionicons name="book-outline" size={16} color={Brand.primary} style={{ marginRight: 6 }} />
              <TextInput
                style={styles.subjectNameInput}
                value={sub3.name}
                onChangeText={(text) => setSub3({ ...sub3, name: text })}
                placeholder="Subject 3"
              />
            </View>
            <View style={styles.gradeContainer}>
              {GRADES.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradePill, sub3.grade === g && styles.gradePillActive]}
                  onPress={() => setSub3({ ...sub3, grade: g })}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.gradeText, sub3.grade === g && styles.gradeTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* District Picker Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>District (for Cutoff Calculations)</Text>
            <TouchableOpacity
              style={styles.pickerSelector}
              onPress={() => setShowDistrictModal(true)}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="location-outline" size={18} color={Brand.primary} style={{ marginRight: 8 }} />
                <Text style={styles.pickerValue}>{district} District</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={Brand.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Z-Score Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Official Z-Score</Text>
            <View style={styles.zScoreWrapper}>
              <Ionicons name="stats-chart" size={18} color={Brand.primary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.zScoreInput}
                keyboardType="numeric"
                value={zScoreStr}
                onChangeText={setZScoreStr}
                placeholder="e.g. 1.8245"
                placeholderTextColor={Brand.textMuted}
              />
              <View style={styles.zScoreBadge}>
                <Text style={styles.zScoreBadgeText}>UGC Cutoff Metric</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Find Eligible Courses Primary Button */}
        <TouchableOpacity
          style={[styles.findButton, isLoading && styles.buttonDisabled]}
          onPress={handleFindEligibleCourses}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.findButtonText}>Match & Find Eligible Courses</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Change Stream Button */}
        <TouchableOpacity
          style={styles.backSecondaryButton}
          onPress={() => setCurrentScreen("stream-select")}
          activeOpacity={0.85}
        >
          <Text style={styles.backSecondaryText}>Change A/L Stream</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* District Picker Modal */}
      <Modal visible={showDistrictModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.districtModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your District</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={24} color={Brand.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {DISTRICTS.map((dist) => (
                <TouchableOpacity
                  key={dist}
                  style={[
                    styles.districtItem,
                    dist === district && styles.districtItemActive,
                  ]}
                  onPress={() => {
                    setDistrict(dist);
                    setShowDistrictModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.districtItemText,
                      dist === district && styles.districtItemTextActive,
                    ]}
                  >
                    {dist}
                  </Text>
                  {dist === district && (
                    <Ionicons name="checkmark-circle" size={20} color={Brand.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    paddingTop: 12,
    paddingBottom: 28,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    padding: 2,
  },
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
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
  },
  progressContainer: {
    marginBottom: 18,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  stepText: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.primary,
  },
  stepLabel: {
    fontSize: 12,
    color: Brand.textMuted,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Brand.primary,
    borderRadius: 3,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 2,
  },
  sectionSubheading: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
  streamBadge: {
    backgroundColor: Brand.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  streamBadgeText: {
    fontSize: 11,
    color: Brand.primaryDark,
    fontWeight: "600",
  },
  subjectItem: {
    marginBottom: 14,
  },
  subjectNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  subjectNameInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: Brand.text,
    paddingVertical: 2,
  },
  gradeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  gradePill: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  gradePillActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.textSecondary,
  },
  gradeTextActive: {
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.textSecondary,
    marginBottom: 6,
  },
  pickerSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  pickerValue: {
    fontSize: 14,
    color: Brand.text,
    fontWeight: "600",
  },
  zScoreWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  zScoreInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: Brand.primaryDark,
  },
  zScoreBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  zScoreBadgeText: {
    fontSize: 11,
    color: Brand.primary,
    fontWeight: "600",
  },
  findButton: {
    flexDirection: "row",
    backgroundColor: Brand.primary,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  findButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  backSecondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  backSecondaryText: {
    color: Brand.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  districtModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: 460,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Brand.text,
  },
  districtItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 2,
  },
  districtItemActive: {
    backgroundColor: "#EFF6FF",
  },
  districtItemText: {
    fontSize: 14,
    color: Brand.text,
    fontWeight: "500",
  },
  districtItemTextActive: {
    color: Brand.primary,
    fontWeight: "700",
  },
});
