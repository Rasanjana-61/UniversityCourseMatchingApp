import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { BottomNavBar } from "../components/BottomNavBar";

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

const GRADES = ["A", "B", "C", "S", "F"];

export const ResultsEntryScreen: React.FC = () => {
  const { student, updateStudent, setCurrentScreen, executeMatch, isLoading } = useApp();

  const [sub1, setSub1] = useState({ name: "Physics", grade: "A" });
  const [sub2, setSub2] = useState({ name: "Chemistry", grade: "B" });
  const [sub3, setSub3] = useState({ name: "Combined Maths", grade: "A" });
  const [district, setDistrict] = useState(student.district || "Colombo");
  const [zScoreStr, setZScoreStr] = useState(student.zScore ? student.zScore.toString() : "1.8245");

  const [showDistrictModal, setShowDistrictModal] = useState(false);

  const handleFindEligibleCourses = async () => {
    const numZ = parseFloat(zScoreStr) || 1.8245;

    updateStudent({
      district,
      zScore: numZ,
      subjects: [sub1, sub2, sub3],
    });

    await executeMatch(student.stream, numZ, district);
    setCurrentScreen("matching-results");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen("stream-select")}
          >
            <Ionicons name="arrow-back" size={22} color={Brand.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.title}>Enter your A/L results</Text>
            <Text style={styles.subtitle}>{student.stream || "Physical Science"}</Text>
          </View>
        </View>

        {/* Progress Step Header */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.stepText}>Step 3 of 5</Text>
            <Text style={styles.stepLabel}>40% complete</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: "60%" }]} />
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.sectionHeading}>Subject results</Text>
          <Text style={styles.sectionSubheading}>
            Enter your best three subjects and district rank.
          </Text>

          {/* Subject 1 */}
          <View style={styles.subjectRow}>
            <View style={styles.subjectInputContainer}>
              <Text style={styles.subjectText}>{sub1.name}</Text>
            </View>
            <View style={styles.gradeContainer}>
              {GRADES.slice(0, 4).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradePill, sub1.grade === g && styles.gradePillActive]}
                  onPress={() => setSub1({ ...sub1, grade: g })}
                >
                  <Text style={[styles.gradeText, sub1.grade === g && styles.gradeTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subject 2 */}
          <View style={styles.subjectRow}>
            <View style={styles.subjectInputContainer}>
              <Text style={styles.subjectText}>{sub2.name}</Text>
            </View>
            <View style={styles.gradeContainer}>
              {GRADES.slice(0, 4).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradePill, sub2.grade === g && styles.gradePillActive]}
                  onPress={() => setSub2({ ...sub2, grade: g })}
                >
                  <Text style={[styles.gradeText, sub2.grade === g && styles.gradeTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subject 3 */}
          <View style={styles.subjectRow}>
            <View style={styles.subjectInputContainer}>
              <Text style={styles.subjectText}>{sub3.name}</Text>
            </View>
            <View style={styles.gradeContainer}>
              {GRADES.slice(0, 4).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradePill, sub3.grade === g && styles.gradePillActive]}
                  onPress={() => setSub3({ ...sub3, grade: g })}
                >
                  <Text style={[styles.gradeText, sub3.grade === g && styles.gradeTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* District Picker Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>District</Text>
            <TouchableOpacity
              style={styles.pickerSelector}
              onPress={() => setShowDistrictModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.pickerValue}>{district}</Text>
              <Ionicons name="chevron-down" size={18} color={Brand.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Z-Score Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Z-Score</Text>
            <View style={styles.zScoreWrapper}>
              <TextInput
                style={styles.zScoreInput}
                keyboardType="numeric"
                value={zScoreStr}
                onChangeText={setZScoreStr}
                placeholder="e.g. 1.8245"
                placeholderTextColor={Brand.textMuted}
              />
              <View style={styles.zScoreBadge}>
                <Text style={styles.zScoreBadgeText}>A/L Cutoff</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Find Eligible Courses Primary Button */}
        <TouchableOpacity
          style={styles.findButton}
          onPress={handleFindEligibleCourses}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.findButtonText}>Find Eligible Courses</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Back Secondary Button */}
        <TouchableOpacity
          style={styles.backSecondaryButton}
          onPress={() => setCurrentScreen("stream-select")}
          activeOpacity={0.85}
        >
          <Text style={styles.backSecondaryText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* District Picker Modal */}
      <Modal visible={showDistrictModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.districtModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select District</Text>
              <TouchableOpacity onPress={() => setShowDistrictModal(false)}>
                <Ionicons name="close" size={22} color={Brand.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
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
                    <Ionicons name="checkmark" size={18} color={Brand.primary} />
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  progressContainer: {
    marginBottom: 20,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "600",
    color: Brand.text,
    marginBottom: 4,
  },
  sectionSubheading: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginBottom: 18,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  subjectInputContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    justifyContent: "center",
  },
  subjectText: {
    fontSize: 13,
    fontWeight: "500",
    color: Brand.text,
  },
  gradeContainer: {
    flexDirection: "row",
    gap: 4,
  },
  gradePill: {
    width: 32,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  gradePillActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  gradeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.textSecondary,
  },
  gradeTextActive: {
    color: "#FFFFFF",
  },
  inputGroup: {
    marginTop: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
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
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
  },
  pickerValue: {
    fontSize: 14,
    color: Brand.text,
    fontWeight: "500",
  },
  zScoreWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 46,
  },
  zScoreInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Brand.text,
  },
  zScoreBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  findButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  districtModalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: 450,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
  },
  districtItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  districtItemActive: {
    backgroundColor: "#EFF6FF",
  },
  districtItemText: {
    fontSize: 14,
    color: Brand.text,
  },
  districtItemTextActive: {
    color: Brand.primary,
    fontWeight: "600",
  },
});
