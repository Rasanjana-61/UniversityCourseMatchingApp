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

// POST create scholarship
router.post("/", async (req, res) => {
  try {
    const title = req.body.title?.trim();
    const category = req.body.category?.trim();
    const provider = req.body.provider?.trim();
    const eligibility = req.body.eligibility?.trim();
    const value = req.body.value?.trim();
    const deadline = req.body.deadline?.trim();
    const status = req.body.status?.trim() || "Open";
    const description = req.body.description?.trim() || "";
    const benefits = req.body.benefits?.trim() || "";
    const requirements = req.body.requirements?.trim() || "";
    const applicationInstructions = (req.body.applicationInstructions || req.body.application_instructions)?.trim() || "";
    const officialSourceUrl = (req.body.officialSourceUrl || req.body.official_source_url)?.trim() || "";

    if (!title || !category || !provider || !eligibility || !value || !deadline) {
      return res.status(400).json({
        success: false,
        message: "title, category, provider, eligibility, value, and deadline are required",
      });
    }

    const [created] = await sql`
      INSERT INTO scholarships (
        title, category, provider, eligibility, value, deadline,
        status, description, benefits, requirements, application_instructions, official_source_url
      )
      VALUES (
        ${title}, ${category}, ${provider}, ${eligibility}, ${value}, ${deadline},
        ${status}, ${description}, ${benefits}, ${requirements}, ${applicationInstructions}, ${officialSourceUrl}
      )
      RETURNING *;
    `;

    res.status(201).json({ success: true, message: "Scholarship created successfully!", data: created });
  } catch (error) {
    console.error("Error creating scholarship:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// PUT update scholarship
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const title = req.body.title?.trim();
    const category = req.body.category?.trim();
    const provider = req.body.provider?.trim();
    const eligibility = req.body.eligibility?.trim();
    const value = req.body.value?.trim();
    const deadline = req.body.deadline?.trim();
    const status = req.body.status?.trim() || "Open";
    const description = req.body.description?.trim() || "";
    const benefits = req.body.benefits?.trim() || "";
    const requirements = req.body.requirements?.trim() || "";
    const applicationInstructions = (req.body.applicationInstructions || req.body.application_instructions)?.trim() || "";
    const officialSourceUrl = (req.body.officialSourceUrl || req.body.official_source_url)?.trim() || "";

    if (!title || !category || !provider || !eligibility || !value || !deadline) {
      return res.status(400).json({
        success: false,
        message: "title, category, provider, eligibility, value, and deadline are required",
      });
    }

    const [updated] = await sql`
      UPDATE scholarships
      SET
        title = ${title},
        category = ${category},
        provider = ${provider},
        eligibility = ${eligibility},
        value = ${value},
        deadline = ${deadline},
        status = ${status},
        description = ${description},
        benefits = ${benefits},
        requirements = ${requirements},
        application_instructions = ${applicationInstructions},
        official_source_url = ${officialSourceUrl}
      WHERE id = ${id}
      RETURNING *;
    `;

    if (!updated) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }

    res.status(200).json({ success: true, message: "Scholarship updated successfully!", data: updated });
  } catch (error) {
    console.error("Error updating scholarship:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// DELETE scholarship
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [deleted] = await sql`
      DELETE FROM scholarships WHERE id = ${id} RETURNING id, title;
    `;

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Scholarship not found" });
    }

    res.status(200).json({
      success: true,
      message: `Scholarship "${deleted.title}" deleted successfully!`,
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting scholarship:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;

