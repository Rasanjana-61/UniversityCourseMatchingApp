import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

const CATEGORIES = [
  { id: "Admissions", label: "Admissions", icon: "school-outline", color: "#3B82F6" },
  { id: "Cutoffs", label: "Z-Scores & Cutoffs", icon: "stats-chart-outline", color: "#10B981" },
  { id: "Scholarships", label: "Scholarships", icon: "ribbon-outline", color: "#F59E0B" },
  { id: "Technical", label: "App & Technical", icon: "construct-outline", color: "#8B5CF6" },
];

export const StudentInquiriesScreen: React.FC = () => {
  const { student, setCurrentScreen } = useApp();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State for New Inquiry
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState("Admissions");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Selected Inquiry for viewing details
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  const loadInquiries = useCallback(async () => {
    if (!student?.email) return;
    try {
      const res = await api.getMyInquiries(student.email);
      if (res && res.success) {
        setInquiries(res.data);
      }
    } catch (e) {
      console.log("Error loading inquiries:", e);
    } finally {
      setLoading(false);
    }
  }, [student?.email]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInquiries();
    setRefreshing(false);
  };

  const handleOpenModal = () => {
    setCategory("Admissions");
    setSubject("");
    setMessage("");
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Missing Details", "Please enter both Subject and your Message.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createInquiry({
        studentEmail: student.email,
        studentName: student.fullName || "Student",
        category,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res && res.success) {
        Alert.alert(
          "Inquiry Submitted",
          "Your inquiry has been sent to our academic advisors. We will reply as soon as possible!",
          [{ text: "OK", onPress: () => setModalVisible(false) }]
        );
        loadInquiries();
      } else {
        Alert.alert("Error", res?.message || "Failed to submit inquiry.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Network request failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteInquiry = (id: number) => {
    Alert.alert(
      "Delete Inquiry",
      "Are you sure you want to delete this inquiry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteInquiry(id);
              if (res && res.success) {
                setSelectedInquiry(null);
                loadInquiries();
              } else {
                Alert.alert("Error", res?.message || "Failed to delete inquiry.");
              }
            } catch (e: any) {
              Alert.alert("Error", e?.message || "Network error.");
            }
          },
        },
      ]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Replied":
        return {
          bg: "#ECFDF5",
          text: "#059669",
          border: "#A7F3D0",
          icon: "checkmark-circle",
          label: "Replied",
        };
      case "Closed":
        return {
          bg: "#F1F5F9",
          text: "#64748B",
          border: "#CBD5E1",
          icon: "archive-outline",
          label: "Closed",
        };
      default:
        return {
          bg: "#FFFBEB",
          text: "#D97706",
          border: "#FDE68A",
          icon: "time-outline",
          label: "Pending",
        };
    }
  };

  const getCatColor = (cat: string) => {
    const found = CATEGORIES.find((c) => c.id === cat);
    return found ? found.color : Brand.primary;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen("profile")}
        >
          <Ionicons name="arrow-back" size={24} color={Brand.text} />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Help & Support Desk</Text>
          <Text style={styles.headerSubtitle}>Ask questions to university advisors</Text>
        </View>
        <TouchableOpacity style={styles.createHeaderBtn} onPress={handleOpenModal}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={Brand.primary} />
          <Text style={styles.loadingText}>Loading inquiries...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Brand.primary} />
          }
        >
          {/* Quick Info Card */}
          <View style={styles.infoBanner}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="chatbubbles" size={24} color={Brand.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.infoBannerTitle}>Have an academic question?</Text>
              <Text style={styles.infoBannerSub}>
                Inquire about UGC admission criteria, aptitude tests, cutoff shifts, or scholarship eligibility.
              </Text>
            </View>
          </View>

          {/* Quick Submit CTA */}
          <TouchableOpacity style={styles.newInquiryBtn} onPress={handleOpenModal} activeOpacity={0.88}>
            <Ionicons name="help-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.newInquiryBtnText}>Ask a New Question</Text>
          </TouchableOpacity>

          {/* Section Header */}
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>My Inquiries ({inquiries.length})</Text>
            <Text style={styles.sectionSub}>Tap any card to view advisor response</Text>
          </View>

          {inquiries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="mail-open-outline" size={54} color={Brand.textMuted} />
              <Text style={styles.emptyTitle}>No Inquiries Yet</Text>
              <Text style={styles.emptySub}>
                You haven't submitted any questions yet. Tap 'Ask a New Question' above.
              </Text>
            </View>
          ) : (
            inquiries.map((item) => {
              const status = getStatusBadge(item.status);
              const catColor = getCatColor(item.category);
              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleDateString()
                : "Recent";

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.inquiryCard}
                  onPress={() => setSelectedInquiry(item)}
                  activeOpacity={0.7}
                >
                  {/* Top Row: Category + Status */}
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.catBadge, { backgroundColor: `${catColor}15` }]}>
                      <View style={[styles.catDot, { backgroundColor: catColor }]} />
                      <Text style={[styles.catBadgeText, { color: catColor }]}>
                        {item.category}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: status.bg, borderColor: status.border },
                      ]}
                    >
                      <Ionicons
                        name={status.icon as any}
                        size={12}
                        color={status.text}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.statusText, { color: status.text }]}>
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  {/* Subject */}
                  <Text style={styles.cardSubject}>{item.subject}</Text>

                  {/* Message Preview */}
                  <Text style={styles.cardMessage} numberOfLines={2}>
                    {item.message}
                  </Text>

                  {/* Admin Reply Snippet if Replied */}
                  {item.admin_reply ? (
                    <View style={styles.replySnippetBox}>
                      <Ionicons name="return-down-forward" size={14} color="#059669" />
                      <Text style={styles.replySnippetText} numberOfLines={2}>
                        <Text style={{ fontWeight: "700" }}>Advisor: </Text>
                        {item.admin_reply}
                      </Text>
                    </View>
                  ) : null}

                  {/* Card Footer */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>{dateStr}</Text>
                    <View style={styles.cardFooterActions}>
                      <TouchableOpacity
                        style={styles.deleteCardBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleDeleteInquiry(item.id);
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      </TouchableOpacity>
                      <View style={styles.viewDetailsRow}>
                        <Text style={styles.viewDetailsText}>View Response</Text>
                        <Ionicons name="chevron-forward" size={14} color={Brand.primary} />
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* MODAL 1: NEW INQUIRY MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ask an Academic Advisor</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Brand.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category Selector */}
              <Text style={styles.fieldLabel}>Select Topic / Category</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map((cat) => {
                  const selected = category === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.catPill,
                        selected && { borderColor: cat.color, backgroundColor: `${cat.color}15` },
                      ]}
                      onPress={() => setCategory(cat.id)}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={16}
                        color={selected ? cat.color : Brand.textMuted}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.catPillText,
                          selected && { color: cat.color, fontWeight: "700" },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Subject */}
              <Text style={styles.fieldLabel}>Subject / Question Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. UGC Admission criteria for Biological Science"
                placeholderTextColor={Brand.textMuted}
                value={subject}
                onChangeText={setSubject}
              />

              {/* Message */}
              <Text style={styles.fieldLabel}>Detailed Question *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Describe your inquiry in detail. Mention specific courses, universities, or results..."
                placeholderTextColor={Brand.textMuted}
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
              />

              {/* Action Buttons */}
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                  disabled={submitting}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                  onPress={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitBtnText}>Submit Inquiry</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 2: INQUIRY DETAILS & RESPONSE VIEW */}
      <Modal
        visible={!!selectedInquiry}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedInquiry(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "85%" }]}>
            {selectedInquiry && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalCategoryText}>
                      {selectedInquiry.category} Inquiry
                    </Text>
                    <Text style={styles.modalTitle}>{selectedInquiry.subject}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedInquiry(null)}>
                    <Ionicons name="close" size={24} color={Brand.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Status Banner */}
                  <View
                    style={[
                      styles.statusBanner,
                      {
                        backgroundColor: getStatusBadge(selectedInquiry.status).bg,
                        borderColor: getStatusBadge(selectedInquiry.status).border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={getStatusBadge(selectedInquiry.status).icon as any}
                      size={18}
                      color={getStatusBadge(selectedInquiry.status).text}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.statusBannerText,
                        { color: getStatusBadge(selectedInquiry.status).text },
                      ]}
                    >
                      Status: {getStatusBadge(selectedInquiry.status).label}
                    </Text>
                  </View>

                  {/* Student Question Box */}
                  <Text style={styles.detailSectionLabel}>Your Question:</Text>
                  <View style={styles.questionBox}>
                    <Text style={styles.questionDetailText}>{selectedInquiry.message}</Text>
                    <Text style={styles.questionDetailDate}>
                      Submitted on: {new Date(selectedInquiry.created_at).toLocaleString()}
                    </Text>
                  </View>

                  {/* Advisor Response Box */}
                  <Text style={styles.detailSectionLabel}>Academic Advisor Response:</Text>
                  {selectedInquiry.admin_reply ? (
                    <View style={styles.replyBox}>
                      <View style={styles.replyHeader}>
                        <Ionicons name="person-circle-outline" size={20} color="#059669" />
                        <Text style={styles.replyAuthor}>
                          {selectedInquiry.replied_by || "University Guidance Advisor"}
                        </Text>
                        <Text style={styles.replyDate}>
                          {selectedInquiry.replied_at
                            ? new Date(selectedInquiry.replied_at).toLocaleDateString()
                            : ""}
                        </Text>
                      </View>
                      <Text style={styles.replyDetailText}>
                        {selectedInquiry.admin_reply}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.noReplyBox}>
                      <Ionicons name="hourglass-outline" size={28} color="#D97706" />
                      <Text style={styles.noReplyTitle}>Waiting for response</Text>
                      <Text style={styles.noReplySub}>
                        An academic advisor is currently reviewing your inquiry. We will notify you once answered.
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailBtnRow}>
                    <TouchableOpacity
                      style={styles.deleteDetailBtn}
                      onPress={() => handleDeleteInquiry(selectedInquiry.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.deleteDetailBtnText}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.closeDetailBtn}
                      onPress={() => setSelectedInquiry(null)}
                    >
                      <Text style={styles.closeDetailBtnText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Brand.textMuted,
  },
  createHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Brand.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  centerLoading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: Brand.textMuted,
    fontSize: 14,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  infoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Brand.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.text,
  },
  infoBannerSub: {
    fontSize: 12,
    color: Brand.textMuted,
    marginTop: 2,
    lineHeight: 17,
  },
  newInquiryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Brand.primary,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  newInquiryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
  },
  sectionSub: {
    fontSize: 12,
    color: Brand.textMuted,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: Brand.textMuted,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  inquiryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  catDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  catBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardSubject: {
    fontSize: 15,
    fontWeight: "700",
    color: Brand.text,
    marginBottom: 6,
  },
  cardMessage: {
    fontSize: 13,
    color: Brand.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  replySnippetBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  replySnippetText: {
    flex: 1,
    fontSize: 12,
    color: "#065F46",
    marginLeft: 6,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  dateText: {
    fontSize: 12,
    color: Brand.textMuted,
  },
  cardFooterActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteCardBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  viewDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.primary,
    marginRight: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalCategoryText: {
    fontSize: 12,
    color: Brand.primary,
    fontWeight: "700",
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Brand.text,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.textSecondary,
    marginBottom: 8,
    marginTop: 12,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  catPillText: {
    fontSize: 12,
    color: Brand.textSecondary,
    fontWeight: "600",
  },
  textInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 14,
    color: Brand.text,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
    marginBottom: 20,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Brand.textSecondary,
  },
  submitBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Brand.primary,
    alignItems: "center",
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusBannerText: {
    fontSize: 13,
    fontWeight: "700",
  },
  detailSectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Brand.textSecondary,
    marginBottom: 8,
  },
  questionBox: {
    backgroundColor: "#F8FAFC",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  questionDetailText: {
    fontSize: 14,
    lineHeight: 20,
    color: Brand.text,
  },
  questionDetailDate: {
    fontSize: 11,
    color: Brand.textMuted,
    marginTop: 8,
  },
  replyBox: {
    backgroundColor: "#ECFDF5",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 20,
  },
  replyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  replyAuthor: {
    fontSize: 13,
    fontWeight: "700",
    color: "#065F46",
    marginLeft: 6,
    flex: 1,
  },
  replyDate: {
    fontSize: 11,
    color: "#059669",
  },
  replyDetailText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#064E3B",
  },
  noReplyBox: {
    backgroundColor: "#FFFBEB",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
    alignItems: "center",
    marginBottom: 20,
  },
  noReplyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    marginTop: 8,
  },
  noReplySub: {
    fontSize: 12,
    color: "#B45309",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 17,
  },
  detailBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  deleteDetailBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 12,
  },
  deleteDetailBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  closeDetailBtn: {
    flex: 1.5,
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  closeDetailBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: Brand.textSecondary,
  },
});
