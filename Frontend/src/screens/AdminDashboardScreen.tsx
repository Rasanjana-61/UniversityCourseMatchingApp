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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

type AdminTab = "questions" | "inquiries" | "students" | "overview";

export const AdminDashboardScreen: React.FC = () => {
  const { adminData, adminToken, adminLogout } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>("questions");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Questions state
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionCategory, setQuestionCategory] = useState("Technology");
  const [sortOrder, setSortOrder] = useState("1");
  const [savingQuestion, setSavingQuestion] = useState(false);

  // Inquiries / Support state
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("");
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Students state
  const [students, setStudents] = useState<any[]>([]);
  const [searchStudent, setSearchStudent] = useState("");
  const [filterStream, setFilterStream] = useState("");

  // Overview state
  const [dashData, setDashData] = useState<any>(null);

  const categories = ["Technology", "Business", "Creative", "Social"];
  const streams = ["", "Physical Science", "Biological Science", "Commerce", "Arts", "Technology"];

  const loadQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    try {
      const res = await api.getQuestions();
      if (res.success) setQuestions(res.data);
    } catch (e) {
      console.log("Error loading questions:", e);
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  const loadInquiries = useCallback(async () => {
    if (!adminToken) return;
    setInquiriesLoading(true);
    try {
      const res = await api.getAdminInquiries(adminToken, {
        status: inquiryStatusFilter || undefined,
        search: inquirySearch || undefined,
      });
      if (res && res.success) setInquiries(res.data);
    } catch (e) {
      console.log("Error loading inquiries:", e);
    } finally {
      setInquiriesLoading(false);
    }
  }, [adminToken, inquiryStatusFilter, inquirySearch]);

  const loadOverview = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await api.getAdminDashboard(adminToken);
      if (res.success) setDashData(res.data);
    } catch (e) {
      console.log("Error loading dashboard:", e);
    }
  }, [adminToken]);

  const loadStudents = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await api.getAdminStudents(adminToken, {
        stream: filterStream || undefined,
        search: searchStudent || undefined,
      });
      if (res.success) setStudents(res.data);
    } catch (e) {
      console.log("Error loading students:", e);
    }
  }, [adminToken, filterStream, searchStudent]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadQuestions(), loadInquiries(), loadOverview(), loadStudents()]);
    setLoading(false);
  }, [loadQuestions, loadInquiries, loadOverview, loadStudents]);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (activeTab === "students") loadStudents();
    if (activeTab === "inquiries") loadInquiries();
  }, [filterStream, searchStudent, inquiryStatusFilter, inquirySearch, activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  // --- Questions CRUD Handlers ---
  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setQuestionCategory("Technology");
    setSortOrder(String(questions.length + 1));
    setModalVisible(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setQuestionText(q.text);
    setQuestionCategory(q.category);
    setSortOrder(String(q.sort_order || 1));
    setModalVisible(true);
  };

  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      Alert.alert("Required", "Please enter the question text.");
      return;
    }
    if (!adminToken) {
      Alert.alert("Unauthorized", "Admin token not found. Please log in again.");
      return;
    }

    setSavingQuestion(true);
    try {
      if (editingQuestion) {
        const res = await api.updateQuestion(adminToken, editingQuestion.id, {
          text: questionText.trim(),
          category: questionCategory,
          sortOrder: parseInt(sortOrder) || 1,
        });
        if (res.success) {
          Alert.alert("Success", "Question updated successfully!");
          setModalVisible(false);
          loadQuestions();
        } else {
          Alert.alert("Error", res.message || "Failed to update question.");
        }
      } else {
        const res = await api.createQuestion(adminToken, {
          text: questionText.trim(),
          category: questionCategory,
          sortOrder: parseInt(sortOrder) || questions.length + 1,
        });
        if (res.success) {
          Alert.alert("Success", "New question added to assessment!");
          setModalVisible(false);
          loadQuestions();
        } else {
          Alert.alert("Error", res.message || "Failed to create question.");
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network request failed.");
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = (id: number, text: string) => {
    Alert.alert(
      "Delete Question",
      `Are you sure you want to delete this question?\n\n"${text.slice(0, 50)}..."`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!adminToken) return;
            try {
              const res = await api.deleteQuestion(adminToken, id);
              if (res.success) {
                Alert.alert("Deleted", "Question was removed successfully.");
                loadQuestions();
              } else {
                Alert.alert("Error", res.message || "Could not delete question.");
              }
            } catch (e: any) {
              Alert.alert("Error", e.message || "Delete request failed.");
            }
          },
        },
      ]
    );
  };

  // --- Inquiries Handlers ---
  const openReplyModal = (inq: any) => {
    setSelectedInquiry(inq);
    setReplyText(inq.admin_reply || "");
    setReplyModalVisible(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      Alert.alert("Required", "Please write a response before sending.");
      return;
    }
    if (!adminToken || !selectedInquiry) return;

    setSendingReply(true);
    try {
      const res = await api.replyToInquiry(adminToken, selectedInquiry.id, replyText.trim(), "Replied");
      if (res && res.success) {
        Alert.alert("Reply Sent", "Your response has been sent to the student!");
        setReplyModalVisible(false);
        loadInquiries();
      } else {
        Alert.alert("Error", res?.message || "Failed to send response.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network error.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseInquiry = (id: number) => {
    Alert.alert("Close Inquiry", "Mark this student inquiry as Closed/Resolved?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Closed",
        onPress: async () => {
          if (!adminToken) return;
          try {
            await api.replyToInquiry(adminToken, id, selectedInquiry?.admin_reply || "Inquiry resolved.", "Closed");
            loadInquiries();
          } catch (e) {
            console.log(e);
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out from the Admin Panel?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => adminLogout() },
    ]);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Technology":
        return "#3B82F6";
      case "Business":
        return "#10B981";
      case "Creative":
        return "#8B5CF6";
      case "Social":
        return "#F59E0B";
      default:
        return Brand.primary;
    }
  };

  const getInquiryStatusBadge = (status: string) => {
    switch (status) {
      case "Replied":
        return { bg: "#ECFDF5", text: "#059669", icon: "checkmark-circle", label: "Replied" };
      case "Closed":
        return { bg: "#F1F5F9", text: "#64748B", icon: "archive-outline", label: "Closed" };
      default:
        return { bg: "#FFFBEB", text: "#D97706", icon: "time-outline", label: "Pending" };
    }
  };

  const getZScoreColor = (z: number) => {
    if (z >= 2.0) return "#10B981";
    if (z >= 1.7) return "#3B82F6";
    if (z >= 1.4) return "#F59E0B";
    return "#EF4444";
  };

  const pendingInquiriesCount = inquiries.filter((i) => i.status === "Pending").length;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.adminBadgeText}>ADMIN CONTROL</Text>
          </View>
          <Text style={styles.headerTitle}>{adminData?.fullName || "Administrator"}</Text>
          <Text style={styles.headerSubtitle}>{adminData?.email || "Platform Control"}</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Modern Filter Pill Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === "questions" && styles.tabItemActive]}
          onPress={() => setActiveTab("questions")}
        >
          <Ionicons
            name="help-circle-outline"
            size={16}
            color={activeTab === "questions" ? "#FFFFFF" : Brand.textMuted}
          />
          <Text
            style={[styles.tabItemText, activeTab === "questions" && styles.tabItemTextActive]}
          >
            Questions ({questions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === "inquiries" && styles.tabItemActive]}
          onPress={() => setActiveTab("inquiries")}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={16}
            color={activeTab === "inquiries" ? "#FFFFFF" : Brand.textMuted}
          />
          <Text
            style={[styles.tabItemText, activeTab === "inquiries" && styles.tabItemTextActive]}
          >
            Inquiries {pendingInquiriesCount > 0 ? `(${pendingInquiriesCount})` : ""}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === "students" && styles.tabItemActive]}
          onPress={() => setActiveTab("students")}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={activeTab === "students" ? "#FFFFFF" : Brand.textMuted}
          />
          <Text
            style={[styles.tabItemText, activeTab === "students" && styles.tabItemTextActive]}
          >
            Students
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === "overview" && styles.tabItemActive]}
          onPress={() => setActiveTab("overview")}
        >
          <Ionicons
            name="bar-chart-outline"
            size={16}
            color={activeTab === "overview" ? "#FFFFFF" : Brand.textMuted}
          />
          <Text
            style={[styles.tabItemText, activeTab === "overview" && styles.tabItemTextActive]}
          >
            Stats
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={Brand.primary} />
          <Text style={styles.loadingText}>Loading Admin Panel...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Brand.primary} />
          }
        >
          {/* TAB 1: QUESTIONS CRUD */}
          {activeTab === "questions" && (
            <View style={styles.tabContent}>
              <View style={styles.actionBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerHeading}>Aptitude Questions CRUD</Text>
                  <Text style={styles.bannerSub}>
                    Manage all questions used by the AI Career Assessment.
                  </Text>
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.addBtnText}>Add Question</Text>
                </TouchableOpacity>
              </View>

              {questionsLoading ? (
                <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
              ) : questions.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="help-buoy-outline" size={48} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Questions Found</Text>
                  <Text style={styles.emptySub}>Click the 'Add Question' button above to seed.</Text>
                </View>
              ) : (
                questions.map((q, idx) => {
                  const catColor = getCategoryColor(q.category);
                  return (
                    <View key={q.id} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.qNumberPill}>
                          <Text style={styles.qNumberText}>#{q.sort_order || idx + 1}</Text>
                        </View>
                        <View style={[styles.categoryBadge, { backgroundColor: `${catColor}15` }]}>
                          <View style={[styles.catDot, { backgroundColor: catColor }]} />
                          <Text style={[styles.categoryText, { color: catColor }]}>
                            {q.category}
                          </Text>
                        </View>

                        <View style={styles.cardActionGroup}>
                          <TouchableOpacity style={styles.iconActionBtn} onPress={() => openEditModal(q)}>
                            <Ionicons name="pencil" size={16} color={Brand.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconActionBtn, styles.deleteBtn]}
                            onPress={() => handleDeleteQuestion(q.id, q.text)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.qText}>{q.text}</Text>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 2: INQUIRIES & MESSAGES MANAGEMENT (2️⃣5️⃣ Screen) */}
          {activeTab === "inquiries" && (
            <View style={styles.tabContent}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Brand.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search inquiries by student or keyword..."
                  placeholderTextColor={Brand.textMuted}
                  value={inquirySearch}
                  onChangeText={setInquirySearch}
                />
                {inquirySearch ? (
                  <TouchableOpacity onPress={() => setInquirySearch("")}>
                    <Ionicons name="close-circle" size={18} color={Brand.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Status Filter Row */}
              <View style={styles.filterPillsRow}>
                {["", "Pending", "Replied", "Closed"].map((st) => {
                  const selected = inquiryStatusFilter === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[styles.filterPill, selected && styles.filterPillActive]}
                      onPress={() => setInquiryStatusFilter(st)}
                    >
                      <Text style={[styles.filterPillText, selected && styles.filterPillTextActive]}>
                        {st || "All Inquiries"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionHeader}>
                Student Inquiries & Requests ({inquiries.length})
              </Text>

              {inquiriesLoading ? (
                <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
              ) : inquiries.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="chatbubbles-outline" size={48} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Inquiries Found</Text>
                  <Text style={styles.emptySub}>All student messages have been answered or resolved.</Text>
                </View>
              ) : (
                inquiries.map((inq) => {
                  const badge = getInquiryStatusBadge(inq.status);
                  return (
                    <View key={inq.id} style={styles.inquiryCard}>
                      <View style={styles.inquiryCardTop}>
                        <View style={styles.studentBadgeWrap}>
                          <Text style={styles.studentNameTag}>{inq.student_name || "Student"}</Text>
                          <Text style={styles.studentEmailTag}>{inq.student_email}</Text>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                          <Ionicons name={badge.icon as any} size={12} color={badge.text} style={{ marginRight: 4 }} />
                          <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                            {badge.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.inquirySubject}>{inq.subject}</Text>
                      <Text style={styles.inquiryMessage}>{inq.message}</Text>

                      {inq.admin_reply ? (
                        <View style={styles.adminReplySnippet}>
                          <Ionicons name="checkmark-done" size={14} color="#059669" />
                          <Text style={styles.adminReplyText} numberOfLines={3}>
                            <Text style={{ fontWeight: "700" }}>Your Reply: </Text>
                            {inq.admin_reply}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.inquiryActionRow}>
                        <Text style={styles.inquiryDate}>
                          {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : ""}
                        </Text>
                        <TouchableOpacity
                          style={styles.replyActionBtn}
                          onPress={() => openReplyModal(inq)}
                        >
                          <Ionicons
                            name={inq.admin_reply ? "pencil-outline" : "paper-plane-outline"}
                            size={14}
                            color="#FFFFFF"
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.replyActionBtnText}>
                            {inq.admin_reply ? "Edit Reply" : "Reply to Student"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* TAB 3: STUDENTS MONITORING */}
          {activeTab === "students" && (
            <View style={styles.tabContent}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Brand.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search students by name or email..."
                  placeholderTextColor={Brand.textMuted}
                  value={searchStudent}
                  onChangeText={setSearchStudent}
                />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.streamFilterScroll}>
                {streams.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.streamPill, filterStream === s && styles.streamPillActive]}
                    onPress={() => setFilterStream(s)}
                  >
                    <Text style={[styles.streamPillText, filterStream === s && styles.streamPillTextActive]}>
                      {s || "All Streams"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionHeader}>Registered Students ({students.length})</Text>

              {students.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="school-outline" size={44} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Students Found</Text>
                </View>
              ) : (
                students.map((st) => (
                  <View key={st.id} style={styles.card}>
                    <View style={styles.studentCardHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(st.fullName || "S").charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.studentName}>{st.fullName}</Text>
                        <Text style={styles.studentEmail}>{st.email}</Text>
                      </View>
                      <View style={[styles.zScoreBadge, { backgroundColor: `${getZScoreColor(st.zScore)}15` }]}>
                        <Text style={[styles.zScoreText, { color: getZScoreColor(st.zScore) }]}>
                          Z: {st.zScore ? st.zScore.toFixed(4) : "N/A"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.studentMetaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="book-outline" size={13} color={Brand.textMuted} />
                        <Text style={styles.metaText}>{st.stream || "General"}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={13} color={Brand.textMuted} />
                        <Text style={styles.metaText}>{st.district || "Sri Lanka"}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 4: OVERVIEW & ANALYTICS */}
          {activeTab === "overview" && dashData && (
            <View style={styles.tabContent}>
              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { borderLeftColor: Brand.primary }]}>
                  <Text style={styles.statLabel}>Total Students</Text>
                  <Text style={styles.statNum}>{dashData.summary?.totalStudents || 0}</Text>
                </View>
                <View style={[styles.statBox, { borderLeftColor: "#10B981" }]}>
                  <Text style={styles.statLabel}>Avg Z-Score</Text>
                  <Text style={[styles.statNum, { color: "#10B981" }]}>
                    {dashData.summary?.averageZScore?.toFixed(3) || "0.000"}
                  </Text>
                </View>
                <View style={[styles.statBox, { borderLeftColor: "#8B5CF6" }]}>
                  <Text style={styles.statLabel}>Govt Courses</Text>
                  <Text style={styles.statNum}>{dashData.summary?.totalCourses || 0}</Text>
                </View>
                <View style={[styles.statBox, { borderLeftColor: "#F59E0B" }]}>
                  <Text style={styles.statLabel}>Questions</Text>
                  <Text style={[styles.statNum, { color: "#F59E0B" }]}>
                    {questions.length || dashData.summary?.totalQuestions || 10}
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Students by A/L Stream</Text>
                {dashData.streamDistribution?.map((item: any) => (
                  <View key={item.stream} style={styles.distributionRow}>
                    <Text style={styles.distLabel}>{item.stream}</Text>
                    <View style={styles.distBarWrap}>
                      <View
                        style={[
                          styles.distBarFill,
                          {
                            width: `${Math.min(
                              100,
                              (item.count / (dashData.summary?.totalStudents || 1)) * 100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.distCount}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* MODAL 1: CREATE / EDIT QUESTION */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingQuestion ? "Edit Question" : "Add New Aptitude Question"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Brand.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.modalLabel}>Question Text *</Text>
              <TextInput
                style={styles.modalTextInput}
                multiline
                numberOfLines={3}
                placeholder="e.g. I enjoy designing systems and troubleshooting bugs..."
                placeholderTextColor={Brand.textMuted}
                value={questionText}
                onChangeText={setQuestionText}
              />

              <Text style={styles.modalLabel}>Category / Trait *</Text>
              <View style={styles.catPickerGrid}>
                {categories.map((cat) => {
                  const isSelected = questionCategory === cat;
                  const catColor = getCategoryColor(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catOptionBtn,
                        isSelected && { borderColor: catColor, backgroundColor: `${catColor}15` },
                      ]}
                      onPress={() => setQuestionCategory(cat)}
                    >
                      <View style={[styles.catDot, { backgroundColor: catColor }]} />
                      <Text style={[styles.catOptionText, isSelected && { color: catColor, fontWeight: "700" }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Order Position</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={sortOrder}
                onChangeText={setSortOrder}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setModalVisible(false)}
                  disabled={savingQuestion}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, savingQuestion && { opacity: 0.6 }]}
                  onPress={handleSaveQuestion}
                  disabled={savingQuestion}
                >
                  {savingQuestion ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>
                      {editingQuestion ? "Save Changes" : "Create Question"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: REPLY TO INQUIRY */}
      <Modal visible={replyModalVisible} transparent animationType="slide" onRequestClose={() => setReplyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "85%" }]}>
            {selectedInquiry && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalCategoryText}>Responding to {selectedInquiry.student_name}</Text>
                    <Text style={styles.modalTitle}>{selectedInquiry.subject}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Brand.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalLabel}>Student Question:</Text>
                  <View style={styles.studentQuestionQuote}>
                    <Text style={styles.quoteText}>{selectedInquiry.message}</Text>
                  </View>

                  <Text style={styles.modalLabel}>Official Advisor Response *</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 110 }]}
                    multiline
                    placeholder="Type official guidance, UGC entrance guidelines or solution..."
                    placeholderTextColor={Brand.textMuted}
                    value={replyText}
                    onChangeText={setReplyText}
                  />

                  <View style={styles.modalBtnRow}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => handleCloseInquiry(selectedInquiry.id)}
                    >
                      <Text style={[styles.modalCancelText, { color: "#64748B" }]}>Close Ticket</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalSaveBtn, sendingReply && { opacity: 0.6 }]}
                      onPress={handleSendReply}
                      disabled={sendingReply}
                    >
                      {sendingReply ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.modalSaveText}>Send Response</Text>
                      )}
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
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerLeft: { flex: 1 },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  adminBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Brand.text },
  headerSubtitle: { fontSize: 12, color: Brand.textMuted },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
  },
  logoutBtnText: { fontSize: 13, fontWeight: "600", color: "#EF4444", marginLeft: 4 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  tabItemActive: { backgroundColor: Brand.primary },
  tabItemText: { fontSize: 11, fontWeight: "600", color: Brand.textSecondary, marginLeft: 4 },
  tabItemTextActive: { color: "#FFFFFF", fontWeight: "700" },
  centerLoading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, color: Brand.textMuted, fontSize: 14 },
  content: { flex: 1 },
  tabContent: { padding: 16 },
  actionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bannerHeading: { fontSize: 16, fontWeight: "700", color: Brand.text },
  bannerSub: { fontSize: 12, color: Brand.textMuted, marginTop: 2 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  qNumberPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  qNumberText: { fontSize: 12, fontWeight: "700", color: Brand.textSecondary },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  catDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  categoryText: { fontSize: 12, fontWeight: "700" },
  cardActionGroup: { flexDirection: "row", marginLeft: "auto", gap: 8 },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: { backgroundColor: "#FEE2E2" },
  qText: { fontSize: 14, lineHeight: 20, color: Brand.text, fontWeight: "500" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: Brand.text, marginTop: 10 },
  emptySub: { fontSize: 13, color: Brand.textMuted, marginTop: 4, textAlign: "center" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: Brand.text, marginLeft: 8 },
  filterPillsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterPillActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  filterPillText: { fontSize: 12, color: Brand.textSecondary, fontWeight: "600" },
  filterPillTextActive: { color: "#FFFFFF", fontWeight: "700" },
  inquiryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inquiryCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  studentBadgeWrap: { flex: 1 },
  studentNameTag: { fontSize: 14, fontWeight: "700", color: Brand.text },
  studentEmailTag: { fontSize: 11, color: Brand.textMuted },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  inquirySubject: { fontSize: 15, fontWeight: "700", color: Brand.text, marginBottom: 6 },
  inquiryMessage: { fontSize: 13, color: Brand.textSecondary, lineHeight: 19, marginBottom: 10 },
  adminReplySnippet: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  adminReplyText: { flex: 1, fontSize: 12, color: "#065F46", marginLeft: 6, lineHeight: 16 },
  inquiryActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  inquiryDate: { fontSize: 12, color: Brand.textMuted },
  replyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  replyActionBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  streamFilterScroll: { flexDirection: "row", marginBottom: 16 },
  streamPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  streamPillActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  streamPillText: { fontSize: 12, color: Brand.textSecondary, fontWeight: "600" },
  streamPillTextActive: { color: "#FFFFFF", fontWeight: "700" },
  sectionHeader: { fontSize: 15, fontWeight: "700", color: Brand.text, marginBottom: 10 },
  studentCardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Brand.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: Brand.primary },
  studentName: { fontSize: 14, fontWeight: "700", color: Brand.text },
  studentEmail: { fontSize: 12, color: Brand.textMuted, marginTop: 1 },
  zScoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  zScoreText: { fontSize: 12, fontWeight: "700" },
  studentMetaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 12, color: Brand.textSecondary, marginLeft: 4 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  statBox: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statLabel: { fontSize: 12, color: Brand.textMuted, fontWeight: "600" },
  statNum: { fontSize: 22, fontWeight: "800", color: Brand.text, marginTop: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: Brand.text, marginBottom: 12 },
  distributionRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  distLabel: { width: 120, fontSize: 12, color: Brand.textSecondary, fontWeight: "500" },
  distBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  distBarFill: { height: "100%", backgroundColor: Brand.primary, borderRadius: 4 },
  distCount: { width: 30, fontSize: 12, fontWeight: "700", color: Brand.text, textAlign: "right" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: "80%",
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
  modalCategoryText: { fontSize: 12, color: Brand.primary, fontWeight: "700", marginBottom: 2 },
  modalTitle: { fontSize: 17, fontWeight: "700", color: Brand.text },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  modalTextInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Brand.text,
    minHeight: 80,
    textAlignVertical: "top",
  },
  studentQuestionQuote: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Brand.primary,
  },
  quoteText: { fontSize: 13, color: Brand.text, lineHeight: 18 },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: Brand.text,
  },
  catPickerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  catOptionText: { fontSize: 12, color: Brand.textSecondary, fontWeight: "600" },
  modalBtnRow: { flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 20 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 14, fontWeight: "600", color: Brand.textSecondary },
  modalSaveBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Brand.primary,
    alignItems: "center",
  },
  modalSaveText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
