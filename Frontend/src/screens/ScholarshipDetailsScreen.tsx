import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { BottomNavBar } from "../components/BottomNavBar";

export const ScholarshipDetailsScreen: React.FC = () => {
  const { setCurrentScreen, selectedScholarshipId } = useApp();
  const [scholarship, setScholarship] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedScholarshipId) {
      loadDetails();
    }
  }, [selectedScholarshipId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const res = await api.getScholarshipById(selectedScholarshipId!);
      if (res && res.success) {
        setScholarship(res.data);
      }
    } catch (e) {
      console.error("Error loading scholarship details:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSource = () => {
    if (scholarship?.official_source_url) {
      Linking.openURL(scholarship.official_source_url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    } else {
      Linking.openURL("https://mohe.gov.lk");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentScreen("scholarships")}
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

  const s = scholarship || {
    title: "Merit Scholarship",
    category: "University scholarship",
    provider: "University of Colombo",
    value: "LKR 250,000",
    description:
      "A merit-based scholarship for Sri Lankan A/L students joining undergraduate programmes with strong academic performance.",
    eligibility: "Sri Lankan students with strong A/L results.",
    benefits: "Tuition support • Monthly allowance",
    requirements: "Results and personal statement",
    deadline: "15 Oct",
    application_instructions: "Results and personal statement",
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Blue Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen("scholarships")}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>{s.title}</Text>
          <Text style={styles.headerSubtitle}>
            {s.category} • Verified source
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Card 1: Provider & Value box */}
        <View style={styles.card}>
          <View style={styles.providerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Provider</Text>
              <Text style={styles.providerName}>{s.provider}</Text>
            </View>
            <View style={styles.valueBadgeWrap}>
              <Text style={styles.valueBadgeLabel}>Scholarship value</Text>
              <Text style={styles.valueBadgeAmount}>{s.value}</Text>
            </View>
          </View>
          <Text style={styles.descriptionText}>{s.description}</Text>
        </View>

        {/* Card 2: Eligibility */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Eligibility</Text>
          <Text style={styles.cardSectionText}>{s.eligibility}</Text>
        </View>

        {/* Card 3: Benefits (pale green tint) */}
        <View style={[styles.card, styles.greenCard]}>
          <Text style={styles.cardSectionTitle}>Benefits</Text>
          <Text style={styles.cardSectionText}>{s.benefits || "Tuition support • Monthly allowance"}</Text>
        </View>

        {/* Card 4: Requirements */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Requirements</Text>
          <Text style={styles.cardSectionText}>{s.requirements || "Results and personal statement"}</Text>
        </View>

        {/* Card 5: Deadline (pale blue tint) */}
        <View style={[styles.card, styles.blueCard]}>
          <Text style={styles.cardSectionTitle}>Deadline</Text>
          <Text style={styles.cardSectionText}>{s.deadline}</Text>
        </View>

        {/* Card 6: Application */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Application</Text>
          <Text style={styles.cardSectionText}>{s.application_instructions || "Results and personal statement"}</Text>
        </View>

        {/* View Official Source Button */}
        <TouchableOpacity
          style={styles.officialSourceBtn}
          onPress={handleOpenSource}
          activeOpacity={0.85}
        >
          <Text style={styles.officialSourceBtnText}>View Official Source</Text>
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
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  greenCard: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  blueCard: {
    backgroundColor: "#EFF6FF",
    borderColor: "#DBEAFE",
  },
  providerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: Brand.primary,
    fontWeight: "600",
    marginBottom: 2,
  },
  providerName: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
  },
  valueBadgeWrap: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: "flex-end",
  },
  valueBadgeLabel: {
    fontSize: 10,
    color: Brand.primary,
    fontWeight: "600",
  },
  valueBadgeAmount: {
    fontSize: 14,
    fontWeight: "800",
    color: Brand.primary,
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 12,
    color: Brand.textSecondary,
    lineHeight: 18,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 4,
  },
  cardSectionText: {
    fontSize: 12,
    color: Brand.textSecondary,
  },
  officialSourceBtn: {
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
    marginTop: 6,
  },
  officialSourceBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
