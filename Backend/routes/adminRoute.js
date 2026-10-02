import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql } from "../config/db.js";

const router = Router();
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin_panel_secret_jwt_key_2026";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase().trim());

// Middleware: Verify admin JWT
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

// POST /api/admin/register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, school = "", subject = "" } = req.body;
    if (!fullName || fullName.trim().length < 2)
      return res.status(400).json({ success: false, message: "Please provide a valid full name." });
    if (!email || !isValidEmail(email))
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

    const normalizedEmail = email.toLowerCase().trim();
    const [existing] = await sql`SELECT id FROM teachers WHERE LOWER(email) = LOWER(${normalizedEmail});`;
    if (existing)
      return res.status(409).json({ success: false, message: "An admin account with this email already exists." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [admin] = await sql`
      INSERT INTO teachers (full_name, email, password, school, subject, role)
      VALUES (${fullName.trim()}, ${normalizedEmail}, ${hashedPassword}, ${school}, ${subject}, 'admin')
      RETURNING id, full_name, email, school, subject, role, created_at;
    `;

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      ADMIN_JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Admin account created successfully!",
      token,
      data: { id: admin.id, fullName: admin.full_name, email: admin.email, school: admin.school, subject: admin.subject, role: admin.role },
    });
  } catch (error) {
    console.error("Admin register error:", error);
    res.status(500).json({ success: false, message: "Server error during registration.", error: error.message });
  }
});

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !isValidEmail(email))
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    if (!password)
      return res.status(400).json({ success: false, message: "Please enter your password." });

    const normalizedEmail = email.toLowerCase().trim();
    const [admin] = await sql`SELECT * FROM teachers WHERE LOWER(email) = LOWER(${normalizedEmail});`;

    if (!admin)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role || "admin" },
      ADMIN_JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully!",
      token,
      data: { id: admin.id, fullName: admin.full_name, email: admin.email, school: admin.school, subject: admin.subject, role: admin.role },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server error during login.", error: error.message });
  }
});

// GET /api/admin/dashboard (protected)
router.get("/dashboard", verifyAdmin, async (req, res) => {
  try {
    const [totalStudents] = await sql`SELECT COUNT(*)::int AS count FROM student_profiles;`;
    const [withZScore] = await sql`SELECT COUNT(*)::int AS count FROM student_profiles WHERE z_score > 0;`;
    const [avgZScoreRow] = await sql`SELECT ROUND(AVG(z_score)::numeric, 4) AS avg FROM student_profiles WHERE z_score > 0;`;
    const [totalCourses] = await sql`SELECT COUNT(*)::int AS count FROM courses;`;
    const [totalUniversities] = await sql`SELECT COUNT(*)::int AS count FROM universities;`;
    const [totalQuestions] = await sql`SELECT COUNT(*)::int AS count FROM assessment_questions;`;

    const streamDist = await sql`
      SELECT stream, COUNT(*)::int AS count
      FROM student_profiles
      WHERE stream IS NOT NULL AND stream != ''
      GROUP BY stream ORDER BY count DESC;
    `;

    const districtDist = await sql`
      SELECT district, COUNT(*)::int AS count
      FROM student_profiles
      WHERE district IS NOT NULL AND district != ''
      GROUP BY district ORDER BY count DESC LIMIT 8;
    `;

    const recentStudents = await sql`
      SELECT id, full_name, email, school, stream, district, z_score, created_at
      FROM student_profiles ORDER BY created_at DESC LIMIT 10;
    `;

    const topStudents = await sql`
      SELECT id, full_name, email, school, stream, district, z_score
      FROM student_profiles WHERE z_score > 0 ORDER BY z_score DESC LIMIT 10;
    `;

    const zScoreRanges = await sql`
      SELECT
        CASE
          WHEN z_score >= 2.0 THEN 'Excellent (2.0+)'
          WHEN z_score >= 1.7 THEN 'Very Good (1.7-1.99)'
          WHEN z_score >= 1.4 THEN 'Good (1.4-1.69)'
          WHEN z_score >= 1.0 THEN 'Average (1.0-1.39)'
          ELSE 'Below Average (<1.0)'
        END AS range,
        COUNT(*)::int AS count
      FROM student_profiles WHERE z_score > 0
      GROUP BY range ORDER BY MIN(z_score) DESC;
    `;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents: totalStudents.count,
          studentsWithZScore: withZScore.count,
          averageZScore: parseFloat(avgZScoreRow.avg) || 0,
          totalCourses: totalCourses.count,
          totalUniversities: totalUniversities.count,
          totalQuestions: totalQuestions.count,
        },
        streamDistribution: streamDist,
        districtDistribution: districtDist,
        zScoreRanges,
        recentStudents: recentStudents.map((s) => ({ id: s.id, fullName: s.full_name, email: s.email, school: s.school || "-", stream: s.stream || "-", district: s.district || "-", zScore: parseFloat(s.z_score) || 0, joinedAt: s.created_at })),
        topStudents: topStudents.map((s) => ({ id: s.id, fullName: s.full_name, email: s.email, school: s.school || "-", stream: s.stream || "-", district: s.district || "-", zScore: parseFloat(s.z_score) || 0 })),
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error fetching dashboard data.", error: error.message });
  }
});

// GET /api/admin/students (protected)
router.get("/students", verifyAdmin, async (req, res) => {
  try {
    const { stream, district, search } = req.query;
    const students = await sql`
      SELECT id, full_name, email, school, stream, district, z_score, created_at
      FROM student_profiles ORDER BY created_at DESC LIMIT 200;
    `;

    let filtered = students;
    if (stream) filtered = filtered.filter(s => s.stream?.toLowerCase() === stream.toLowerCase());
    if (district) filtered = filtered.filter(s => s.district?.toLowerCase() === district.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(s => s.full_name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
    }

    res.status(200).json({
      success: true,
      data: filtered.map((s) => ({ id: s.id, fullName: s.full_name, email: s.email, school: s.school || "-", stream: s.stream || "-", district: s.district || "-", zScore: parseFloat(s.z_score) || 0, joinedAt: s.created_at })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error fetching students.", error: error.message });
  }
});

// ─── Assessment Questions CRUD ───────────────────────────────────────────────

// GET /api/admin/questions — List all questions (public, used by student app too)
router.get("/questions", async (req, res) => {
  try {
    const questions = await sql`SELECT * FROM assessment_questions ORDER BY sort_order ASC, id ASC;`;
    res.status(200).json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching questions.", error: error.message });
  }
});

// POST /api/admin/questions — Create a question (admin only)
router.post("/questions", verifyAdmin, async (req, res) => {
  try {
    const { text, category, sortOrder } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false, message: "Question text is required." });
    if (!category || !["Technology", "Business", "Creative", "Social"].includes(category))
      return res.status(400).json({ success: false, message: "Category must be one of: Technology, Business, Creative, Social." });

    const [q] = await sql`
      INSERT INTO assessment_questions (text, category, sort_order)
      VALUES (${text.trim()}, ${category}, ${sortOrder || 99})
      RETURNING *;
    `;
    res.status(201).json({ success: true, message: "Question created successfully!", data: q });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating question.", error: error.message });
  }
});

// PUT /api/admin/questions/:id — Update a question (admin only)
router.put("/questions/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { text, category, sortOrder, isActive } = req.body;

    if (!text || !text.trim()) return res.status(400).json({ success: false, message: "Question text is required." });
    if (!category || !["Technology", "Business", "Creative", "Social"].includes(category))
      return res.status(400).json({ success: false, message: "Category must be one of: Technology, Business, Creative, Social." });

    const [q] = await sql`
      UPDATE assessment_questions
      SET text = ${text.trim()}, category = ${category},
          sort_order = ${sortOrder ?? 99}, is_active = ${isActive ?? true},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)}
      RETURNING *;
    `;

    if (!q) return res.status(404).json({ success: false, message: "Question not found." });
    res.status(200).json({ success: true, message: "Question updated successfully!", data: q });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating question.", error: error.message });
  }
});

// DELETE /api/admin/questions/:id — Delete a question (admin only)
router.delete("/questions/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [deleted] = await sql`DELETE FROM assessment_questions WHERE id = ${parseInt(id)} RETURNING id;`;
    if (!deleted) return res.status(404).json({ success: false, message: "Question not found." });
    res.status(200).json({ success: true, message: "Question deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting question.", error: error.message });
  }
});

export default router;
