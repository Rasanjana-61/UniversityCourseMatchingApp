import express from "express";
import cors from "cors";
import "dotenv/config";
import { initDB } from "./config/db.js";

import universitiesRoute from "./routes/universitiesRoute.js";
import coursesRoute from "./routes/coursesRoute.js";
import studentsRoute from "./routes/studentsRoute.js";
import matchingRoute from "./routes/matchingRoute.js";
import authRoute from "./routes/authRoute.js";
import scholarshipsRoute from "./routes/scholarshipsRoute.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    service: "University Course Matching API",
    timestamp: new Date().toISOString() 
  });
});

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/universities", universitiesRoute);
app.use("/api/courses", coursesRoute);
app.use("/api/students", studentsRoute);
app.use("/api/match", matchingRoute);
app.use("/api/scholarships", scholarshipsRoute);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled API Error:", err);
  res.status(500).json({ success: false, message: "Internal server error", error: err.message });
});

// Initialize Neon Database and Start Express Server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server is up and running on port http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to Neon Database:", err);
    process.exit(1);
  });
