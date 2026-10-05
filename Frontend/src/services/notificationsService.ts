/**
 * Notification read-state helpers using AsyncStorage.
 *
 * Global announcements are NOT tracked per-user in the DB.
 * Instead we store a timestamp locally: the last time the
 * student opened the Announcements tab.  Any announcement
 * created AFTER that timestamp is counted as "new".
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const LAST_SEEN_KEY = "notif_announcements_last_seen";
const READ_IDS_KEY  = "notif_announcement_read_ids";

// ─── Last-seen timestamp ──────────────────────────────────────────────────────

/** Returns the ISO timestamp of when the user last opened Announcements, or null */
export async function getAnnouncementsLastSeen(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_SEEN_KEY);
}

/** Sets last-seen to RIGHT NOW — call when the Announcements tab is opened */
export async function markAnnouncementsAsSeen(): Promise<void> {
  await AsyncStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
}

/**
 * Counts how many global announcements were created AFTER the last-seen
 * timestamp (i.e., are "new" to this user).
 */
export function countNewAnnouncements(
  announcements: { created_at: string }[],
  lastSeen: string | null
): number {
  if (!lastSeen) return announcements.length; // First time — everything is new
  const since = new Date(lastSeen).getTime();
  return announcements.filter((a) => new Date(a.created_at).getTime() > since).length;
}

// ─── Per-item read IDs (for the blue dot on individual cards) ────────────────

/** Returns the Set of announcement IDs the user has explicitly tapped */
export async function getReadAnnouncementIds(): Promise<Set<number>> {
  try {
    const raw = await AsyncStorage.getItem(READ_IDS_KEY);
    if (!raw) return new Set();
    return new Set<number>(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

/** Marks a single announcement as read by the user */
export async function markAnnouncementRead(id: number): Promise<void> {
  try {
    const ids = await getReadAnnouncementIds();
    ids.add(id);
    await AsyncStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
  } catch {}
}
