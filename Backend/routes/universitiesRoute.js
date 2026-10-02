import { Router } from "express";
import { sql } from "../config/db.js";

const router = Router();

// GET all universities
router.get("/", async (req, res) => {
  try {
    const universities = await sql`
      SELECT 
        u.*,
        COUNT(c.id)::int as courses_count
      FROM universities u
      LEFT JOIN courses c ON u.id = c.university_id
      GROUP BY u.id
      ORDER BY u.name ASC;
    `;
    res.status(200).json({ success: true, count: universities.length, data: universities });
  } catch (error) {
    console.error("Error fetching universities:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// GET single university by ID with its courses
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [university] = await sql`
      SELECT * FROM universities WHERE id = ${id};
    `;

    if (!university) {
      return res.status(404).json({ success: false, message: "University not found" });
    }

    const courses = await sql`
      SELECT * FROM courses WHERE university_id = ${id} ORDER BY name ASC;
    `;

    res.status(200).json({ success: true, data: { ...university, courses } });
  } catch (error) {
    console.error("Error fetching university:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// POST create university
router.post("/", async (req, res) => {
  try {
    const { name, shortName, location, district, description, website, logoUrl, backgroundImageUrl } = req.body;

    if (!name || !shortName || !location || !district) {
      return res.status(400).json({
        success: false,
        message: "name, shortName, location, and district are required",
      });
    }

    const [created] = await sql`
      INSERT INTO universities (name, short_name, location, district, description, website, logo_url, background_image_url)
      VALUES (${name}, ${shortName}, ${location}, ${district}, ${description || null}, ${website || null}, ${logoUrl || null}, ${backgroundImageUrl || null})
      RETURNING *;
    `;

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("Error creating university:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
