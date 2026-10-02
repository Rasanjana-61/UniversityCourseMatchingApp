import { Router } from "express";
import jwt from "jsonwebtoken";
import { sql } from "../config/db.js";

const router = Router();
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin_panel_secret_jwt_key_2026";

// Middleware: Admin verification
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: Admin token missing." });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (decoded.role !== "admin" && decoded.role !== "teacher") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    req.admin = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid or expired admin token." });
  }
};

// 1. POST /api/inquiries — Create a new student inquiry
router.post("/", async (req, res) => {
  try {
    const { studentEmail, studentName, category, subject, message } = req.body;

    if (!studentEmail || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Student email, subject, and message are required.",
      });
    }

    const [inquiry] = await sql`
      INSERT INTO inquiries (student_email, student_name, category, subject, message, status)
      VALUES (
        ${studentEmail.toLowerCase().trim()},
        ${studentName || "Student"},
        ${category || "Admissions"},
        ${subject.trim()},
        ${message.trim()},
        'Pending'
      )
      RETURNING *;
    `;

    res.status(201).json({
      success: true,
      message: "Your inquiry has been submitted successfully! An advisor will review it.",
      data: inquiry,
    });
  } catch (error) {
    console.error("Error creating inquiry:", error);
    res.status(500).json({ success: false, message: "Server error creating inquiry.", error: error.message });
  }
});

// 2. GET /api/inquiries/my — Get all inquiries submitted by a student
router.get("/my", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email query param is required." });
    }

    const inquiries = await sql`
      SELECT * FROM inquiries
      WHERE LOWER(student_email) = LOWER(${email.trim()})
      ORDER BY created_at DESC;
    `;

    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    console.error("Error fetching my inquiries:", error);
    res.status(500).json({ success: false, message: "Server error fetching inquiries.", error: error.message });
  }
});

// 3. GET /api/inquiries — Admin: Get all inquiries with optional category or status filter
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const { status, category, search } = req.query;

    const inquiries = await sql`
      SELECT * FROM inquiries
      ORDER BY 
        CASE WHEN status = 'Pending' THEN 1 WHEN status = 'Replied' THEN 2 ELSE 3 END,
        created_at DESC;
    `;

    let filtered = inquiries;
    if (status) {
      filtered = filtered.filter(i => i.status.toLowerCase() === status.toLowerCase());
    }
    if (category) {
      filtered = filtered.filter(i => i.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i => 
        i.subject?.toLowerCase().includes(q) ||
        i.message?.toLowerCase().includes(q) ||
        i.student_name?.toLowerCase().includes(q) ||
        i.student_email?.toLowerCase().includes(q)
      );
    }

    res.status(200).json({ success: true, data: filtered });
  } catch (error) {
    console.error("Error fetching all inquiries:", error);
    res.status(500).json({ success: false, message: "Server error fetching inquiries.", error: error.message });
  }
});

// 4. PUT /api/inquiries/:id/reply — Admin: Reply to an inquiry & update status
router.put("/:id/reply", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reply, status = "Replied" } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, message: "Reply message cannot be empty." });
    }

    const [updated] = await sql`
      UPDATE inquiries
      SET 
        admin_reply = ${reply.trim()},
        status = ${status},
        replied_at = CURRENT_TIMESTAMP,
        replied_by = ${req.admin?.email || "Admin"},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
      RETURNING *;
    `;

    if (!updated) {
      return res.status(404).json({ success: false, message: "Inquiry not found." });
    }

    res.status(200).json({
      success: true,
      message: "Reply sent successfully!",
      data: updated,
    });
  } catch (error) {
    console.error("Error replying to inquiry:", error);
    res.status(500).json({ success: false, message: "Server error replying to inquiry.", error: error.message });
  }
});

// 5. PUT /api/inquiries/:id/status — Admin: Update status (e.g. Closed)
router.put("/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["Pending", "Replied", "Closed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Valid status required: Pending, Replied, or Closed." });
    }

    const [updated] = await sql`
      UPDATE inquiries
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
      RETURNING *;
    `;

    if (!updated) {
      return res.status(404).json({ success: false, message: "Inquiry not found." });
    }

    res.status(200).json({ success: true, message: `Inquiry marked as ${status}.`, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error updating inquiry status.", error: error.message });
  }
});

// 6. DELETE /api/inquiries/:id — Delete inquiry
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [deleted] = await sql`DELETE FROM inquiries WHERE id = ${parseInt(id)} RETURNING id;`;
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Inquiry not found." });
    }
    res.status(200).json({ success: true, message: "Inquiry deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error deleting inquiry.", error: error.message });
  }
});

export default router;
