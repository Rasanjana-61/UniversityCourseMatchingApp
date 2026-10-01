import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { BottomNavBar } from "../components/BottomNavBar";

interface StreamOption {
  id: string;
  name: string;
  subjects: string;
}

const STREAMS: StreamOption[] = [
  {
    id: "Physical Science",
    name: "Physical Science",
    subjects: "Combined Maths • Physics • Chemistry",
  },
  {
    id: "Biological Science",
    name: "Biological Science",
    subjects: "Biology • Chemistry • Physics / Agriculture",
  },
  {
    id: "Commerce",
    name: "Commerce",
    subjects: "Accounting • Business Studies • Economics",
  },
  {
    id: "Arts",
    name: "Arts",
    subjects: "Humanities • Languages • Social Sciences",
  },
  {
    id: "Technology",
    name: "Technology",
    subjects: "Engineering Technology • ICT • SFT / BST",
  },
];

export const StreamSelectScreen: React.FC = () => {
  const { student, updateStudent, setCurrentScreen, setActiveTab } = useApp();
  const [selectedStream, setSelectedStream] = useState<string>(student.stream || "Physical Science");

  const handleContinue = () => {
    updateStudent({ stream: selectedStream });
    setCurrentScreen("results-entry");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setActiveTab("home");
              setCurrentScreen("home");
            }}
          >
            <Ionicons name="arrow-back" size={22} color={Brand.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.title}>Select your A/L stream</Text>
            <Text style={styles.subtitle}>Choose the stream used for eligibility checks.</Text>
          </View>
        </View>

        {/* Progress Step Header */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTextRow}>
            <Text style={styles.stepText}>Step 2 of 5</Text>
            <Text style={styles.stepLabel}>A/L stream</Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: "40%" }]} />
          </View>
        </View>

        {/* Stream List */}
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
                <View style={styles.streamCardContent}>
                  <Text style={[styles.streamName, isSelected && styles.streamNameSelected]}>
                    {stream.name}
                  </Text>
                  <Text style={styles.streamSubjects}>{stream.subjects}</Text>
                </View>

                {isSelected ? (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>Selected</Text>
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
          <Text style={styles.continueButtonText}>Continue</Text>
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
    marginBottom: 24,
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
  streamList: {
    gap: 12,
    marginBottom: 24,
  },
  streamCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Brand.cardBorder,
    alignItems: "center",
    justifyContent: "space-between",
  },
  streamCardSelected: {
    borderColor: Brand.primary,
    backgroundColor: "#FFFFFF",
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  streamCardContent: {
    flex: 1,
    marginRight: 10,
  },
  streamName: {
    fontSize: 15,
    fontWeight: "600",
    color: Brand.text,
    marginBottom: 4,
  },
  streamNameSelected: {
    color: Brand.primary,
  },
  streamSubjects: {
    fontSize: 12,
    color: Brand.textSecondary,
    lineHeight: 16,
  },
  selectedBadge: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  unselectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },
  continueButton: {
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
    marginBottom: 16,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
