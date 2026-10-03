import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";
import { BottomNavBar } from "../components/BottomNavBar";

export const ScholarshipsScreen: React.FC = () => {
  const { setCurrentScreen, setSelectedScholarshipId } = useApp();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  useEffect(() => {
    loadScholarships();
  }, []);

  const loadScholarships = async (query?: string) => {
    try {
      const res = await api.getScholarships({ search: query !== undefined ? query : search });
      if (res && res.data) {
        setScholarships(res.data);
      }
    } catch (e) {
      console.error("Error loading scholarships:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadScholarships();
  }, [search]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    loadScholarships(text);
  };

  const handleViewDetails = (id: number) => {
    setSelectedScholarshipId(id);
    setCurrentScreen("scholarship-details");
  };

  const toggleSaveScholarship = (id: number) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((item) => item !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  const getCategoryBadgeStyle = (category: string) => {
    switch (category?.toLowerCase()) {
      case "university":
        return { bg: "#1D4ED8", text: "#FFFFFF" };
      case "merit":
        return { bg: "#1E40AF", text: "#FFFFFF" };
      case "need-based":
        return { bg: "#F59E0B", text: "#FFFFFF" };
      default:
        return { bg: "#0D9488", text: "#FFFFFF" };
    }
  };

  const getCardTheme = (category: string) => {
    switch (category?.toLowerCase()) {
      case "merit":
        return { bg: "#F0FDF4", border: "#DCFCE7" };
      case "need-based":
        return { bg: "#FFFBEB", border: "#FEF3C7" };
      default:
        return { bg: "#EFF6FF", border: "#DBEAFE" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentScreen("explore")}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Scholarships</Text>
          <Text style={styles.headerSubtitle}>Financial support for your studies.</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Brand.primary]}
            tintColor={Brand.primary}
          />
        }
      >
        {/* Search Input Box */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={Brand.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scholarships..."
            placeholderTextColor={Brand.textMuted}
            value={search}
            onChangeText={handleSearchChange}
          />
          {search ? (
            <TouchableOpacity onPress={() => handleSearchChange("")}>
              <Ionicons name="close-circle" size={18} color={Brand.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Brand.primary} style={{ marginTop: 40 }} />
        ) : (
          scholarships.map((item) => {
            const catBadge = getCategoryBadgeStyle(item.category);
            const cardTheme = getCardTheme(item.category);
            const isSaved = savedIds.includes(item.id);

            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  { backgroundColor: cardTheme.bg, borderColor: cardTheme.border },
                ]}
              >
                {/* Header row with Badge, Title, and Open status */}
                <View style={styles.cardHeader}>
                  <View style={styles.titleWrap}>
                    <View style={[styles.categoryBadge, { backgroundColor: catBadge.bg }]}>
                      <Text style={[styles.categoryBadgeText, { color: catBadge.text }]}>
                        {item.category}
                      </Text>
                    </View>
                    <Text style={styles.scholarshipTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.openPill}>
                    <Text style={styles.openPillText}>{item.status || "Open"}</Text>
                  </View>
                </View>

                {/* Details list */}
                <View style={styles.detailsList}>
                  <View style={styles.detailRow}>
                    <Ionicons name="business-outline" size={15} color={Brand.textSecondary} style={styles.rowIcon} />
                    <Text style={styles.detailText}>Provider: {item.provider}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="school-outline" size={15} color={Brand.textSecondary} style={styles.rowIcon} />
                    <Text style={styles.detailText}>Eligibility: {item.eligibility}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={15} color={Brand.textSecondary} style={styles.rowIcon} />
                    <Text style={styles.detailText}>Value: {item.value}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={15} color={Brand.textSecondary} style={styles.rowIcon} />
                    <Text style={styles.detailText}>Deadline: {item.deadline}</Text>
                  </View>

                  {item.requirements ? (
                    <View style={styles.infoRow}>
                      <Ionicons name="information-circle-outline" size={15} color={Brand.textMuted} style={styles.rowIcon} />
                      <Text style={styles.infoText}>Supporting information: {item.requirements}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Buttons */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.viewDetailsBtn}
                    onPress={() => handleViewDetails(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.viewDetailsBtnText}>View details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.saveBtn, isSaved && styles.savedBtnActive]}
                    onPress={() => toggleSaveScholarship(item.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.saveBtnText, isSaved && styles.savedBtnTextActive]}>
                      {isSaved ? "Saved" : "Save"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Persistent Bottom Nav */}
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 6,
    marginRight: 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  headerSubtitle: {
    color: "#DBEAFE",
    fontSize: 12,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    gap: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Brand.text,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  scholarshipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Brand.text,
  },
  openPill: {
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  openPillText: {
    fontSize: 11,
    color: Brand.primary,
    fontWeight: "600",
  },
  detailsList: {
    gap: 6,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowIcon: {
    width: 20,
    marginRight: 6,
  },
  detailText: {
    fontSize: 12,
    color: Brand.textSecondary,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  infoText: {
    fontSize: 11,
    color: Brand.textMuted,
    lineHeight: 15,
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    gap: 10,
  },
  viewDetailsBtn: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  viewDetailsBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  savedBtnActive: {
    backgroundColor: "#EFF6FF",
    borderColor: Brand.primary,
  },
  saveBtnText: {
    color: Brand.text,
    fontSize: 13,
    fontWeight: "600",
  },
  savedBtnTextActive: {
    color: Brand.primary,
  },
});
