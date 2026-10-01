import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp, TabType } from "../context/AppContext";

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, setCurrentScreen } = useApp();

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === "home") setCurrentScreen("home");
    else if (tab === "profile") setCurrentScreen("profile");
    else if (tab === "assess") setCurrentScreen("assessment-intro");
    else if (tab === "search") setCurrentScreen("explore");
    else if (tab === "saved") setCurrentScreen("saved");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress("home")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === "home" ? "home" : "home-outline"}
          size={22}
          color={activeTab === "home" ? Brand.primary : Brand.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === "home" && styles.tabLabelActive]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress("search")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === "search" ? "search" : "search-outline"}
          size={22}
          color={activeTab === "search" ? Brand.primary : Brand.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === "search" && styles.tabLabelActive]}>
          Search
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress("assess")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === "assess" ? "sparkles" : "sparkles-outline"}
          size={22}
          color={activeTab === "assess" ? Brand.primary : Brand.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === "assess" && styles.tabLabelActive]}>
          Assess
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress("saved")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === "saved" ? "bookmark" : "bookmark-outline"}
          size={22}
          color={activeTab === "saved" ? Brand.primary : Brand.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === "saved" && styles.tabLabelActive]}>
          Saved
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabPress("profile")}
        activeOpacity={0.7}
      >
        <Ionicons
          name={activeTab === "profile" ? "person" : "person-outline"}
          size={22}
          color={activeTab === "profile" ? Brand.primary : Brand.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === "profile" && styles.tabLabelActive]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    color: Brand.textMuted,
    fontWeight: "500",
  },
  tabLabelActive: {
    color: Brand.primary,
    fontWeight: "600",
  },
});
