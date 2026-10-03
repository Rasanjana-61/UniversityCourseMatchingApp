import { Router } from "express";
import { sql } from "../config/db.js";

const router = Router();

// GET all courses with optional filters (stream, search)
router.get("/", async (req, res) => {
  try {
    let { stream, search } = req.query;

    if (!stream || stream === "undefined" || stream === "null" || stream === "All" || !stream.trim()) {
      stream = null;
    } else {
      stream = stream.trim();
    }

    if (!search || search === "undefined" || search === "null" || !search.trim()) {
      search = null;
    } else {
      search = search.trim();
    }

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

// GET admission requirements for a specific course
router.get("/:id/admission", async (req, res) => {
  try {
    const { id } = req.params;
    const [course] = await sql`
      SELECT 
        c.id,
        c.name,
        c.code,
        c.stream,
        c.degree_type,
        c.duration_years,
        c.min_z_score,
        c.admission_requirements,
        u.name as university_name,
        u.short_name as university_short_name,
        u.location as university_location
      FROM courses c
      JOIN universities u ON c.university_id = u.id
      WHERE c.id = ${id};
    `;

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Default UGC Admission Criteria tailored to the stream & course
    const stream = course.stream || "Physical Science";
    let defaultSubjects = [
      { type: "Core", name: "Combined Mathematics" },
      { type: "Core", name: "Physics" },
    ];
    if (stream.toLowerCase().includes("bio")) {
      defaultSubjects = [
        { type: "Core", name: "Biology" },
        { type: "Core", name: "Chemistry" },
      ];
    } else if (stream.toLowerCase().includes("commerce")) {
      defaultSubjects = [
        { type: "Core", name: "Accounting" },
        { type: "Core", name: "Business Studies or Economics" },
      ];
    } else if (stream.toLowerCase().includes("tech")) {
      defaultSubjects = [
        { type: "Core", name: "Engineering Technology or Biosystems Tech" },
        { type: "Core", name: "Science for Technology (SFT)" },
      ];
    } else if (stream.toLowerCase().includes("art")) {
      defaultSubjects = [
        { type: "Core", name: "Any 3 Arts subjects approved by UGC" },
      ];
    }

    const requirements = {
      courseName: course.name,
      universityName: course.university_name,
      stream: course.stream,
      eligiblePill: "3 passes",
      streamNote: "Admission is based on district Z-score ranking for the selected stream and required subjects.",
      requiredSubjects: defaultSubjects,
      subjectsNote: "Students must sit for the required subjects in one sitting to be eligible for selection.",
      grades: {
        min: "At least three passes",
        recommended: "Stronger grades improve district Z-score ranking",
        note: "Meeting the minimum grade requirement does not guarantee admission.",
      },
      selection: {
        ranking: "Based on district Z-score ranking",
        cutOff: "Final cut-off depends on the university intake and district competition",
        note: "Admission is competitive and subject to the university's selection criteria.",
      },
      documents: {
        required: "Certified copies of A/L results and NIC",
        optional: "Additional certificates such as sports, leadership or extra-curricular achievements",
        note: "Keep scanned copies ready before the application window opens.",
      },
      deadlines: {
        results: "A/L results release",
        applications: "Application window opens after results release",
        note: "Keep track of the university's application timeline and document submission dates.",
      },
      ...(course.admission_requirements && Object.keys(course.admission_requirements).length > 0
        ? course.admission_requirements
        : {}),
    };

    res.status(200).json({ success: true, data: requirements });
  } catch (error) {
    console.error("Error fetching course admission requirements:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// POST create course
router.post("/", async (req, res) => {
  try {
    const universityId = req.body.universityId || req.body.university_id;
    const name = req.body.name?.trim();
    const code = req.body.code?.trim();
    const stream = req.body.stream?.trim();
    const degreeType = (req.body.degreeType || req.body.degree_type)?.trim();
    const durationYears = parseInt(req.body.durationYears || req.body.duration_years) || 4;
    const minZScore = req.body.minZScore !== undefined && req.body.minZScore !== ""
      ? parseFloat(req.body.minZScore)
      : (req.body.min_z_score !== undefined && req.body.min_z_score !== "" ? parseFloat(req.body.min_z_score) : 0.0);
    const districtCutoffs = req.body.districtCutoffs || req.body.district_cutoffs || {};
    const description = req.body.description?.trim() || "";
    let careerPaths = req.body.careerPaths || req.body.career_paths || [];
    if (typeof careerPaths === "string") {
      careerPaths = careerPaths.split(",").map((s) => s.trim()).filter(Boolean);
    }

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

    res.status(201).json({ success: true, message: "Course created successfully!", data: created });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// PUT update course
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const universityId = req.body.universityId || req.body.university_id;
    const name = req.body.name?.trim();
    const code = req.body.code?.trim();
    const stream = req.body.stream?.trim();
    const degreeType = (req.body.degreeType || req.body.degree_type)?.trim();
    const durationYears = parseInt(req.body.durationYears || req.body.duration_years) || 4;
    const minZScore = req.body.minZScore !== undefined && req.body.minZScore !== ""
      ? parseFloat(req.body.minZScore)
      : (req.body.min_z_score !== undefined && req.body.min_z_score !== "" ? parseFloat(req.body.min_z_score) : 0.0);
    const districtCutoffs = req.body.districtCutoffs || req.body.district_cutoffs || {};
    const description = req.body.description?.trim() || "";
    let careerPaths = req.body.careerPaths || req.body.career_paths || [];
    if (typeof careerPaths === "string") {
      careerPaths = careerPaths.split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (!universityId || !name || !code || !stream || !degreeType) {
      return res.status(400).json({
        success: false,
        message: "universityId, name, code, stream, and degreeType are required",
      });
    }

    const [updated] = await sql`
      UPDATE courses
      SET
        university_id = ${universityId},
        name = ${name},
        code = ${code},
        stream = ${stream},
        degree_type = ${degreeType},
        duration_years = ${durationYears},
        min_z_score = ${minZScore},
        district_cutoffs = ${JSON.stringify(districtCutoffs)},
        description = ${description},
        career_paths = ${careerPaths}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (!updated) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({ success: true, message: "Course updated successfully!", data: updated });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// DELETE course
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [deleted] = await sql`
      DELETE FROM courses WHERE id = ${id} RETURNING id, name;
    `;

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    res.status(200).json({
      success: true,
      message: `Course "${deleted.name}" deleted successfully!`,
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;

