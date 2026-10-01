import { Router } from "express";
import { sql } from "../config/db.js";

const router = Router();

// GET all courses with optional filters (stream, search)
router.get("/", async (req, res) => {
  try {
    const { stream, search } = req.query;

    let courses;

    if (stream && search) {
      const searchPattern = `%${search}%`;
      courses = await sql`
        SELECT 
          c.*,
          u.name as university_name,
          u.short_name as university_short_name,
          u.location as university_location
        FROM courses c
        JOIN universities u ON c.university_id = u.id
        WHERE c.stream ILIKE ${stream} 
          AND (c.name ILIKE ${searchPattern} OR c.description ILIKE ${searchPattern} OR u.name ILIKE ${searchPattern})
        ORDER BY c.name ASC;
      `;
    } else if (stream) {
      courses = await sql`
        SELECT 
          c.*,
          u.name as university_name,
          u.short_name as university_short_name,
          u.location as university_location
        FROM courses c
        JOIN universities u ON c.university_id = u.id
        WHERE c.stream ILIKE ${stream}
        ORDER BY c.name ASC;
      `;
    } else if (search) {
      const searchPattern = `%${search}%`;
      courses = await sql`
        SELECT 
          c.*,
          u.name as university_name,
          u.short_name as university_short_name,
          u.location as university_location
        FROM courses c
        JOIN universities u ON c.university_id = u.id
        WHERE c.name ILIKE ${searchPattern} 
           OR c.description ILIKE ${searchPattern} 
           OR u.name ILIKE ${searchPattern}
        ORDER BY c.name ASC;
      `;
    } else {
      courses = await sql`
        SELECT 
          c.*,
          u.name as university_name,
          u.short_name as university_short_name,
          u.location as university_location
        FROM courses c
        JOIN universities u ON c.university_id = u.id
        ORDER BY c.name ASC;
      `;
    }

    res.status(200).json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// GET single course by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [course] = await sql`
      SELECT 
        c.*,
        u.name as university_name,
        u.short_name as university_short_name,
        u.location as university_location,
        u.website as university_website
      FROM courses c
      JOIN universities u ON c.university_id = u.id
      WHERE c.id = ${id};
    `;

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// POST create course
router.post("/", async (req, res) => {
  try {
    const {
      universityId,
      name,
      code,
      stream,
      degreeType,
      durationYears = 4,
      minZScore = 0.0,
      districtCutoffs = {},
      description = "",
      careerPaths = [],
    } = req.body;

    if (!universityId || !name || !code || !stream || !degreeType) {
      return res.status(400).json({
        success: false,
        message: "universityId, name, code, stream, and degreeType are required",
      });
    }

    const [created] = await sql`
      INSERT INTO courses (
        university_id, name, code, stream, degree_type, 
        duration_years, min_z_score, district_cutoffs, description, career_paths
      )
      VALUES (
        ${universityId}, ${name}, ${code}, ${stream}, ${degreeType},
        ${durationYears}, ${minZScore}, ${JSON.stringify(districtCutoffs)}, ${description}, ${careerPaths}
      )
      RETURNING *;
    `;

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
