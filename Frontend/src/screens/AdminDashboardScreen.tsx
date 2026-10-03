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

type AdminTab = "universities" | "courses" | "questions" | "inquiries" | "students" | "overview";

const sriLankanDistricts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle"
];

const streamsList = [
  "Physical Science",
  "Biological Science",
  "Commerce",
  "Arts",
  "Technology"
];

const degreeTypesList = [
  "B.Sc. (Hons)",
  "B.Sc.",
  "B.A. (Hons)",
  "B.Com",
  "B.Tech",
  "MBBS",
  "LLB",
  "BBA",
  "B.Eng"
];

export const AdminDashboardScreen: React.FC = () => {
  const { adminData, adminToken, adminLogout } = useApp();
  const [activeTab, setActiveTab] = useState<AdminTab>("universities");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Universities state ---
  const [universities, setUniversities] = useState<any[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [uniSearch, setUniSearch] = useState("");
  const [uniModalVisible, setUniModalVisible] = useState(false);
  const [editingUni, setEditingUni] = useState<any | null>(null);
  const [uniName, setUniName] = useState("");
  const [uniShortName, setUniShortName] = useState("");
  const [uniLocation, setUniLocation] = useState("");
  const [uniDistrict, setUniDistrict] = useState("Colombo");
  const [uniWebsite, setUniWebsite] = useState("");
  const [uniLogoUrl, setUniLogoUrl] = useState("");
  const [uniDescription, setUniDescription] = useState("");
  const [savingUni, setSavingUni] = useState(false);

  // --- Courses state ---
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStreamFilter, setCourseStreamFilter] = useState("");
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [courseUniId, setCourseUniId] = useState<string>("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseStream, setCourseStream] = useState("Physical Science");
  const [courseDegreeType, setCourseDegreeType] = useState("B.Sc. (Hons)");
  const [courseDurationYears, setCourseDurationYears] = useState("4");
  const [courseMinZScore, setCourseMinZScore] = useState("1.5000");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCareerPaths, setCourseCareerPaths] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);

  // --- Questions state ---
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionCategory, setQuestionCategory] = useState("Technology");
  const [sortOrder, setSortOrder] = useState("1");
  const [savingQuestion, setSavingQuestion] = useState(false);

  // --- Inquiries state ---
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("");
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // --- Students state ---
  const [students, setStudents] = useState<any[]>([]);
  const [searchStudent, setSearchStudent] = useState("");
  const [filterStream, setFilterStream] = useState("");

  // --- Overview state ---
  const [dashData, setDashData] = useState<any>(null);

  const categories = ["Technology", "Business", "Creative", "Social"];
  const studentStreamFilters = ["", "Physical Science", "Biological Science", "Commerce", "Arts", "Technology"];

  // --- Loaders ---
  const loadUniversities = useCallback(async () => {
    setUniversitiesLoading(true);
    try {
      const res = await api.getUniversities();
      if (res && res.success) {
        setUniversities(res.data || []);
      }
    } catch (e) {
      console.log("Error loading universities:", e);
    } finally {
      setUniversitiesLoading(false);
    }
  }, []);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await api.getCourses({
        stream: courseStreamFilter || undefined,
        search: courseSearch || undefined,
      });
      if (res && res.success) {
        setCourses(res.data || []);
      }
    } catch (e) {
      console.log("Error loading courses:", e);
    } finally {
      setCoursesLoading(false);
    }
  }, [courseStreamFilter, courseSearch]);

  const loadQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    try {
      const res = await api.getQuestions();
      if (res && res.success) setQuestions(res.data || []);
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
      if (res && res.success) setInquiries(res.data || []);
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
      if (res && res.success) setDashData(res.data);
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
      if (res && res.success) setStudents(res.data || []);
    } catch (e) {
      console.log("Error loading students:", e);
    }
  }, [adminToken, filterStream, searchStudent]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadUniversities(),
      loadCourses(),
      loadQuestions(),
      loadInquiries(),
      loadOverview(),
      loadStudents(),
    ]);
    setLoading(false);
  }, [loadUniversities, loadCourses, loadQuestions, loadInquiries, loadOverview, loadStudents]);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (activeTab === "universities") loadUniversities();
    if (activeTab === "courses") loadCourses();
    if (activeTab === "students") loadStudents();
    if (activeTab === "inquiries") loadInquiries();
  }, [activeTab, courseStreamFilter, courseSearch, filterStream, searchStudent, inquiryStatusFilter, inquirySearch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  // --- Universities CRUD Handlers ---
  const openCreateUniModal = () => {
    setEditingUni(null);
    setUniName("");
    setUniShortName("");
    setUniLocation("");
    setUniDistrict("Colombo");
    setUniWebsite("");
    setUniLogoUrl("");
    setUniDescription("");
    setUniModalVisible(true);
  };

  const openEditUniModal = (uni: any) => {
    setEditingUni(uni);
    setUniName(uni.name || "");
    setUniShortName(uni.short_name || "");
    setUniLocation(uni.location || "");
    setUniDistrict(uni.district || "Colombo");
    setUniWebsite(uni.website || "");
    setUniLogoUrl(uni.logo_url || "");
    setUniDescription(uni.description || "");
    setUniModalVisible(true);
  };

  const handleSaveUniversity = async () => {
    if (!uniName.trim()) {
      Alert.alert("Required", "Please enter the university name.");
      return;
    }
    if (!uniShortName.trim()) {
      Alert.alert("Required", "Please enter the short code (e.g. UOM).");
      return;
    }
    if (!uniLocation.trim() || !uniDistrict.trim()) {
      Alert.alert("Required", "Please provide location and district.");
      return;
    }

    setSavingUni(true);
    try {
      const payload = {
        name: uniName.trim(),
        shortName: uniShortName.trim().toUpperCase(),
        location: uniLocation.trim(),
        district: uniDistrict.trim(),
        website: uniWebsite.trim() || undefined,
        logoUrl: uniLogoUrl.trim() || undefined,
        description: uniDescription.trim() || undefined,
      };

      if (editingUni) {
        const res = await api.updateUniversity(editingUni.id, payload);
        if (res && res.success) {
          Alert.alert("Success", "University details updated successfully!");
          setUniModalVisible(false);
          loadUniversities();
        } else {
          Alert.alert("Error", res?.message || "Failed to update university.");
        }
      } else {
        const res = await api.createUniversity(payload);
        if (res && res.success) {
          Alert.alert("Success", "New university registered successfully!");
          setUniModalVisible(false);
          loadUniversities();
        } else {
          Alert.alert("Error", res?.message || "Failed to create university.");
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network error occurred.");
    } finally {
      setSavingUni(false);
    }
  };

  const handleDeleteUniversity = (id: number, name: string) => {
    Alert.alert(
      "Delete University",
      `Are you sure you want to delete "${name}"?\n\nWARNING: All courses linked to this university will also be removed!`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete University",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteUniversity(id);
              if (res && res.success) {
                Alert.alert("Deleted", "University removed successfully.");
                loadUniversities();
                loadCourses();
              } else {
                Alert.alert("Error", res?.message || "Failed to delete university.");
              }
            } catch (e: any) {
              Alert.alert("Error", e.message || "Network request failed.");
            }
          },
        },
      ]
    );
  };

  // --- Courses CRUD Handlers ---
  const openCreateCourseModal = () => {
    setEditingCourse(null);
    setCourseUniId(universities.length > 0 ? String(universities[0].id) : "");
    setCourseName("");
    setCourseCode("");
    setCourseStream("Physical Science");
    setCourseDegreeType("B.Sc. (Hons)");
    setCourseDurationYears("4");
    setCourseMinZScore("1.5000");
    setCourseDescription("");
    setCourseCareerPaths("");
    setCourseModalVisible(true);
  };

  const openEditCourseModal = (c: any) => {
    setEditingCourse(c);
    setCourseUniId(String(c.university_id));
    setCourseName(c.name || "");
    setCourseCode(c.code || "");
    setCourseStream(c.stream || "Physical Science");
    setCourseDegreeType(c.degree_type || "B.Sc. (Hons)");
    setCourseDurationYears(String(c.duration_years || 4));
    setCourseMinZScore(String(c.min_z_score || "0.0000"));
    setCourseDescription(c.description || "");
    setCourseCareerPaths(Array.isArray(c.career_paths) ? c.career_paths.join(", ") : "");
    setCourseModalVisible(true);
  };

  const handleSaveCourse = async () => {
    if (!courseUniId) {
      Alert.alert("Required", "Please select a university.");
      return;
    }
    if (!courseName.trim()) {
      Alert.alert("Required", "Please enter the course name.");
      return;
    }
    if (!courseCode.trim()) {
      Alert.alert("Required", "Please enter a course code (e.g. CS01).");
      return;
    }
    if (!courseStream.trim()) {
      Alert.alert("Required", "Please select an A/L stream.");
      return;
    }

    setSavingCourse(true);
    try {
      const careerPathsArr = courseCareerPaths
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        universityId: parseInt(String(courseUniId)),
        name: courseName.trim(),
        code: courseCode.trim().toUpperCase(),
        stream: courseStream.trim(),
        degreeType: courseDegreeType.trim(),
        durationYears: parseInt(courseDurationYears) || 4,
        minZScore: parseFloat(courseMinZScore) || 0.0,
        description: courseDescription.trim(),
        careerPaths: careerPathsArr,
      };

      if (editingCourse) {
        const res = await api.updateCourse(editingCourse.id, payload);
        if (res && res.success) {
          Alert.alert("Success", "Course updated successfully!");
          setCourseModalVisible(false);
          loadCourses();
        } else {
          Alert.alert("Error", res?.message || "Failed to update course.");
        }
      } else {
        const res = await api.createCourse(payload);
        if (res && res.success) {
          Alert.alert("Success", "New course added successfully!");
          setCourseModalVisible(false);
          loadCourses();
        } else {
          Alert.alert("Error", res?.message || "Failed to create course.");
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network error occurred.");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = (id: number, name: string) => {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to delete course "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Course",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteCourse(id);
              if (res && res.success) {
                Alert.alert("Deleted", "Course removed successfully.");
                loadCourses();
              } else {
                Alert.alert("Error", res?.message || "Failed to delete course.");
              }
            } catch (e: any) {
              Alert.alert("Error", e.message || "Network request failed.");
            }
          },
        },
      ]
    );
  };

  // --- Questions Handlers ---
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

  const getStreamColor = (st: string) => {
    if (!st) return Brand.primary;
    if (st.includes("Physical")) return "#2563EB";
    if (st.includes("Bio")) return "#059669";
    if (st.includes("Commerce")) return "#D97706";
    if (st.includes("Art")) return "#7C3AED";
    if (st.includes("Tech")) return "#DC2626";
    return Brand.primary;
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

  const filteredUniversities = universities.filter((u) => {
    if (!uniSearch.trim()) return true;
    const q = uniSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.short_name?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q) ||
      u.district?.toLowerCase().includes(q)
    );
  });

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

      {/* Horizontal Scrollable Tabs */}
      <View style={styles.tabBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScroll}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "universities" && styles.tabItemActive]}
            onPress={() => setActiveTab("universities")}
          >
            <Ionicons
              name="school-outline"
              size={15}
              color={activeTab === "universities" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "universities" && styles.tabItemTextActive]}>
              Universities ({universities.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "courses" && styles.tabItemActive]}
            onPress={() => setActiveTab("courses")}
          >
            <Ionicons
              name="book-outline"
              size={15}
              color={activeTab === "courses" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "courses" && styles.tabItemTextActive]}>
              Courses ({courses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "questions" && styles.tabItemActive]}
            onPress={() => setActiveTab("questions")}
          >
            <Ionicons
              name="help-circle-outline"
              size={15}
              color={activeTab === "questions" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "questions" && styles.tabItemTextActive]}>
              Questions ({questions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "inquiries" && styles.tabItemActive]}
            onPress={() => setActiveTab("inquiries")}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={15}
              color={activeTab === "inquiries" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "inquiries" && styles.tabItemTextActive]}>
              Inquiries {pendingInquiriesCount > 0 ? `(${pendingInquiriesCount})` : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "students" && styles.tabItemActive]}
            onPress={() => setActiveTab("students")}
          >
            <Ionicons
              name="people-outline"
              size={15}
              color={activeTab === "students" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "students" && styles.tabItemTextActive]}>
              Students ({students.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "overview" && styles.tabItemActive]}
            onPress={() => setActiveTab("overview")}
          >
            <Ionicons
              name="bar-chart-outline"
              size={15}
              color={activeTab === "overview" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "overview" && styles.tabItemTextActive]}>
              Stats
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={Brand.primary} />
          <Text style={styles.loadingText}>Loading Admin Data...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Brand.primary} />
          }
        >
          {/* ═══════════ TAB 1: UNIVERSITIES CRUD ═══════════ */}
          {activeTab === "universities" && (
            <View style={styles.tabContent}>
              <View style={styles.actionBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerHeading}>Universities Management</Text>
                  <Text style={styles.bannerSub}>
                    Manage all Sri Lankan state universities and institutes.
                  </Text>
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={openCreateUniModal}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.addBtnText}>Add University</Text>
                </TouchableOpacity>
              </View>

              {/* Search Box */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Brand.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search universities by name, short code, or district..."
                  placeholderTextColor={Brand.textMuted}
                  value={uniSearch}
                  onChangeText={setUniSearch}
                />
                {uniSearch ? (
                  <TouchableOpacity onPress={() => setUniSearch("")}>
                    <Ionicons name="close-circle" size={18} color={Brand.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {universitiesLoading ? (
                <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
              ) : filteredUniversities.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="school-outline" size={48} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Universities Found</Text>
                  <Text style={styles.emptySub}>Click the 'Add University' button above to create one.</Text>
                </View>
              ) : (
                filteredUniversities.map((uni) => (
                  <View key={uni.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.uniCodeBadge}>
                        <Text style={styles.uniCodeText}>{uni.short_name}</Text>
                      </View>
                      <View style={styles.locationPill}>
                        <Ionicons name="location-outline" size={12} color="#0369A1" style={{ marginRight: 4 }} />
                        <Text style={styles.locationPillText}>{uni.district}</Text>
                      </View>

                      <View style={styles.cardActionGroup}>
                        <TouchableOpacity style={styles.iconActionBtn} onPress={() => openEditUniModal(uni)}>
                          <Ionicons name="pencil" size={16} color={Brand.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.iconActionBtn, styles.deleteBtn]}
                          onPress={() => handleDeleteUniversity(uni.id, uni.name)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.uniCardTitle}>{uni.name}</Text>
                    <Text style={styles.uniCardLocation}>
                      <Ionicons name="navigate-outline" size={12} color={Brand.textMuted} /> {uni.location}
                    </Text>

                    <View style={styles.uniCardMetaRow}>
                      <View style={styles.coursesCountBadge}>
                        <Ionicons name="layers-outline" size={13} color="#059669" />
                        <Text style={styles.coursesCountText}>
                          {uni.courses_count !== undefined ? `${uni.courses_count} Courses` : "Active"}
                        </Text>
                      </View>

                      {uni.website ? (
                        <View style={styles.websiteTag}>
                          <Ionicons name="globe-outline" size={12} color="#6366F1" />
                          <Text style={styles.websiteTagText} numberOfLines={1}>
                            {uni.website.replace("https://", "").replace("http://", "")}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {uni.description ? (
                      <Text style={styles.uniCardDesc} numberOfLines={2}>
                        {uni.description}
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          )}

          {/* ═══════════ TAB 2: COURSES CRUD ═══════════ */}
          {activeTab === "courses" && (
            <View style={styles.tabContent}>
              <View style={styles.actionBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerHeading}>Courses Management</Text>
                  <Text style={styles.bannerSub}>
                    Manage degree programs, minimum Z-scores and intake criteria.
                  </Text>
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={openCreateCourseModal}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.addBtnText}>Add Course</Text>
                </TouchableOpacity>
              </View>

              {/* Course Search */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Brand.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search courses by title, code, or university..."
                  placeholderTextColor={Brand.textMuted}
                  value={courseSearch}
                  onChangeText={setCourseSearch}
                />
                {courseSearch ? (
                  <TouchableOpacity onPress={() => setCourseSearch("")}>
                    <Ionicons name="close-circle" size={18} color={Brand.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Stream Filter Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.streamFilterScroll}>
                {["", ...streamsList].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.streamPill, courseStreamFilter === st && styles.streamPillActive]}
                    onPress={() => setCourseStreamFilter(st)}
                  >
                    <Text style={[styles.streamPillText, courseStreamFilter === st && styles.streamPillTextActive]}>
                      {st || "All Streams"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {coursesLoading ? (
                <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
              ) : courses.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="book-outline" size={48} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Courses Found</Text>
                  <Text style={styles.emptySub}>Click the 'Add Course' button above to create a course.</Text>
                </View>
              ) : (
                courses.map((course) => {
                  const sColor = getStreamColor(course.stream);
                  return (
                    <View key={course.id} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.courseCodeBadge}>
                          <Text style={styles.courseCodeText}>{course.code}</Text>
                        </View>
                        <View style={[styles.streamBadge, { backgroundColor: `${sColor}15` }]}>
                          <View style={[styles.catDot, { backgroundColor: sColor }]} />
                          <Text style={[styles.streamBadgeText, { color: sColor }]}>
                            {course.stream}
                          </Text>
                        </View>

                        <View style={styles.cardActionGroup}>
                          <TouchableOpacity style={styles.iconActionBtn} onPress={() => openEditCourseModal(course)}>
                            <Ionicons name="pencil" size={16} color={Brand.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconActionBtn, styles.deleteBtn]}
                            onPress={() => handleDeleteCourse(course.id, course.name)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseUniName}>
                        <Ionicons name="business-outline" size={13} color={Brand.primary} />{" "}
                        {course.university_name || `University #${course.university_id}`}
                      </Text>

                      <View style={styles.courseDetailsRow}>
                        <View style={styles.minZBadge}>
                          <Ionicons name="trending-up" size={12} color="#059669" />
                          <Text style={styles.minZText}>
                            Min Z: {course.min_z_score !== undefined ? parseFloat(course.min_z_score).toFixed(4) : "0.0000"}
                          </Text>
                        </View>

                        <View style={styles.durationBadge}>
                          <Ionicons name="time-outline" size={12} color="#64748B" />
                          <Text style={styles.durationText}>{course.duration_years || 4} Years</Text>
                        </View>

                        <View style={styles.degreeBadge}>
                          <Text style={styles.degreeText}>{course.degree_type}</Text>
                        </View>
                      </View>

                      {course.career_paths && course.career_paths.length > 0 ? (
                        <View style={styles.careerTagsWrap}>
                          {course.career_paths.slice(0, 3).map((cp: string, idx: number) => (
                            <View key={idx} style={styles.careerTag}>
                              <Text style={styles.careerTagText}>#{cp}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* ═══════════ TAB 3: QUESTIONS CRUD ═══════════ */}
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

          {/* ═══════════ TAB 4: INQUIRIES & SUPPORT ═══════════ */}
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

          {/* ═══════════ TAB 5: STUDENTS MONITORING ═══════════ */}
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
                {studentStreamFilters.map((s) => (
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

          {/* ═══════════ TAB 6: OVERVIEW & ANALYTICS ═══════════ */}
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
                  <Text style={styles.statNum}>{courses.length || dashData.summary?.totalCourses || 0}</Text>
                </View>
                <View style={[styles.statBox, { borderLeftColor: "#F59E0B" }]}>
                  <Text style={styles.statLabel}>Universities</Text>
                  <Text style={[styles.statNum, { color: "#F59E0B" }]}>
                    {universities.length || 17}
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

      {/* ═══════════ MODAL 1: CREATE / EDIT UNIVERSITY ═══════════ */}
      <Modal visible={uniModalVisible} transparent animationType="slide" onRequestClose={() => setUniModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCategoryText}>University Directory</Text>
                <Text style={styles.modalTitle}>
                  {editingUni ? "Edit University" : "Add New University"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setUniModalVisible(false)}>
                <Ionicons name="close" size={24} color={Brand.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>University Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. University of Moratuwa"
                placeholderTextColor={Brand.textMuted}
                value={uniName}
                onChangeText={setUniName}
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Short Code *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. UOM"
                    placeholderTextColor={Brand.textMuted}
                    autoCapitalize="characters"
                    value={uniShortName}
                    onChangeText={setUniShortName}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Location / City *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Moratuwa"
                    placeholderTextColor={Brand.textMuted}
                    value={uniLocation}
                    onChangeText={setUniLocation}
                  />
                </View>
              </View>

              <Text style={styles.modalLabel}>District *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                {sriLankanDistricts.map((dst) => {
                  const isSel = uniDistrict === dst;
                  return (
                    <TouchableOpacity
                      key={dst}
                      style={[styles.chipItem, isSel && styles.chipItemActive]}
                      onPress={() => setUniDistrict(dst)}
                    >
                      <Text style={[styles.chipItemText, isSel && styles.chipItemTextActive]}>
                        {dst}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalLabel}>Official Website URL</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="https://uom.lk"
                placeholderTextColor={Brand.textMuted}
                autoCapitalize="none"
                keyboardType="url"
                value={uniWebsite}
                onChangeText={setUniWebsite}
              />

              <Text style={styles.modalLabel}>Logo / Image URL</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="https://..."
                placeholderTextColor={Brand.textMuted}
                autoCapitalize="none"
                value={uniLogoUrl}
                onChangeText={setUniLogoUrl}
              />

              <Text style={styles.modalLabel}>Overview / Description</Text>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 70 }]}
                multiline
                placeholder="Brief information about this university's faculties and campus..."
                placeholderTextColor={Brand.textMuted}
                value={uniDescription}
                onChangeText={setUniDescription}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setUniModalVisible(false)}
                  disabled={savingUni}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, savingUni && { opacity: 0.6 }]}
                  onPress={handleSaveUniversity}
                  disabled={savingUni}
                >
                  {savingUni ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>
                      {editingUni ? "Update University" : "Create University"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL 2: CREATE / EDIT COURSE ═══════════ */}
      <Modal visible={courseModalVisible} transparent animationType="slide" onRequestClose={() => setCourseModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCategoryText}>Courses Directory</Text>
                <Text style={styles.modalTitle}>
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCourseModalVisible(false)}>
                <Ionicons name="close" size={24} color={Brand.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Select University *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                {universities.map((uni) => {
                  const isSel = String(courseUniId) === String(uni.id);
                  return (
                    <TouchableOpacity
                      key={uni.id}
                      style={[styles.chipItem, isSel && styles.chipItemActive]}
                      onPress={() => setCourseUniId(String(uni.id))}
                    >
                      <Text style={[styles.chipItemText, isSel && styles.chipItemTextActive]}>
                        {uni.short_name} ({uni.name?.slice(0, 14)}...)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalLabel}>Course Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Computer Science & Engineering"
                placeholderTextColor={Brand.textMuted}
                value={courseName}
                onChangeText={setCourseName}
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Course Code *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. CS01"
                    placeholderTextColor={Brand.textMuted}
                    autoCapitalize="characters"
                    value={courseCode}
                    onChangeText={setCourseCode}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Duration (Years)</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="4"
                    placeholderTextColor={Brand.textMuted}
                    value={courseDurationYears}
                    onChangeText={setCourseDurationYears}
                  />
                </View>
              </View>

              <Text style={styles.modalLabel}>A/L Stream *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                {streamsList.map((st) => {
                  const isSel = courseStream === st;
                  const sColor = getStreamColor(st);
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.chipItem,
                        isSel && { backgroundColor: `${sColor}15`, borderColor: sColor },
                      ]}
                      onPress={() => setCourseStream(st)}
                    >
                      <Text style={[styles.chipItemText, isSel && { color: sColor, fontWeight: "700" }]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalLabel}>Degree Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                {degreeTypesList.map((dt) => {
                  const isSel = courseDegreeType === dt;
                  return (
                    <TouchableOpacity
                      key={dt}
                      style={[styles.chipItem, isSel && styles.chipItemActive]}
                      onPress={() => setCourseDegreeType(dt)}
                    >
                      <Text style={[styles.chipItemText, isSel && styles.chipItemTextActive]}>
                        {dt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalLabel}>Minimum Cutoff Z-Score</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="e.g. 1.8500"
                placeholderTextColor={Brand.textMuted}
                value={courseMinZScore}
                onChangeText={setCourseMinZScore}
              />

              <Text style={styles.modalLabel}>Career Paths (comma separated)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Software Engineer, Data Scientist, Systems Architect"
                placeholderTextColor={Brand.textMuted}
                value={courseCareerPaths}
                onChangeText={setCourseCareerPaths}
              />

              <Text style={styles.modalLabel}>Course Description</Text>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 70 }]}
                multiline
                placeholder="Key learning outcomes, faculty details, career opportunities..."
                placeholderTextColor={Brand.textMuted}
                value={courseDescription}
                onChangeText={setCourseDescription}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setCourseModalVisible(false)}
                  disabled={savingCourse}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, savingCourse && { opacity: 0.6 }]}
                  onPress={handleSaveCourse}
                  disabled={savingCourse}
                >
                  {savingCourse ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>
                      {editingCourse ? "Update Course" : "Create Course"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL 3: CREATE / EDIT QUESTION ═══════════ */}
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

            <ScrollView showsVerticalScrollIndicator={false}>
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

      {/* ═══════════ MODAL 4: REPLY TO INQUIRY ═══════════ */}
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
  tabBarWrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabBarScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabItemActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  tabItemText: { fontSize: 12, fontWeight: "600", color: Brand.textSecondary, marginLeft: 6 },
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
    marginBottom: 14,
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
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
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: Brand.text, marginTop: 10 },
  emptySub: { fontSize: 13, color: Brand.textMuted, marginTop: 4, textAlign: "center" },

  // University card styles
  uniCodeBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  uniCodeText: { fontSize: 12, fontWeight: "800", color: "#4338CA" },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  locationPillText: { fontSize: 11, fontWeight: "700", color: "#0369A1" },
  uniCardTitle: { fontSize: 16, fontWeight: "700", color: Brand.text, marginBottom: 4 },
  uniCardLocation: { fontSize: 12, color: Brand.textMuted, marginBottom: 8 },
  uniCardMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  coursesCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  coursesCountText: { fontSize: 11, fontWeight: "700", color: "#059669", marginLeft: 4 },
  websiteTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  websiteTagText: { fontSize: 11, fontWeight: "600", color: "#6366F1", marginLeft: 4 },
  uniCardDesc: { fontSize: 12, color: Brand.textSecondary, lineHeight: 17 },

  // Course card styles
  courseCodeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  courseCodeText: { fontSize: 12, fontWeight: "800", color: Brand.textSecondary },
  streamBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  streamBadgeText: { fontSize: 11, fontWeight: "700" },
  courseName: { fontSize: 15, fontWeight: "700", color: Brand.text, marginBottom: 4 },
  courseUniName: { fontSize: 12, fontWeight: "600", color: Brand.primary, marginBottom: 8 },
  courseDetailsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  minZBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  minZText: { fontSize: 11, fontWeight: "700", color: "#059669", marginLeft: 4 },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: { fontSize: 11, fontWeight: "600", color: "#64748B", marginLeft: 4 },
  degreeBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  degreeText: { fontSize: 11, fontWeight: "700", color: Brand.primary },
  careerTagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  careerTag: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  careerTagText: { fontSize: 11, color: Brand.textMuted },

  // Question card styles
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
  qText: { fontSize: 14, lineHeight: 20, color: Brand.text, fontWeight: "500" },

  // Inquiry card styles
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

  // Filter pills
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
  streamFilterScroll: { flexDirection: "row", marginBottom: 14 },
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

  // Student styles
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

  // Stats styles
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

  // Modals
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
  chipItem: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  chipItemActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  chipItemText: { fontSize: 12, color: Brand.textSecondary, fontWeight: "600" },
  chipItemTextActive: { color: "#FFFFFF", fontWeight: "700" },
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
