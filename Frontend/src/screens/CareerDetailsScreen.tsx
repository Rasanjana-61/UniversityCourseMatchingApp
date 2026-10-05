import React from "react";
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

export const CareerDetailsScreen: React.FC = () => {
  const { setCurrentScreen } = useApp();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen("course-details")}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Software Engineer</Text>
          <Text style={styles.headerSubtitle}>Technology sector • High demand</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card 1: What they do */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>What they do</Text>
          <Text style={styles.cardText}>
            Design, develop, test and maintain software systems.
          </Text>
        </View>

        {/* Card 2: Core skills */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Core skills</Text>
          <Text style={styles.cardText}>
            Programming • Problem solving • Teamwork
          </Text>
        </View>

        {/* Card 3: Career pathways */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Career pathways</Text>
          <Text style={styles.cardText}>
            Associate → Engineer → Senior → Lead
          </Text>
        </View>

        {/* Card 4: Work environments */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Work environments</Text>
          <Text style={styles.cardText}>
            Product companies • Banks • Startups • Remote teams
          </Text>
        </View>

        {/* Navigation Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setCurrentScreen("job-opportunities")}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Job Opportunities</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setCurrentScreen("salary-info")}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Salary Info</Text>
          </TouchableOpacity>
        </View>
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  actionsContainer: {
    marginTop: 10,
    gap: 12,
  },
  primaryBtn: {
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
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryBtnText: {
    color: Brand.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});
