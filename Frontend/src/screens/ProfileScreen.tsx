import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { BottomNavBar } from "../components/BottomNavBar";

export const ProfileScreen: React.FC = () => {
  const { student, updateStudent, setCurrentScreen, setActiveTab, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(student.fullName);
  const [school, setSchool] = useState(student.school);
  const [location, setLocation] = useState(student.location);
  const [district, setDistrict] = useState(student.district);

  const handleSave = () => {
    updateStudent({
      fullName: name,
      school,
      location,
      district,
    });
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
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
          <Text style={styles.headerTitle}>My Academic Profile</Text>
          <View style={styles.avatarMini}>
            <Ionicons name="person" size={16} color={Brand.primary} />
          </View>
        </View>

        {/* Section 1: Personal */}
        <View style={styles.profileCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardHeaderTitle}>Personal</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={Brand.success} style={{ marginRight: 4 }} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{student.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student:</Text>
            <Text style={styles.infoValue}>{student.fullName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>School:</Text>
            <Text style={styles.infoValue}>{student.school || "Not set"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{student.location || student.district || "Colombo"}</Text>
          </View>
        </View>

        {/* Section 2: A/L Information */}
        <View style={styles.profileCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardHeaderTitle}>A/L Information</Text>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>Priority</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Stream:</Text>
            <Text style={styles.infoValue}>{student.stream}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Year:</Text>
            <Text style={styles.infoValue}>{student.year}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Subjects:</Text>
            <Text style={styles.infoValue}>
              {student.subjects && student.subjects.length > 0
                ? student.subjects.map((s) => `${s.name} (${s.grade})`).join(", ")
                : "No subjects added yet"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Z-Score:</Text>
            <Text style={[styles.infoValue, { color: Brand.primary, fontWeight: "700" }]}>
              {student.zScore ? student.zScore.toFixed(4) : "0.0000"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>District:</Text>
            <Text style={styles.infoValue}>{student.district}</Text>
          </View>
        </View>

        {/* Section 3: Interests & Skills */}
        <View style={styles.profileCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardHeaderTitle}>Interests & Skills</Text>
            <View style={styles.matchReadyBadge}>
              <Text style={styles.matchReadyText}>Match-ready</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Interests:</Text>
            <Text style={styles.infoValue}>
              {student.interests && student.interests.length > 0
                ? student.interests.join(", ")
                : "Technology, Engineering"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Skills:</Text>
            <Text style={styles.infoValue}>
              {student.skills && student.skills.length > 0
                ? student.skills.join(" + ")
                : "Problem solving, Teamwork"}
            </Text>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Log Out Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" style={{ marginRight: 6 }} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={isEditing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Academic Profile</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Student Name</Text>
              <TextInput style={styles.modalInput} value={name} onChangeText={setName} />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>School</Text>
              <TextInput style={styles.modalInput} value={school} onChangeText={setSchool} />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Location / District</Text>
              <TextInput style={styles.modalInput} value={district} onChangeText={setDistrict} />
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSave}
              >
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Brand.text,
  },
  avatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Brand.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Brand.text,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: "600",
    color: Brand.success,
  },
  priorityBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
    color: Brand.primary,
  },
  matchReadyBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matchReadyText: {
    fontSize: 11,
    fontWeight: "600",
    color: Brand.primary,
  },
  infoRow: {
    flexDirection: "row",
    marginVertical: 4,
    alignItems: "flex-start",
  },
  infoLabel: {
    width: 80,
    fontSize: 13,
    color: Brand.textSecondary,
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: Brand.text,
    fontWeight: "500",
  },
  editButton: {
    flexDirection: "row",
    backgroundColor: Brand.primary,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: Brand.text,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 12,
    color: Brand.textSecondary,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Brand.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: Brand.text,
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalCancelText: {
    color: Brand.textSecondary,
    fontWeight: "600",
  },
  modalSaveBtn: {
    backgroundColor: Brand.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalSaveText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
