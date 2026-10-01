import { sql } from "./config/db.js";

async function checkDatabase() {
  try {
    console.log("\n🔍 Checking Neon PostgreSQL Database...\n");

    // 1. Universities
    const universities = await sql`
      SELECT id, name, short_name, location, district 
      FROM universities 
      ORDER BY id ASC;
    `;
    console.log("🏫 Universities in DB (" + universities.length + "):");
    console.table(universities);

    // 2. Courses
    const courses = await sql`
      SELECT c.id, c.name, c.stream, c.min_z_score, u.short_name as univ
      FROM courses c
      JOIN universities u ON c.university_id = u.id
      ORDER BY c.id ASC;
    `;
    console.log("\n📚 Courses in DB (" + courses.length + "):");
    console.table(courses);

    // 3. Student Profiles
    const students = await sql`
      SELECT id, full_name, email, stream, z_score, district, saved_course_ids, created_at
      FROM student_profiles
      ORDER BY id DESC;
    `;
    console.log("\n👤 Student Profiles in DB (" + students.length + "):");
    if (students.length > 0) {
      console.table(students);
    } else {
      console.log("   (No students registered yet)");
    }

    console.log("\n✅ Database connection is working perfectly!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error querying database:", error);
    process.exit(1);
  }
}

checkDatabase();
