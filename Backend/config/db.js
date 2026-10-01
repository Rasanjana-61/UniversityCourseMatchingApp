import { neon } from "@neondatabase/serverless";
import "dotenv/config";

// Creates an HTTP-based serverless SQL connection using Neon DB URL
export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    console.log("Connecting to Neon PostgreSQL database...");

    // 1. Universities Table
    await sql`
      CREATE TABLE IF NOT EXISTS universities (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        short_name VARCHAR(50) UNIQUE NOT NULL,
        location VARCHAR(255) NOT NULL,
        district VARCHAR(100) NOT NULL,
        description TEXT,
        website VARCHAR(255),
        logo_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Courses Table
    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        university_id INT REFERENCES universities(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        stream VARCHAR(100) NOT NULL,
        degree_type VARCHAR(100) NOT NULL,
        duration_years INT DEFAULT 4,
        min_z_score DECIMAL(5, 4) DEFAULT 0.0000,
        district_cutoffs JSONB DEFAULT '{}'::jsonb,
        description TEXT,
        career_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. Student Profiles Table
    await sql`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        stream VARCHAR(100) NOT NULL,
        z_score DECIMAL(5, 4) NOT NULL,
        district VARCHAR(100) NOT NULL,
        interests TEXT[] DEFAULT ARRAY[]::TEXT[],
        preferred_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
        saved_course_ids INT[] DEFAULT ARRAY[]::INT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Seed sample Universities & Courses if empty
    const universityCount = await sql`SELECT COUNT(*)::int as count FROM universities`;
    if (universityCount[0].count === 0) {
      console.log("Seeding initial Universities and Courses data...");
      
      const [uom] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES (
          'University of Moratuwa', 
          'UOM', 
          'Katubedda, Moratuwa', 
          'Colombo', 
          'Leading technological university in Sri Lanka renowned for Engineering, IT, and Architecture.', 
          'https://uom.lk'
        ) RETURNING id;
      `;

      const [uoc] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES (
          'University of Colombo', 
          'UOC', 
          'Colombo 03', 
          'Colombo', 
          'Oldest university in Sri Lanka offering diverse faculties in Science, Medicine, Arts, and Law.', 
          'https://cmb.ac.lk'
        ) RETURNING id;
      `;

      const [uop] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES (
          'University of Peradeniya', 
          'UOP', 
          'Peradeniya, Kandy', 
          'Kandy', 
          'Comprehensive university set amidst the scenic hills with faculties across all major disciplines.', 
          'https://pdn.ac.lk'
        ) RETURNING id;
      `;

      // Seed Courses for Moratuwa
      await sql`
        INSERT INTO courses (university_id, name, code, stream, degree_type, duration_years, min_z_score, district_cutoffs, description, career_paths)
        VALUES 
        (
          ${uom.id},
          'Engineering (Physical Science)',
          'ENG-UOM',
          'Physical Science',
          'BSc (Hons) in Engineering',
          4,
          1.9200,
          '{"Colombo": 2.05, "Gampaha": 1.98, "Kandy": 1.95, "Galle": 1.92}'::jsonb,
          'Covers Electronic, Computer Science, Mechanical, Civil, Chemical, Biomedical and Electrical Engineering disciplines.',
          ARRAY['Software Engineer', 'Civil Engineer', 'Electrical Engineer', 'Robotics Specialist']
        ),
        (
          ${uom.id},
          'Information Technology (IT)',
          'IT-UOM',
          'Physical Science',
          'BSc (Hons) in Information Technology',
          4,
          1.6500,
          '{"Colombo": 1.78, "Gampaha": 1.72, "Kandy": 1.68}'::jsonb,
          'Specialized program for software systems, cloud computing, cyber security, and enterprise solutions.',
          ARRAY['Full Stack Developer', 'Cloud Engineer', 'DevOps Specialist', 'System Analyst']
        );
      `;

      // Seed Courses for Colombo
      await sql`
        INSERT INTO courses (university_id, name, code, stream, degree_type, duration_years, min_z_score, district_cutoffs, description, career_paths)
        VALUES 
        (
          ${uoc.id},
          'Computer Science',
          'CS-UCSC',
          'Physical Science',
          'BSc (Hons) in Computer Science',
          4,
          1.7500,
          '{"Colombo": 1.88, "Gampaha": 1.82, "Kandy": 1.79}'::jsonb,
          'Offered by University of Colombo School of Computing (UCSC) focusing on algorithms, AI, and systems.',
          ARRAY['AI Engineer', 'Data Scientist', 'Software Architect', 'Researcher']
        ),
        (
          ${uoc.id},
          'Medicine (MBBS)',
          'MED-UOC',
          'Biological Science',
          'Bachelor of Medicine, Bachelor of Surgery',
          5,
          2.1000,
          '{"Colombo": 2.25, "Gampaha": 2.18, "Kandy": 2.12}'::jsonb,
          'Premier medical program training doctors and surgeons with clinical practice at National Hospital of Sri Lanka.',
          ARRAY['Medical Doctor', 'Surgeon', 'Medical Researcher', 'Healthcare Consultant']
        );
      `;

      // Seed Courses for Peradeniya
      await sql`
        INSERT INTO courses (university_id, name, code, stream, degree_type, duration_years, min_z_score, district_cutoffs, description, career_paths)
        VALUES 
        (
          ${uop.id},
          'Dental Surgery (BDS)',
          'DS-UOP',
          'Biological Science',
          'Bachelor of Dental Surgery',
          5,
          1.8800,
          '{"Colombo": 1.95, "Kandy": 1.89, "Galle": 1.85}'::jsonb,
          'The only dental faculty in Sri Lanka producing qualified dental surgeons with world-class facilities.',
          ARRAY['Dental Surgeon', 'Oral Specialist', 'Orthodontist']
        ),
        (
          ${uop.id},
          'Civil Engineering',
          'CIV-UOP',
          'Physical Science',
          'BSc (Hons) in Engineering (Civil)',
          4,
          1.8200,
          '{"Colombo": 1.92, "Kandy": 1.85, "Kurunegala": 1.80}'::jsonb,
          'Covers structural, hydraulic, geotechnical, and environmental engineering.',
          ARRAY['Civil Engineer', 'Structural Consultant', 'Project Manager']
        );
      `;
      console.log("Initial seed data inserted successfully!");
    }

    console.log("Neon Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing Database:", error);
    throw error;
  }
}
