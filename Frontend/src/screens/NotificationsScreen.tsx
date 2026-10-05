import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
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

type NotifType = "info" | "warning" | "success" | "deadline" | "scholarship";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotifType;
  target_stream: string | null;
  is_pinned: boolean;
  created_at: string;
}

const typeConfig: Record<NotifType, { icon: any; bg: string; iconColor: string; border: string; label: string }> = {
  info: {
    icon: "information-circle",
    bg: "#EFF6FF",
    iconColor: "#2563EB",
    border: "#BFDBFE",
    label: "Info",
  },
  warning: {
    icon: "warning",
    bg: "#FFFBEB",
    iconColor: "#D97706",
    border: "#FDE68A",
    label: "Important",
  },
  success: {
    icon: "checkmark-circle",
    bg: "#F0FDF4",
    iconColor: "#16A34A",
    border: "#BBF7D0",
    label: "Update",
  },
  deadline: {
    icon: "time",
    bg: "#FFF1F2",
    iconColor: "#E11D48",
    border: "#FECDD3",
    label: "Deadline",
  },
  scholarship: {
    icon: "ribbon",
    bg: "#FAF5FF",
    iconColor: "#7C3AED",
    border: "#DDD6FE",
    label: "Scholarship",
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-LK", { day: "numeric", month: "short" });
}

export const NotificationsScreen: React.FC = () => {
  const { setCurrentScreen, student } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [personalNotifs, setPersonalNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | NotifType>("all");
  const [activeTab, setActiveTab] = useState<"announcements" | "inbox">("inbox");
  const [unreadPersonal, setUnreadPersonal] = useState(0);

  const filters: Array<{ key: "all" | NotifType; label: string }> = [
    { key: "all", label: "All" },
    { key: "info", label: "Info" },
    { key: "deadline", label: "Deadline" },
    { key: "scholarship", label: "Scholarship" },
    { key: "warning", label: "Important" },
  ];

  useEffect(() => {
    loadNotifications();
  }, []);

  // Mark all personal as read when user opens Inbox tab
  useEffect(() => {
    if (activeTab === "inbox" && student.email && unreadPersonal > 0) {
      api.markAllStudentNotificationsRead(student.email).then(() => {
        setUnreadPersonal(0);
        setPersonalNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      });
    }
  }, [activeTab]);

  const loadNotifications = async () => {
    try {
      const [globalRes, personalRes] = await Promise.all([
        api.getNotifications(),
        student.email ? api.getStudentNotifications(student.email) : Promise.resolve({ success: false, data: [] }),
      ]);
      if (globalRes?.success && Array.isArray(globalRes.data)) {
        setNotifications(globalRes.data);
      }
      if (personalRes?.success && Array.isArray(personalRes.data)) {
        setPersonalNotifs(personalRes.data);
        setUnreadPersonal(personalRes.data.filter((n: any) => !n.is_read).length);
      }
    } catch (e) {
      console.error("Error loading notifications:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, []);

  const displayed = notifications.filter((n) => {
    const typeMatch = activeFilter === "all" || n.type === activeFilter;
    const streamMatch = !n.target_stream || n.target_stream === student.stream;
    return typeMatch && streamMatch;
  });

  const pinnedItems = displayed.filter((n) => n.is_pinned);
  const regularItems = displayed.filter((n) => !n.is_pinned);

  const renderCard = (item: Notification) => {
    const cfg = typeConfig[item.type] || typeConfig.info;
    return (
      <View
        key={item.id}
        style={[
          styles.card,
          { backgroundColor: cfg.bg, borderColor: cfg.border },
          item.is_pinned && styles.pinnedCard,
        ]}
      >
        <View style={styles.cardRow}>
          <View style={[styles.iconWrap, { backgroundColor: cfg.iconColor + "20" }]}>
            <Ionicons name={cfg.icon} size={22} color={cfg.iconColor} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardTopRow}>
              <View style={styles.badgeRow}>
                <View style={[styles.typeBadge, { backgroundColor: cfg.iconColor }]}>
                  <Text style={styles.typeBadgeText}>{cfg.label}</Text>
                </View>
                {item.is_pinned && (
                  <View style={styles.pinnedBadge}>
                    <Ionicons name="pin" size={10} color="#DC2626" />
                    <Text style={styles.pinnedText}>Pinned</Text>
                  </View>
                )}
                {item.target_stream && (
                  <View style={styles.streamBadge}>
                    <Text style={styles.streamBadgeText}>{item.target_stream}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.timeText}>{timeAgo(item.created_at)}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMessage}>{item.message}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen("home")}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === "inbox"
              ? `${personalNotifs.length} personal message${personalNotifs.length !== 1 ? "s" : ""}`
              : `${notifications.length} announcement${notifications.length !== 1 ? "s" : ""}`}
          </Text>
        </View>
        {unreadPersonal > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{unreadPersonal}</Text>
          </View>
        )}
      </View>

      {/* Tab Switcher: Inbox | Announcements */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabSwitchBtn, activeTab === "inbox" && styles.tabSwitchBtnActive]}
          onPress={() => setActiveTab("inbox")}
        >
          <Ionicons
            name="mail"
            size={15}
            color={activeTab === "inbox" ? Brand.primary : Brand.textMuted}
          />
          <Text style={[styles.tabSwitchText, activeTab === "inbox" && styles.tabSwitchTextActive]}>
            Inbox
          </Text>
          {unreadPersonal > 0 && (
            <View style={styles.inboxBadge}>
              <Text style={styles.inboxBadgeText}>{unreadPersonal}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabSwitchBtn, activeTab === "announcements" && styles.tabSwitchBtnActive]}
          onPress={() => setActiveTab("announcements")}
        >
          <Ionicons
            name="megaphone"
            size={15}
            color={activeTab === "announcements" ? Brand.primary : Brand.textMuted}
          />
          <Text style={[styles.tabSwitchText, activeTab === "announcements" && styles.tabSwitchTextActive]}>
            Announcements
          </Text>
          {notifications.length > 0 && (
            <View style={[styles.inboxBadge, { backgroundColor: "#94A3B8" }]}>
              <Text style={styles.inboxBadgeText}>{notifications.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filter chips — only for Announcements tab */}
      {activeTab === "announcements" && (
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
              >
                <Text style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Brand.primary]} tintColor={Brand.primary} />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color={Brand.primary} style={{ marginTop: 60 }} />

        ) : activeTab === "inbox" ? (
          /* ── INBOX TAB: Personal inquiry reply notifications ── */
          personalNotifs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mail-open-outline" size={56} color={Brand.textMuted} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySubtitle}>
                When an advisor replies to your inquiry, you'll see it here.
              </Text>
            </View>
          ) : (
            personalNotifs.map((item: any) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: item.is_read ? "#F8FAFC" : "#EFF6FF",
                    borderColor: item.is_read ? Brand.cardBorder : "#BFDBFE",
                  },
                ]}
              >
                <View style={styles.cardRow}>
                  <View style={[styles.iconWrap, { backgroundColor: "#2563EB20" }]}>
                    <Ionicons name="chatbubble-ellipses" size={22} color="#2563EB" />
                  </View>
                  <View style={styles.cardBody}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.badgeRow}>
                        <View style={[styles.typeBadge, { backgroundColor: "#2563EB" }]}>
                          <Text style={styles.typeBadgeText}>Reply</Text>
                        </View>
                        {!item.is_read && (
                          <View style={[styles.typeBadge, { backgroundColor: "#EF4444" }]}>
                            <Text style={styles.typeBadgeText}>New</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.timeText}>{timeAgo(item.created_at)}</Text>
                    </View>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardMessage}>{item.message}</Text>
                    <TouchableOpacity
                      style={styles.viewInquiryBtn}
                      onPress={() => setCurrentScreen("inquiries")}
                    >
                      <Text style={styles.viewInquiryText}>View full reply →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )

        ) : (
          /* ── ANNOUNCEMENTS TAB: Global notifications ── */
          (() => {
            const displayed = notifications.filter((n) => {
              const typeMatch = activeFilter === "all" || n.type === activeFilter;
              const streamMatch = !n.target_stream || n.target_stream === student.stream;
              return typeMatch && streamMatch;
            });
            const pinnedItems = displayed.filter((n) => n.is_pinned);
            const regularItems = displayed.filter((n) => !n.is_pinned);

            return displayed.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={56} color={Brand.textMuted} />
                <Text style={styles.emptyTitle}>No announcements</Text>
                <Text style={styles.emptySubtitle}>Pull down to refresh and check for new updates.</Text>
              </View>
            ) : (
              <>
                {pinnedItems.length > 0 && (
                  <>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="pin" size={14} color="#DC2626" />
                      <Text style={[styles.sectionLabel, { color: "#DC2626" }]}>Pinned</Text>
                    </View>
                    {pinnedItems.map(renderCard)}
                  </>
                )}
                {regularItems.length > 0 && (
                  <>
                    {pinnedItems.length > 0 && (
                      <View style={styles.sectionHeader}>
                        <Ionicons name="list" size={14} color={Brand.textMuted} />
                        <Text style={styles.sectionLabel}>Recent</Text>
                      </View>
                    )}
                    {regularItems.map(renderCard)}
                  </>
                )}
              </>
            );
          })()
        )}
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Brand.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  headerSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 1 },
  countBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: "center",
  },
  countBadgeText: { fontSize: 13, fontWeight: "700", color: Brand.primary },
  filterRow: { backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: Brand.cardBorder },
  filterScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: Brand.cardBorder,
  },
  filterChipActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  filterChipText: { fontSize: 13, fontWeight: "500", color: Brand.textSecondary },
  filterChipTextActive: { color: "#FFFFFF", fontWeight: "600" },
  scrollContent: { padding: 16, paddingBottom: 90 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionLabel: { fontSize: 12, fontWeight: "600", color: Brand.textMuted, textTransform: "uppercase", letterSpacing: 0.5 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  pinnedCard: {
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardRow: { flexDirection: "row", padding: 14, gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeBadgeText: { fontSize: 10, fontWeight: "700", color: "#FFFFFF", textTransform: "uppercase" },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pinnedText: { fontSize: 10, fontWeight: "600", color: "#DC2626" },
  streamBadge: {
    backgroundColor: "rgba(0,0,0,0.07)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  streamBadgeText: { fontSize: 10, fontWeight: "500", color: "#374151" },
  timeText: { fontSize: 11, color: Brand.textMuted, flexShrink: 0 },
  cardTitle: { fontSize: 14, fontWeight: "700", color: Brand.text, marginBottom: 4, lineHeight: 20 },
  cardMessage: { fontSize: 13, color: Brand.textSecondary, lineHeight: 19 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: Brand.text },
  emptySubtitle: { fontSize: 13, color: Brand.textMuted, textAlign: "center", paddingHorizontal: 32 },
  // Tab switcher
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: Brand.cardBorder,
  },
  tabSwitchBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabSwitchBtnActive: {
    borderBottomColor: Brand.primary,
  },
  tabSwitchText: {
    fontSize: 14,
    fontWeight: "600",
    color: Brand.textMuted,
  },
  tabSwitchTextActive: {
    color: Brand.primary,
  },
  inboxBadge: {
    backgroundColor: Brand.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  inboxBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  // View inquiry button inside personal notification card
  viewInquiryBtn: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  viewInquiryText: {
    fontSize: 12,
    fontWeight: "600",
    color: Brand.primary,
  },
});
