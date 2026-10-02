import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql } from "../config/db.js";

const router = Router();
const TEACHER_JWT_SECRET = process.env.TEACHER_JWT_SECRET || "teacher_dashboard_secret_jwt_key_2026";

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase().trim());

// Middleware: Verify teacher JWT
const verifyTeacher = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: Teacher token missing." });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, TEACHER_JWT_SECRET);
    if (decoded.role !== "teacher") {
      return res.status(403).json({ success: false, message: "Access denied: Not a teacher account." });
    }
    req.teacher = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid or expired teacher token." });
  }
};

// POST /api/teachers/register
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, password, school = "", subject = "" } = req.body;

    if (!fullName || fullName.trim().length < 2)
      return res.status(400).json({ success: false, message: "Please provide a valid full name (at least 2 characters)." });
    if (!email || !isValidEmail(email))
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });

    const normalizedEmail = email.toLowerCase().trim();
    const [existing] = await sql`SELECT id FROM teachers WHERE LOWER(email) = LOWER(${normalizedEmail});`;
    if (existing)
      return res.status(409).json({ success: false, message: "A teacher account with this email already exists." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [teacher] = await sql`
      INSERT INTO teachers (full_name, email, password, school, subject)
      VALUES (${fullName.trim()}, ${normalizedEmail}, ${hashedPassword}, ${school}, ${subject})
      RETURNING id, full_name, email, school, subject, role, created_at;
    `;

    const token = jwt.sign(
      { id: teacher.id, email: teacher.email, role: "teacher" },
      TEACHER_JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      message: "Teacher account created successfully!",
      token,
      data: { id: teacher.id, fullName: teacher.full_name, email: teacher.email, school: teacher.school, subject: teacher.subject, role: teacher.role },
    });
  } catch (error) {
    console.error("Teacher register error:", error);
    res.status(500).json({ success: false, message: "Server error during registration.", error: error.message });
  }
});

// POST /api/teachers/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email))
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    if (!password)
      return res.status(400).json({ success: false, message: "Please enter your password." });

    const normalizedEmail = email.toLowerCase().trim();
    const [teacher] = await sql`SELECT * FROM teachers WHERE LOWER(email) = LOWER(${normalizedEmail});`;

    if (!teacher)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password." });

    const token = jwt.sign(
      { id: teacher.id, email: teacher.email, role: "teacher" },
      TEACHER_JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Teacher logged in successfully!",
      token,
      data: { id: teacher.id, fullName: teacher.full_name, email: teacher.email, school: teacher.school, subject: teacher.subject, role: teacher.role },
    });
  } catch (error) {
    console.error("Teacher login error:", error);
    res.status(500).json({ success: false, message: "Server error during login.", error: error.message });
  }
});

// GET /api/teachers/dashboard (protected)
router.get("/dashboard", verifyTeacher, async (req, res) => {
  try {
    const [totalStudents] = await sql`SELECT COUNT(*)::int AS count FROM student_profiles;`;
    const [withZScore] = await sql`SELECT COUNT(*)::int AS count FROM student_profiles WHERE z_score > 0;`;
    const [avgZScore] = await sql`SELECT ROUND(AVG(z_score)::numeric, 4) AS avg FROM student_profiles WHERE z_score > 0;`;
    const [totalCourses] = await sql`SELECT COUNT(*)::int AS count FROM courses;`;
    const [totalUniversities] = await sql`SELECT COUNT(*)::int AS count FROM universities;`;

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
          averageZScore: parseFloat(avgZScore.avg) || 0,
          totalCourses: totalCourses.count,
          totalUniversities: totalUniversities.count,
        },
        streamDistribution: streamDist,
        districtDistribution: districtDist,
        zScoreRanges,
        recentStudents: recentStudents.map((s) => ({ id: s.id, fullName: s.full_name, email: s.email, school: s.school || "-", stream: s.stream || "-", district: s.district || "-", zScore: parseFloat(s.z_score) || 0, joinedAt: s.created_at })),
        topStudents: topStudents.map((s) => ({ id: s.id, fullName: s.full_name, email: s.email, school: s.school || "-", stream: s.stream || "-", district: s.district || "-", zScore: parseFloat(s.z_score) || 0 })),
      },
    });
  } catch (error) {
    console.error("Teacher dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error fetching dashboard data.", error: error.message });
  }
});

// GET /api/teachers/students (protected)
router.get("/students", verifyTeacher, async (req, res) => {
  try {
    const { stream, district, search } = req.query;
    let conditions = ["1=1"];
    let params = [];

    if (stream) { conditions.push(`LOWER(stream) = LOWER($${params.length + 1})`); params.push(stream); }
    if (district) { conditions.push(`LOWER(district) = LOWER($${params.length + 1})`); params.push(district); }
    if (search) { conditions.push(`(LOWER(full_name) LIKE LOWER($${params.length + 1}) OR LOWER(email) LIKE LOWER($${params.length + 1}))`); params.push(`%${search}%`); }

    const students = await sql`
      SELECT id, full_name, email, school, stream, district, z_score, created_at
      FROM student_profiles
      ORDER BY created_at DESC LIMIT 200;
    `;

    let filtered = students;
    if (stream) filtered = filtered.filter(s => s.stream?.toLowerCase() === stream.toLowerCase());
    if (district) filtered = filtered.filter(s => s.district?.toLowerCase() === district.toLowerCase());
    if (search) filtered = filtered.filter(s => s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase()));

    res.status(200).json({
      success: true,
      data: filtered.map((s) => ({ id: s.id, fullName: s.full_name, email: s.email, school: s.school || "-", stream: s.stream || "-", district: s.district || "-", zScore: parseFloat(s.z_score) || 0, joinedAt: s.created_at })),
    });
  } catch (error) {
    console.error("Teacher students fetch error:", error);
    res.status(500).json({ success: false, message: "Server error fetching students.", error: error.message });
  }
});

export default router;
