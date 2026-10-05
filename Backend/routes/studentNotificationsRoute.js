import { Router } from "express";
import { sql } from "../config/db.js";

const router = Router();

// ─── Ensure student_notifications table exists ─────────────────────────────
const ensureTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS student_notifications (
      id              SERIAL PRIMARY KEY,
      student_email   TEXT NOT NULL,
      title           TEXT NOT NULL,
      message         TEXT NOT NULL,
      type            TEXT NOT NULL DEFAULT 'reply',
      inquiry_id      INTEGER,
      is_read         BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
};

// ─── GET /api/student-notifications?email=  — student's own inbox ──────────
router.get("/", async (req, res) => {
  try {
    await ensureTable();
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "email query param required." });
    }
    const rows = await sql`
      SELECT * FROM student_notifications
      WHERE LOWER(student_email) = LOWER(${email.trim()})
      ORDER BY created_at DESC
      LIMIT 50;
    `;
    res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("Error fetching student notifications:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─── GET /api/student-notifications/unread-count?email= ───────────────────
router.get("/unread-count", async (req, res) => {
  try {
    await ensureTable();
    const { email } = req.query;
    if (!email) return res.status(200).json({ success: true, count: 0 });

    const [{ count }] = await sql`
      SELECT COUNT(*)::int as count FROM student_notifications
      WHERE LOWER(student_email) = LOWER(${email.trim()}) AND is_read = FALSE;
    `;
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─── PUT /api/student-notifications/mark-all-read?email= — mark all read ──
router.put("/mark-all-read", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "email required." });
    await sql`
      UPDATE student_notifications
      SET is_read = TRUE
      WHERE LOWER(student_email) = LOWER(${email.trim()});
    `;
    res.status(200).json({ success: true, message: "All marked as read." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─── PUT /api/student-notifications/:id/read — mark one as read ────────────
router.put("/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    await sql`
      UPDATE student_notifications SET is_read = TRUE WHERE id = ${id};
    `;
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// ─── Internal helper: createStudentNotification (used by other routes) ─────
export async function createStudentNotification({ studentEmail, title, message, type = "reply", inquiryId = null }) {
  try {
    await ensureTable();
    await sql`
      INSERT INTO student_notifications (student_email, title, message, type, inquiry_id)
      VALUES (
        ${studentEmail.toLowerCase().trim()},
        ${title},
        ${message},
        ${type},
        ${inquiryId}
      );
    `;
  } catch (e) {
    console.error("Failed to create student notification:", e.message);
  }
}

export default router;
