import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

export interface StudentData {
  id?: number | string;
  fullName: string;
  email: string;
  school: string;
  location: string;
  stream: string;
  year: string;
  subjects: { name: string; grade: string }[];
  district: string;
  zScore: number;
  interests: string[];
  skills: string[];
  savedCourseIds: number[];
}

export type ScreenType =
  | "welcome"
  | "login"
  | "register"
  | "forgot-password"
  | "home"
  | "profile"
  | "stream-select"
  | "results-entry"
  | "matching-results"
  | "explore"
  | "saved"
  | "course-details"
  | "university-details"
  | "assessment-intro"
  | "assessment-questions"
  | "assessment-profile"
  | "assessment-recommendations"
  | "career-details"
  | "job-opportunities"
  | "salary-info"
  | "compare-courses"
  | "course-comparison"
  | "scholarships"
  | "scholarship-details"
  | "admission-requirements"
  | "teacher-login"
  | "teacher-register"
  | "teacher-dashboard"
  | "teacher-students"
  | "admin-login"
  | "admin-register"
  | "admin-dashboard"
  | "admin-questions"
  | "student-inquiries"
  | "inquiries"
  | "notifications";

export type TabType = "home" | "search" | "assess" | "saved" | "profile";

interface AppContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  student: StudentData;
  updateStudent: (updates: Partial<StudentData>) => void;
  matchResults: any | null;
  setMatchResults: (results: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  executeMatch: (stream?: string, zScore?: number, district?: string) => Promise<any>;
  toggleSave: (courseId: number) => Promise<void>;
  isCourseSaved: (courseId: number) => boolean;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (
    fullName: string,
    email: string,
    password: string,
    extra?: Partial<StudentData>
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  selectedCourseId: number | null;
  setSelectedCourseId: (id: number | null) => void;
  selectedUniversityId: number | null;
  setSelectedUniversityId: (id: number | null) => void;
  selectedScholarshipId: number | null;
  setSelectedScholarshipId: (id: number | null) => void;
  comparisonCourseIds: number[];
  setComparisonCourseIds: (ids: number[]) => void;
  toggleComparisonCourse: (id: number) => void;
  assessmentScores: any;
  setAssessmentScores: (scores: any) => void;
  // Admin Portal & Legacy Teacher
  teacherData: TeacherData | null;
  teacherToken: string | null;
  teacherLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  teacherLogout: () => void;
  adminData: AdminData | null;
  adminToken: string | null;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  adminLogout: () => void;
}

export interface AdminData {
  id?: number;
  fullName: string;
  email: string;
  school: string;
  subject: string;
  role: string;
}

export type TeacherData = AdminData;

const defaultStudent: StudentData = {
  fullName: "",
  email: "",
  school: "",
  location: "Colombo",
  stream: "Physical Science",
  year: "2025",
  subjects: [],
  district: "Colombo",
  zScore: 0,
  interests: [],
  skills: [],
  savedCourseIds: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("welcome");
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [student, setStudent] = useState<StudentData>(defaultStudent);
  const [token, setToken] = useState<string | null>(null);
  const [matchResults, setMatchResults] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<number | null>(null);
  const [comparisonCourseIds, setComparisonCourseIds] = useState<number[]>([]);
  const [assessmentScores, setAssessmentScores] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  const [teacherToken, setTeacherToken] = useState<string | null>(null);

  const toggleComparisonCourse = (id: number) => {
    setComparisonCourseIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 3) {
          return [prev[1], prev[2], id]; // max 3, cycle out oldest
        }
        return [...prev, id];
      }
    });
  };

  // Load saved session on app launch
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("user_token");
        const savedUser = await AsyncStorage.getItem("user_profile");
        const savedAdminToken = await AsyncStorage.getItem("admin_token") || await AsyncStorage.getItem("teacher_token");
        const savedAdmin = await AsyncStorage.getItem("admin_profile") || await AsyncStorage.getItem("teacher_profile");
        if (savedAdminToken && savedAdmin) {
          const parsed = JSON.parse(savedAdmin);
          setTeacherToken(savedAdminToken);
          setTeacherData(parsed);
          setCurrentScreen("admin-dashboard");
        } else if (savedToken && savedUser) {
          setToken(savedToken);
          setStudent(JSON.parse(savedUser));
          setCurrentScreen("home");
        }
      } catch (err) {
        console.log("Error restoring auth session:", err);
      }
    };
    loadSession();
  }, []);

  const updateStudent = (updates: Partial<StudentData>) => {
    setStudent((prev) => {
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem("user_profile", JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res && res.success) {
        const backendUser = res.data;
        const newStudentData: StudentData = {
          id: backendUser.id,
          fullName: backendUser.fullName || student.fullName,
          email: backendUser.email || email,
          school: backendUser.school || student.school,
          location: backendUser.district || student.location,
          stream: backendUser.stream || student.stream,
          year: backendUser.year || student.year || "2025",
          subjects: backendUser.subjects || student.subjects,
          district: backendUser.district || student.district,
          zScore: backendUser.zScore !== undefined ? backendUser.zScore : student.zScore,
          interests: backendUser.interests || student.interests,
          skills: student.skills,
          savedCourseIds: backendUser.savedCourseIds || student.savedCourseIds,
        };

        setToken(res.token);
        setStudent(newStudentData);
        await AsyncStorage.setItem("user_token", res.token);
        await AsyncStorage.setItem("user_profile", JSON.stringify(newStudentData));

        return { success: true, message: res.message || "Logged in successfully!" };
      } else {
        return { success: false, message: res.message || "Invalid email or password." };
      }
    } catch (err: any) {
      return { success: false, message: "Network connection error. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    extra?: Partial<StudentData>
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await api.register({
        fullName,
        email,
        password,
        stream: extra?.stream || "Physical Science",
        district: extra?.district || "Colombo",
        school: extra?.school || "",
        zScore: extra?.zScore || 0.0,
      });

      if (res && res.success) {
        const backendUser = res.data;
        const newStudentData: StudentData = {
          id: backendUser.id,
          fullName: backendUser.fullName || fullName,
          email: backendUser.email || email,
          school: backendUser.school || "",
          location: backendUser.district || "Colombo",
          stream: backendUser.stream || "Physical Science",
          year: "2025",
          subjects: backendUser.subjects || [],
          district: backendUser.district || "Colombo",
          zScore: backendUser.zScore !== undefined ? backendUser.zScore : 0.0,
          interests: backendUser.interests || [],
          skills: [],
          savedCourseIds: backendUser.savedCourseIds || [],
        };

        setToken(res.token);
        setStudent(newStudentData);
        await AsyncStorage.setItem("user_token", res.token);
        await AsyncStorage.setItem("user_profile", JSON.stringify(newStudentData));

        return { success: true, message: res.message || "Account created successfully!" };
      } else {
        return { success: false, message: res.message || "Registration failed." };
      }
    } catch (err: any) {
      return { success: false, message: "Network connection error. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setToken(null);
    setMatchResults(null);
    setStudent(defaultStudent);
    await AsyncStorage.removeItem("user_token");
    await AsyncStorage.removeItem("user_profile");
    setCurrentScreen("welcome");
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      const res = await api.adminLogin({ email, password });
      if (res && res.success) {
        const admin: AdminData = {
          id: res.data.id,
          fullName: res.data.fullName,
          email: res.data.email,
          school: res.data.school || "",
          subject: res.data.subject || "",
          role: res.data.role,
        };
        setTeacherToken(res.token);
        setTeacherData(admin);
        await AsyncStorage.setItem("admin_token", res.token);
        await AsyncStorage.setItem("admin_profile", JSON.stringify(admin));
        setCurrentScreen("admin-dashboard");
        return { success: true, message: res.message || "Logged in successfully!" };
      } else {
        return { success: false, message: res.message || "Invalid email or password." };
      }
    } catch (err: any) {
      return { success: false, message: "Network connection error. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = async () => {
    setTeacherToken(null);
    setTeacherData(null);
    await AsyncStorage.removeItem("admin_token");
    await AsyncStorage.removeItem("admin_profile");
    await AsyncStorage.removeItem("teacher_token");
    await AsyncStorage.removeItem("teacher_profile");
    setCurrentScreen("welcome");
  };

  const teacherLogin = adminLogin;
  const teacherLogout = adminLogout;

  const isCourseSaved = (courseId: number) => {
    return student.savedCourseIds.includes(courseId);
  };

  const toggleSave = async (courseId: number) => {
    const alreadySaved = student.savedCourseIds.includes(courseId);
    const newSaved = alreadySaved
      ? student.savedCourseIds.filter((id) => id !== courseId)
      : [...student.savedCourseIds, courseId];

    updateStudent({ savedCourseIds: newSaved });

    try {
      await api.toggleSaveCourse(student.email, courseId);
    } catch (e) {
      console.log("Could not sync bookmark with backend, kept locally:", e);
    }
  };

  const executeMatch = async (streamOverride?: string, zScoreOverride?: number, districtOverride?: string) => {
    setIsLoading(true);
    try {
      const matchStream = streamOverride || student.stream;
      const matchZScore = zScoreOverride !== undefined ? zScoreOverride : student.zScore;
      const matchDistrict = districtOverride || student.district;

      const res = await api.matchCourses({
        stream: matchStream,
        zScore: matchZScore,
        district: matchDistrict,
        interests: student.interests,
        preferredLocations: [student.location],
      });

      if (res && res.success) {
        setMatchResults(res.data);
        return res.data;
      }
    } catch (error) {
      console.error("Match error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        student,
        updateStudent,
        matchResults,
        setMatchResults,
        isLoading,
        setIsLoading,
        executeMatch,
        toggleSave,
        isCourseSaved,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        selectedCourseId,
        setSelectedCourseId,
        selectedUniversityId,
        setSelectedUniversityId,
        selectedScholarshipId,
        setSelectedScholarshipId,
        comparisonCourseIds,
        setComparisonCourseIds,
        toggleComparisonCourse,
        assessmentScores,
        setAssessmentScores,
        teacherData,
        teacherToken,
        teacherLogin,
        teacherLogout,
        adminData: teacherData,
        adminToken: teacherToken,
        adminLogin,
        adminLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
