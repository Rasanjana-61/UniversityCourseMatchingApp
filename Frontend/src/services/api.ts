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

  // Auth APIs
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    stream?: string;
    district?: string;
    school?: string;
    zScore?: number;
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: "Cannot connect to backend server. Please check your network.",
      };
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: "Cannot connect to backend server. Please check your network.",
      };
    }
  },

  getAuthProfile: async (token: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Network error fetching profile" };
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: "Cannot connect to server. Please try again later.",
      };
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: "Cannot connect to server. Please try again later.",
      };
    }
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: "Cannot connect to server. Please try again later.",
      };
    }
  },

  // Student Profiles
  saveProfile: async (profile: {
    fullName: string;
    email: string;
    stream: string;
    zScore: number;
    district: string;
    school?: string;
    interests?: string[];
    preferredLocations?: string[];
    subjects?: { name: string; grade: string }[];
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error saving profile" };
    }
  },

  updateProfile: async (email: string, updates: {
    fullName?: string;
    school?: string;
    district?: string;
    interests?: string[];
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error updating profile" };
    }
  },

  getProfile: async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}`);
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching profile" };
    }
  },

  toggleSaveCourse: async (email: string, courseId: number | string) => {
    try {
      const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}/toggle-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error updating saved course" };
    }
  },

  getSavedCourses: async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}/saved-courses`);
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching saved courses" };
    }
  },

  deleteAccount: async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error deleting account" };
    }
  },
};
