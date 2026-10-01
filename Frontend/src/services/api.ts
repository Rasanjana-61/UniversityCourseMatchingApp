import { Platform } from "react-native";

// If testing on a real device via Expo Go, ensure phone and PC are on the same Wi-Fi.
// PC IP: 192.168.8.100
export const API_BASE_URL = Platform.select({
  android: "http://10.0.2.2:5000/api", // Android emulator default
  ios: "http://localhost:5000/api",    // iOS simulator
  web: "http://localhost:5000/api",    // Web browser
  default: "http://192.168.8.100:5000/api", // Expo Go on physical device
});

// For physical phone using Expo Go on Wi-Fi:
export const LAN_API_URL = "http://192.168.8.100:5000/api";

export const getApiUrl = (useLan: boolean = true) => {
  if (Platform.OS === "web") return "http://localhost:5000/api";
  return useLan ? LAN_API_URL : API_BASE_URL;
};

export const api = {
  // Health check
  checkHealth: async () => {
    const res = await fetch(`${getApiUrl()}/health`);
    return res.json();
  },

  // Universities
  getUniversities: async () => {
    const res = await fetch(`${getApiUrl()}/universities`);
    return res.json();
  },

  getUniversityById: async (id: number | string) => {
    const res = await fetch(`${getApiUrl()}/universities/${id}`);
    return res.json();
  },

  // Courses
  getCourses: async (params?: { stream?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const url = `${getApiUrl()}/courses${query ? `?${query}` : ""}`;
    const res = await fetch(url);
    return res.json();
  },

  getCourseById: async (id: number | string) => {
    const res = await fetch(`${getApiUrl()}/courses/${id}`);
    return res.json();
  },

  // Smart Matching
  matchCourses: async (data: {
    stream: string;
    zScore: number;
    district: string;
    interests?: string[];
    preferredLocations?: string[];
  }) => {
    const res = await fetch(`${getApiUrl()}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Student Profiles
  saveProfile: async (profile: {
    fullName: string;
    email: string;
    stream: string;
    zScore: number;
    district: string;
    interests?: string[];
    preferredLocations?: string[];
  }) => {
    const res = await fetch(`${getApiUrl()}/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  getProfile: async (email: string) => {
    const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}`);
    return res.json();
  },

  toggleSaveCourse: async (email: string, courseId: number | string) => {
    const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}/toggle-save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    return res.json();
  },

  getSavedCourses: async (email: string) => {
    const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}/saved-courses`);
    return res.json();
  },
};
