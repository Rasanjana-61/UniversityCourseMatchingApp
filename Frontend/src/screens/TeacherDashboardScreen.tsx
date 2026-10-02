import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, TextInput, RefreshControl, Alert,
} from "react-native";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";

const PURPLE = "#6c63ff";
const DARK = "#0f172a";
const CARD = "#1e293b";
const BORDER = "#334155";
const GREEN = "#10b981";
const GOLD = "#f59e0b";
const BLUE = "#3b82f6";
const RED = "#ef4444";

type DashboardTab = "overview" | "students";

export const TeacherDashboardScreen = () => {
  const { teacherData, teacherToken, teacherLogout, setCurrentScreen } = useApp();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [dashData, setDashData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStream, setFilterStream] = useState("");

  const streams = ["", "Physical Science", "Biological Science", "Commerce", "Arts", "Technology"];

  const loadDashboard = useCallback(async () => {
    if (!teacherToken) return;
    try {
      const res = await api.getTeacherDashboard(teacherToken);
      if (res.success) setDashData(res.data);
    } catch (e) {
      console.log("Dashboard load error:", e);
    }
  }, [teacherToken]);

  const loadStudents = useCallback(async () => {
    if (!teacherToken) return;
    try {
      const res = await api.getTeacherStudents(teacherToken, {
        stream: filterStream || undefined,
        search: searchText || undefined,
      });
      if (res.success) setStudents(res.data);
    } catch (e) {
      console.log("Students load error:", e);
    }
  }, [teacherToken, filterStream, searchText]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadDashboard(), loadStudents()]);
    setLoading(false);
  }, [loadDashboard, loadStudents]);

  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    if (activeTab === "students") loadStudents();
  }, [filterStream, searchText, activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out from the Teacher Portal?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => teacherLogout() },
    ]);
  };

  const getZScoreColor = (z: number) => {
    if (z >= 2.0) return GREEN;
    if (z >= 1.7) return BLUE;
    if (z >= 1.4) return GOLD;
    if (z >= 1.0) return "#f97316";
    return z === 0 ? "#475569" : RED;
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderOverview = () => {
    if (!dashData) return null;
    const { summary, streamDistribution, districtDistribution, zScoreRanges, topStudents, recentStudents } = dashData;

    return (
      <>
        {/* Summary Cards */}
        <Text style={styles.sectionTitle}>📊 Summary</Text>
        <View style={styles.statsGrid}>
          <StatCard icon="👥" label="Total Students" value={summary.totalStudents} color={PURPLE} />
          <StatCard icon="📈" label="Avg Z-Score" value={summary.averageZScore.toFixed(4)} color={GREEN} />
          <StatCard icon="🎓" label="Total Courses" value={summary.totalCourses} color={BLUE} />
          <StatCard icon="🏛️" label="Universities" value={summary.totalUniversities} color={GOLD} />
        </View>

        {/* Stream Distribution */}
        <Text style={styles.sectionTitle}>📚 Stream Distribution</Text>
        <View style={styles.card}>
          {streamDistribution.map((item: any, i: number) => {
            const total = summary.totalStudents || 1;
            const pct = Math.round((item.count / total) * 100);
            const colors = [PURPLE, GREEN, BLUE, GOLD, "#ec4899"];
            return (
              <View key={i} style={styles.barRow}>
                <Text style={styles.barLabel}>{item.stream}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors[i % colors.length] }]} />
                </View>
                <Text style={styles.barCount}>{item.count}</Text>
              </View>
            );
          })}
        </View>

        {/* Z-Score Ranges */}
        <Text style={styles.sectionTitle}>🎯 Z-Score Ranges</Text>
        <View style={styles.card}>
          {zScoreRanges.map((item: any, i: number) => (
            <View key={i} style={styles.rangeRow}>
              <View style={[styles.rangeDot, { backgroundColor: [GREEN, BLUE, GOLD, "#f97316", RED][i] || "#475569" }]} />
              <Text style={styles.rangeLabel}>{item.range}</Text>
              <Text style={styles.rangeCount}>{item.count} students</Text>
            </View>
          ))}
        </View>

        {/* District Distribution */}
        <Text style={styles.sectionTitle}>📍 Top Districts</Text>
        <View style={styles.card}>
          <View style={styles.districtGrid}>
            {districtDistribution.map((item: any, i: number) => (
              <View key={i} style={styles.districtChip}>
                <Text style={styles.districtName}>{item.district}</Text>
                <Text style={styles.districtCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Students */}
        <Text style={styles.sectionTitle}>🏆 Top Students by Z-Score</Text>
        <View style={styles.card}>
          {topStudents.slice(0, 5).map((s: any, i: number) => (
            <View key={s.id} style={[styles.studentRow, i < 4 && styles.studentRowBorder]}>
              <View style={[styles.rankBadge, { backgroundColor: i === 0 ? GOLD : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c32" : CARD }]}>
                <Text style={styles.rankText}>#{i + 1}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{s.fullName}</Text>
                <Text style={styles.studentMeta}>{s.stream} • {s.district}</Text>
              </View>
              <Text style={[styles.zScore, { color: getZScoreColor(s.zScore) }]}>{s.zScore.toFixed(4)}</Text>
            </View>
          ))}
        </View>

        {/* Recent Students */}
        <Text style={styles.sectionTitle}>🕐 Recently Joined</Text>
        <View style={styles.card}>
          {recentStudents.slice(0, 5).map((s: any, i: number) => (
            <View key={s.id} style={[styles.studentRow, i < 4 && styles.studentRowBorder]}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{s.fullName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{s.fullName}</Text>
                <Text style={styles.studentMeta}>{s.email}</Text>
              </View>
              <Text style={styles.joinDate}>{new Date(s.joinedAt).toLocaleDateString()}</Text>
            </View>
          ))}
        </View>
      </>
    );
  };

  const renderStudents = () => (
    <>
      {/* Search */}
      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by name or email..."
        placeholderTextColor="#475569"
      />

      {/* Stream Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {streams.map((s) => (
          <TouchableOpacity
            key={s || "all"}
            style={[styles.filterChip, filterStream === s && styles.filterChipActive]}
            onPress={() => setFilterStream(s)}
          >
            <Text style={[styles.filterChipText, filterStream === s && styles.filterChipTextActive]}>
              {s || "All Streams"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{students.length} students found</Text>

      {students.map((s, i) => (
        <View key={s.id} style={styles.studentCard}>
          <View style={styles.studentCardHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{s.fullName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.studentCardInfo}>
              <Text style={styles.studentName}>{s.fullName}</Text>
              <Text style={styles.studentEmail}>{s.email}</Text>
            </View>
            <Text style={[styles.zScoreBig, { color: getZScoreColor(s.zScore) }]}>
              {s.zScore > 0 ? s.zScore.toFixed(4) : "—"}
            </Text>
          </View>
          <View style={styles.studentCardMeta}>
            <View style={styles.metaChip}><Text style={styles.metaChipText}>📚 {s.stream}</Text></View>
            <View style={styles.metaChip}><Text style={styles.metaChipText}>📍 {s.district}</Text></View>
            {s.school !== "-" && <View style={styles.metaChip}><Text style={styles.metaChipText}>🏫 {s.school}</Text></View>}
          </View>
        </View>
      ))}

      {students.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No students found</Text>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.flex}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.portalLabel}>🎓 Teacher Portal</Text>
          <Text style={styles.teacherName}>{teacherData?.fullName || "Teacher"}</Text>
          {teacherData?.school ? <Text style={styles.teacherSchool}>{teacherData.school}</Text> : null}
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {([["overview", "📊 Overview"], ["students", "👥 Students"]] as const).map(([tab, label]) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBarBtn, activeTab === tab && styles.tabBarBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabBarText, activeTab === tab && styles.tabBarTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} />}
        >
          {activeTab === "overview" ? renderOverview() : renderStudents()}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: DARK },
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    backgroundColor: CARD, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  portalLabel: { fontSize: 11, color: PURPLE, fontWeight: "700", letterSpacing: 1, marginBottom: 2 },
  teacherName: { fontSize: 18, fontWeight: "800", color: "#fff" },
  teacherSchool: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  logoutBtn: {
    backgroundColor: "#7f1d1d", paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10,
  },
  logoutText: { color: "#fca5a5", fontSize: 13, fontWeight: "700" },
  tabBar: {
    flexDirection: "row", backgroundColor: CARD,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  tabBarBtn: {
    flex: 1, paddingVertical: 12, alignItems: "center",
    borderBottomWidth: 3, borderBottomColor: "transparent",
  },
  tabBarBtnActive: { borderBottomColor: PURPLE },
  tabBarText: { fontSize: 14, color: "#64748b", fontWeight: "600" },
  tabBarTextActive: { color: PURPLE },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#64748b", fontSize: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#fff", marginTop: 20, marginBottom: 10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: CARD, borderRadius: 14,
    padding: 16, borderLeftWidth: 3, alignItems: "flex-start",
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 11, color: "#94a3b8", marginTop: 2, fontWeight: "600" },
  card: { backgroundColor: CARD, borderRadius: 14, padding: 16, marginBottom: 4 },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  barLabel: { width: 130, fontSize: 12, color: "#cbd5e1", fontWeight: "500" },
  barTrack: { flex: 1, height: 8, backgroundColor: "#0f172a", borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },
  barCount: { width: 30, fontSize: 12, color: "#94a3b8", textAlign: "right" },
  rangeRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  rangeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  rangeLabel: { flex: 1, fontSize: 13, color: "#cbd5e1" },
  rangeCount: { fontSize: 13, color: "#94a3b8", fontWeight: "600" },
  districtGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  districtChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#0f172a", borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: BORDER,
  },
  districtName: { fontSize: 12, color: "#cbd5e1", fontWeight: "500" },
  districtCount: {
    fontSize: 11, color: "#fff", fontWeight: "700",
    backgroundColor: PURPLE, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1,
  },
  studentRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  studentRowBorder: { borderBottomWidth: 1, borderBottomColor: BORDER },
  rankBadge: {
    width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  rankText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  avatarCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: `${PURPLE}33`, justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  avatarText: { fontSize: 16, fontWeight: "800", color: PURPLE },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontWeight: "700", color: "#fff" },
  studentMeta: { fontSize: 11, color: "#64748b", marginTop: 2 },
  studentEmail: { fontSize: 11, color: "#64748b", marginTop: 2 },
  zScore: { fontSize: 15, fontWeight: "800" },
  zScoreBig: { fontSize: 16, fontWeight: "800" },
  joinDate: { fontSize: 11, color: "#64748b" },
  searchInput: {
    backgroundColor: CARD, borderRadius: 12, padding: 14, color: "#fff",
    fontSize: 14, borderWidth: 1, borderColor: BORDER, marginBottom: 12,
  },
  filterRow: { marginBottom: 12 },
  filterChip: {
    backgroundColor: CARD, borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: BORDER,
  },
  filterChipActive: { backgroundColor: PURPLE, borderColor: PURPLE },
  filterChipText: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  filterChipTextActive: { color: "#fff" },
  resultCount: { fontSize: 12, color: "#475569", marginBottom: 12 },
  studentCard: {
    backgroundColor: CARD, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: BORDER,
  },
  studentCardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  studentCardInfo: { flex: 1 },
  studentCardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  metaChip: {
    backgroundColor: "#0f172a", borderRadius: 20, paddingHorizontal: 10,
    paddingVertical: 4, borderWidth: 1, borderColor: BORDER,
  },
  metaChipText: { fontSize: 11, color: "#94a3b8" },
  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15, color: "#475569" },
});
