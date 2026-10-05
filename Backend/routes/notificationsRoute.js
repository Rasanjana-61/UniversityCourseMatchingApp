import { Router } from "express";
import { sql } from "../config/db.js";

const router = Router();

// ─── CREATE notifications table if not exists ─────────────────────────────
// (Called once via initDB in db.js — but we also try here as a safety net)
const ensureTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id            SERIAL PRIMARY KEY,
      title         TEXT NOT NULL,
      message       TEXT NOT NULL,
      type          TEXT NOT NULL DEFAULT 'info',
      target_stream TEXT,
      is_pinned     BOOLEAN NOT NULL DEFAULT FALSE,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
};

// ─── GET /api/notifications  — public (students) ──────────────────────────
router.get("/", async (req, res) => {
  try {
    await ensureTable();
    const { stream } = req.query;
    let rows;
    if (stream && stream !== "all") {
      rows = await sql`
        SELECT * FROM notifications
        WHERE target_stream IS NULL OR target_stream = ${stream}
        ORDER BY is_pinned DESC, created_at DESC;
      `;
    } else {
      rows = await sql`
        SELECT * FROM notifications
        ORDER BY is_pinned DESC, created_at DESC;
      `;
    }
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─── GET /api/notifications/unread-count  — public ────────────────────────
router.get("/unread-count", async (req, res) => {
  try {
    await ensureTable();
    const [{ count }] = await sql`
      SELECT COUNT(*)::int as count FROM notifications;
    `;
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─── POST /api/notifications  — admin only ────────────────────────────────
router.post("/", async (req, res) => {
  try {
    await ensureTable();
    const { title, message, type = "info", targetStream, isPinned = false } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required." });
    }

    const validTypes = ["info", "warning", "success", "deadline", "scholarship"];
    const safeType = validTypes.includes(type) ? type : "info";

    const [created] = await sql`
      INSERT INTO notifications (title, message, type, target_stream, is_pinned)
      VALUES (
        ${title},
        ${message},
        ${safeType},
        ${targetStream || null},
        ${isPinned}
      )
      RETURNING *;
    `;

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─── PUT /api/notifications/:id  — admin only ─────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, type, targetStream, isPinned } = req.body;

    const [updated] = await sql`
      UPDATE notifications SET
        title         = COALESCE(${title || null}, title),
        message       = COALESCE(${message || null}, message),
        type          = COALESCE(${type || null}, type),
        target_stream = ${targetStream !== undefined ? targetStream || null : sql`target_stream`},
        is_pinned     = COALESCE(${isPinned !== undefined ? isPinned : null}, is_pinned)
      WHERE id = ${id}
      RETURNING *;
    `;

    if (!updated) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─── DELETE /api/notifications/:id  — admin only ──────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [deleted] = await sql`
      DELETE FROM notifications WHERE id = ${id} RETURNING id;
    `;
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }
    res.status(200).json({ success: true, message: "Notification deleted.", id: deleted.id });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
