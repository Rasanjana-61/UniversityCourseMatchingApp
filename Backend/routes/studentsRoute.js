import { Router } from "express";
import { sql } from "../config/db.js";

const router = Router();

// GET or check student profile by email
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const [student] = await sql`
      SELECT * FROM student_profiles WHERE LOWER(email) = LOWER(${email});
    `;

    if (!student) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error("Error fetching student profile:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// PUT /:email - Update basic profile info (name, school, district, etc.)
router.put("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const { fullName, school, district, location, interests, skills } = req.body;

    const [existing] = await sql`
      SELECT id FROM student_profiles WHERE LOWER(email) = LOWER(${email});
    `;

    if (!existing) {
      return res.status(404).json({ success: false, message: "Student profile not found" });
    }

    const [updated] = await sql`
      UPDATE student_profiles SET
        full_name = COALESCE(NULLIF(${fullName || ""}, ""), full_name),
        school = COALESCE(NULLIF(${school || ""}, ""), school),
        district = COALESCE(NULLIF(${district || ""}, ""), district),
        interests = CASE WHEN ${Array.isArray(interests) ? JSON.stringify(interests) : null}::jsonb IS NOT NULL 
                        THEN ${Array.isArray(interests) ? interests : []}
                        ELSE interests END,
        updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(email) = LOWER(${email})
      RETURNING *;
    `;

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating student profile:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// POST / PUT create or update student profile (upsert)
router.post("/", async (req, res) => {
  try {
    const {
      fullName,
      email,
      stream = "Physical Science",
      zScore = 0,
      district = "Colombo",
      school = "",
      interests = [],
      preferredLocations = [],
      subjects = [],
    } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        message: "fullName and email are required",
      });
    }

    // Normalize subjects to JSONB
    const subjectsJson = Array.isArray(subjects) ? JSON.stringify(subjects) : "[]";

    const [profile] = await sql`
      INSERT INTO student_profiles (
        full_name, email, stream, z_score, district, school,
        interests, preferred_locations, subjects, updated_at
      )
      VALUES (
        ${fullName}, LOWER(${email}), ${stream}, ${parseFloat(zScore) || 0}, ${district}, ${school},
        ${interests}, ${preferredLocations}, ${subjectsJson}::jsonb, CURRENT_TIMESTAMP
      )
      ON CONFLICT (email) 
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        stream = EXCLUDED.stream,
        z_score = EXCLUDED.z_score,
        district = EXCLUDED.district,
        school = COALESCE(NULLIF(EXCLUDED.school, ''), student_profiles.school),
        interests = EXCLUDED.interests,
        preferred_locations = EXCLUDED.preferred_locations,
        subjects = EXCLUDED.subjects,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    console.error("Error saving student profile:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// POST toggle bookmark / save course
router.post("/:email/toggle-save", async (req, res) => {
  try {
    const { email } = req.params;
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const [student] = await sql`
      SELECT saved_course_ids FROM student_profiles WHERE LOWER(email) = LOWER(${email});
    `;

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    let savedIds = student.saved_course_ids || [];
    const numericId = parseInt(courseId, 10);
    const isSaved = savedIds.includes(numericId);

    if (isSaved) {
      savedIds = savedIds.filter((id) => id !== numericId);
    } else {
      savedIds.push(numericId);
    }

    const [updated] = await sql`
      UPDATE student_profiles
      SET saved_course_ids = ${savedIds}, updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(email) = LOWER(${email})
      RETURNING *;
    `;

    res.status(200).json({
      success: true,
      isSaved: !isSaved,
      savedCourseIds: updated.saved_course_ids,
    });
  } catch (error) {
    console.error("Error updating saved courses:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// GET saved courses with full course and university details
router.get("/:email/saved-courses", async (req, res) => {
  try {
    const { email } = req.params;
    const [student] = await sql`
      SELECT saved_course_ids FROM student_profiles WHERE LOWER(email) = LOWER(${email});
    `;

    if (!student || !student.saved_course_ids || student.saved_course_ids.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const courses = await sql`
      SELECT 
        c.*,
        u.name as university_name,
        u.short_name as university_short_name,
        u.location as university_location
      FROM courses c
      JOIN universities u ON c.university_id = u.id
      WHERE c.id = ANY(${student.saved_course_ids})
      ORDER BY c.name ASC;
    `;

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error("Error fetching saved courses:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
