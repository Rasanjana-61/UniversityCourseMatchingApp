import { Router } from "express";
import { sql } from "../config/db.js";

const router = Router();

// POST /api/match
// Body: { stream, zScore, district, interests, preferredLocations }
router.post("/", async (req, res) => {
  try {
    const {
      stream,
      zScore,
      district = "Colombo",
      interests = [],
      preferredLocations = [],
    } = req.body;

    if (!stream || zScore === undefined) {
      return res.status(400).json({
        success: false,
        message: "stream and zScore are required for course matching",
      });
    }

    const studentZ = parseFloat(zScore);

    // Fetch courses for this stream
    const courses = await sql`
      SELECT 
        c.*,
        u.name as university_name,
        u.short_name as university_short_name,
        u.location as university_location,
        u.district as university_district
      FROM courses c
      JOIN universities u ON c.university_id = u.id
      WHERE c.stream ILIKE ${stream}
      ORDER BY c.min_z_score DESC;
    `;

    // Process matching logic
    const matched = courses.map((course) => {
      // Find district cutoff if present
      const cutoffs = course.district_cutoffs || {};
      const districtCutoff = cutoffs[district] !== undefined 
        ? parseFloat(cutoffs[district]) 
        : parseFloat(course.min_z_score);

      const zDiff = studentZ - districtCutoff;

      let status = "unlikely";
      let statusLabel = "Unlikely";
      let probability = 10;

      if (zDiff >= 0.15) {
        status = "safe";
        statusLabel = "High Chance (Safe)";
        probability = 95;
      } else if (zDiff >= 0) {
        status = "target";
        statusLabel = "Eligible (Target)";
        probability = 75;
      } else if (zDiff >= -0.10) {
        status = "reach";
        statusLabel = "Borderline (Reach)";
        probability = 40;
      } else {
        status = "unlikely";
        statusLabel = "Challenging";
        probability = 15;
      }

      // Calculate interest relevance
      let interestScore = 0;
      if (Array.isArray(interests) && interests.length > 0) {
        const textToSearch = [
          course.name,
          course.description || "",
          ...(course.career_paths || []),
        ].join(" ").toLowerCase();

        interests.forEach((interest) => {
          if (textToSearch.includes(interest.toLowerCase().trim())) {
            interestScore += 1;
          }
        });
      }

      // Location match bonus
      let locationBonus = 0;
      if (Array.isArray(preferredLocations) && preferredLocations.length > 0) {
        const univLoc = (course.university_location + " " + course.university_district).toLowerCase();
        if (preferredLocations.some((loc) => univLoc.includes(loc.toLowerCase().trim()))) {
          locationBonus = 5;
        }
      }

      const overallScore = Math.min(100, Math.round(probability + (interestScore * 10) + locationBonus));

      return {
        ...course,
        requiredCutoff: districtCutoff,
        studentZScore: studentZ,
        zDiff: Number(zDiff.toFixed(4)),
        matchStatus: status,
        matchStatusLabel: statusLabel,
        matchScore: overallScore,
        interestMatchCount: interestScore,
      };
    });

    // Sort by matchScore descending
    matched.sort((a, b) => b.matchScore - a.matchScore);

    // Grouping
    const eligible = matched.filter((c) => c.matchStatus === "safe" || c.matchStatus === "target");
    const reach = matched.filter((c) => c.matchStatus === "reach");
    const others = matched.filter((c) => c.matchStatus === "unlikely");

    res.status(200).json({
      success: true,
      meta: {
        stream,
        zScore: studentZ,
        district,
        totalEvaluated: matched.length,
        eligibleCount: eligible.length,
        reachCount: reach.length,
      },
      data: {
        topRecommendations: matched.slice(0, 5),
        eligible,
        reach,
        others,
        all: matched,
      },
    });
  } catch (error) {
    console.error("Error matching courses:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

export default router;
