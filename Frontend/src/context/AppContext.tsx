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
  | "saved";

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
}

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

  // Load saved session on app launch
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("user_token");
        const savedUser = await AsyncStorage.getItem("user_profile");
        if (savedToken && savedUser) {
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
