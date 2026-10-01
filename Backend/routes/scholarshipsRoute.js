import { Router } from "express";
import { sql } from "../config/db.js";

const router = Router();

// GET all scholarships (with optional ?search= &category=)
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    let scholarships;
    if (search && category) {
      const searchPattern = `%${search}%`;
      scholarships = await sql`
        SELECT * FROM scholarships 
        WHERE category ILIKE ${category}
          AND (title ILIKE ${searchPattern} OR provider ILIKE ${searchPattern} OR eligibility ILIKE ${searchPattern})
        ORDER BY id ASC;
      `;
    } else if (category) {
      scholarships = await sql`
        SELECT * FROM scholarships 
        WHERE category ILIKE ${category}
        ORDER BY id ASC;
      `;
    } else if (search) {
      const searchPattern = `%${search}%`;
      scholarships = await sql`
        SELECT * FROM scholarships 
        WHERE title ILIKE ${searchPattern} 
           OR provider ILIKE ${searchPattern} 
           OR eligibility ILIKE ${searchPattern}
        ORDER BY id ASC;
      `;
    } else {
      scholarships = await sql`
        SELECT * FROM scholarships 
        ORDER BY id ASC;
      `;
    }

    res.status(200).json({ success: true, count: scholarships.length, data: scholarships });
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// GET single scholarship by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [scholarship] = await sql`
      SELECT * FROM scholarships WHERE id = ${id};
    `;

    if (!scholarship) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }

    res.status(200).json({ success: true, data: scholarship });
  } catch (error) {
    console.error("Error fetching scholarship details:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
