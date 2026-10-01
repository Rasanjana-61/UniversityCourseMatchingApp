import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql } from "../config/db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "uni_course_match_super_secret_jwt_key_2026";

// Helper: Email format validator
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase().trim());
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      stream = "Physical Science",
      district = "Colombo",
      school = "",
      zScore = 0.0,
      interests = [],
      preferredLocations = [],
    } = req.body;

    // 1. Validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid full name (at least 2 characters).",
      });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanFullName = fullName.trim();

    // 2. Check if user already exists
    const [existing] = await sql`
      SELECT id, email, password FROM student_profiles WHERE LOWER(email) = LOWER(${normalizedEmail});
    `;

    if (existing && existing.password) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profile;
    if (existing) {
      // Update existing record with password
      const [updated] = await sql`
        UPDATE student_profiles
        SET
          full_name = ${cleanFullName},
          password = ${hashedPassword},
          school = COALESCE(NULLIF(${school}, ''), school),
          stream = COALESCE(NULLIF(${stream}, ''), stream),
          district = COALESCE(NULLIF(${district}, ''), district),
          updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(email) = LOWER(${normalizedEmail})
        RETURNING *;
      `;
      profile = updated;
    } else {
      // Insert new profile
      const [inserted] = await sql`
        INSERT INTO student_profiles (
          full_name,
          email,
          password,
          school,
          stream,
          district,
          z_score,
          interests,
          preferred_locations,
          saved_course_ids
        )
        VALUES (
          ${cleanFullName},
          ${normalizedEmail},
          ${hashedPassword},
          ${school},
          ${stream},
          ${district},
          ${parseFloat(zScore) || 0.0},
          ${interests},
          ${preferredLocations},
          ARRAY[]::INT[]
        )
        RETURNING *;
      `;
      profile = inserted;
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: profile.id, email: profile.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove hashed password from response
    delete profile.password;

    res.status(201).json({
      success: true,
      message: "Registration successful!",
      token,
      data: {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        school: profile.school || "",
        stream: profile.stream || "Physical Science",
        district: profile.district || "Colombo",
        zScore: parseFloat(profile.z_score) || 0.0,
        interests: profile.interests || [],
        preferredLocations: profile.preferred_locations || [],
        savedCourseIds: profile.saved_course_ids || [],
        subjects: profile.subjects || [],
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration. Please try again.",
      error: error.message,
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Please enter your password.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Query user from database
    const [user] = await sql`
      SELECT * FROM student_profiles WHERE LOWER(email) = LOWER(${normalizedEmail});
    `;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Password Verification
    if (!user.password) {
      // User registered without password previously or seeded; create hash for this password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await sql`
        UPDATE student_profiles SET password = ${hashedPassword} WHERE id = ${user.id};
      `;
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }
    }

    // 4. Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      token,
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        school: user.school || "",
        stream: user.stream || "Physical Science",
        district: user.district || "Colombo",
        zScore: parseFloat(user.z_score) || 0.0,
        interests: user.interests || [],
        preferredLocations: user.preferred_locations || [],
        savedCourseIds: user.saved_course_ids || [],
        subjects: user.subjects || [],
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login. Please try again.",
      error: error.message,
    });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const [user] = await sql`
      SELECT * FROM student_profiles WHERE id = ${decoded.id};
    `;

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        school: user.school || "",
        stream: user.stream || "Physical Science",
        district: user.district || "Colombo",
        zScore: parseFloat(user.z_score) || 0.0,
        interests: user.interests || [],
        preferredLocations: user.preferred_locations || [],
        savedCourseIds: user.saved_course_ids || [],
        subjects: user.subjects || [],
      },
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
});

import { sendOtpEmail } from "../config/emailService.js";

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if account exists
    const [user] = await sql`
      SELECT id, full_name, email FROM student_profiles WHERE LOWER(email) = LOWER(${normalizedEmail});
    `;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found registered with this email address.",
      });
    }

    // Generate 6-digit secure numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Clear previous pending OTPs for this email
    await sql`
      DELETE FROM password_resets WHERE LOWER(email) = LOWER(${normalizedEmail});
    `;

    // Save OTP to DB with 15 minutes expiration calculated directly in DB
    await sql`
      INSERT INTO password_resets (email, otp_code, expires_at)
      VALUES (${normalizedEmail}, ${otpCode}, CURRENT_TIMESTAMP + INTERVAL '15 minutes');
    `;

    // Send Email via Email Service
    await sendOtpEmail(normalizedEmail, otpCode, user.full_name);

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
      demoOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reset code. Please try again.",
      error: error.message,
    });
  }
});

// POST /api/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and 6-digit verification code are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Check if valid matching OTP exists and is not expired
    const [record] = await sql`
      SELECT id, email, otp_code 
      FROM password_resets 
      WHERE LOWER(email) = LOWER(${normalizedEmail}) 
        AND otp_code = ${cleanOtp}
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY id DESC LIMIT 1;
    `;

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code. Please check and try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Verification code confirmed successfully!",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Server error verifying code.",
      error: error.message,
    });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, verification code, and new password are required.",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Verify OTP directly in SQL
    const [record] = await sql`
      SELECT id 
      FROM password_resets 
      WHERE LOWER(email) = LOWER(${normalizedEmail}) 
        AND otp_code = ${cleanOtp}
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY id DESC LIMIT 1;
    `;

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update student password
    const [updated] = await sql`
      UPDATE student_profiles
      SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP
      WHERE LOWER(email) = LOWER(${normalizedEmail})
      RETURNING id, email;
    `;

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Student account not found.",
      });
    }

    // Delete used reset tokens for this email
    await sql`
      DELETE FROM password_resets WHERE LOWER(email) = LOWER(${normalizedEmail});
    `;

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully! You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Server error resetting password.",
      error: error.message,
    });
  }
});

export default router;
