import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { BottomNavBar } from "../components/BottomNavBar";

interface StreamOption {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  subjects: string;
  popularCareers: string;
}

const STREAMS: StreamOption[] = [
  {
    id: "Physical Science",
    name: "Physical Science (Maths)",
    icon: "calculator-outline",
    subjects: "Combined Maths • Physics • Chemistry / ICT",
    popularCareers: "Engineering, Computer Science, IT, QS",
  },
  {
    id: "Biological Science",
    name: "Biological Science (Bio)",
    icon: "fitness-outline",
    subjects: "Biology • Chemistry • Physics / Agriculture",
    popularCareers: "Medicine (MBBS), Dental, Veterinary, Pharmacy",
  },
  {
    id: "Commerce",
    name: "Commerce",
    icon: "briefcase-outline",
    subjects: "Accounting • Business Studies • Economics / ICT",
    popularCareers: "Management, Finance, Accountancy, Banking",
  },
  {
    id: "Arts",
    name: "Arts & Humanities",
    icon: "color-palette-outline",
    subjects: "Languages • Social Sciences • Political Science • Law",
    popularCareers: "Law (LLB), Media, Economics, International Relations",
  },
  {
    id: "Technology",
    name: "Technology",
    icon: "hardware-chip-outline",
    subjects: "Engineering Tech (ET) • Bio-systems Tech (BST) • SFT • ICT",
    popularCareers: "BET, BICT, BBST, Automation, Agro-Tech",
  },
];

export const StreamSelectScreen: React.FC = () => {
  const { student, updateStudent, setCurrentScreen, setActiveTab } = useApp();
  const [selectedStream, setSelectedStream] = useState<string>(
    student.stream || "Physical Science"
  );

  const handleContinue = () => {
    updateStudent({ stream: selectedStream });
    setCurrentScreen("results-entry");
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setActiveTab("home");
              setCurrentScreen("home");
            }}
            activeOpacity={0.7}
          >
            <View style={styles.backCircle}>
              <Ionicons name="arrow-back" size={18} color={Brand.primary} />
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.title}>Select Your A/L Stream</Text>
            <Text style={styles.subtitle}>Choose your G.C.E. A/L examination stream</Text>
          </View>
        </View>

        {/* Progress Step Header */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.stepText}>Step 2 of 4</Text>
            <Text style={styles.stepLabel}>Stream Selection</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: "50%" }]} />
          </View>
        </View>

        {/* Stream Cards List */}
        <View style={styles.streamList}>
          {STREAMS.map((stream) => {
            const isSelected = selectedStream === stream.id;
            return (
              <TouchableOpacity
                key={stream.id}
                style={[styles.streamCard, isSelected && styles.streamCardSelected]}
                onPress={() => setSelectedStream(stream.id)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.streamIconBox,
                    isSelected ? styles.streamIconBoxActive : null,
                  ]}
                >
                  <Ionicons
                    name={stream.icon}
                    size={22}
                    color={isSelected ? "#FFFFFF" : Brand.primary}
                  />
                </View>

                <View style={styles.streamCardContent}>
                  <Text
                    style={[styles.streamName, isSelected && styles.streamNameSelected]}
                  >
                    {stream.name}
                  </Text>
                  <Text style={styles.streamSubjects}>{stream.subjects}</Text>
                  <Text style={styles.careerTag}>🎯 {stream.popularCareers}</Text>
                </View>

                {isSelected ? (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={22} color={Brand.primary} />
                  </View>
                ) : (
                  <View style={styles.unselectedIndicator} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueButtonText}>Continue to Results Entry</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
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
    marginBottom: 20,
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
  streamList: {
    gap: 12,
    marginBottom: 24,
  },
  streamCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  streamCardSelected: {
    borderColor: Brand.primary,
    backgroundColor: "#F8FAFF",
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  streamIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  streamIconBoxActive: {
    backgroundColor: Brand.primary,
  },
  streamCardContent: {
    flex: 1,
    marginRight: 8,
  },
  streamName: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 3,
  },
  streamNameSelected: {
    color: Brand.primaryDark,
  },
  streamSubjects: {
    fontSize: 12,
    color: Brand.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  careerTag: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "500",
  },
  selectedBadge: {
    padding: 2,
  },
  unselectedIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#CBD5E1",
  },
  continueButton: {
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
    marginBottom: 16,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
