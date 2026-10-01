import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

export interface StudentData {
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
}

const defaultStudent: StudentData = {
  fullName: "Nethmi Perera",
  email: "nethmi@example.com",
  school: "Royal Central College",
  location: "Colombo",
  stream: "Physical Science",
  year: "2025",
  subjects: [
    { name: "Physics", grade: "A" },
    { name: "Chemistry", grade: "B" },
    { name: "Combined Maths", grade: "A" },
  ],
  district: "Colombo",
  zScore: 1.8245,
  interests: ["Technology", "Software", "AI"],
  skills: ["Problem solving", "Teamwork", "Mathematics"],
  savedCourseIds: [2],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>("welcome");
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [student, setStudent] = useState<StudentData>(defaultStudent);
  const [matchResults, setMatchResults] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const updateStudent = (updates: Partial<StudentData>) => {
    setStudent((prev) => ({ ...prev, ...updates }));
  };

  const isCourseSaved = (courseId: number) => {
    return student.savedCourseIds.includes(courseId);
  };

  const toggleSave = async (courseId: number) => {
    // optimistic update
    const alreadySaved = student.savedCourseIds.includes(courseId);
    const newSaved = alreadySaved
      ? student.savedCourseIds.filter((id) => id !== courseId)
      : [...student.savedCourseIds, courseId];

    setStudent((prev) => ({ ...prev, savedCourseIds: newSaved }));

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
