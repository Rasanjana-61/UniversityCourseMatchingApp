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
        admission_requirements JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure columns exist on courses if table was created previously
    await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS admission_requirements JSONB DEFAULT '{}'::jsonb;`;

    // 3. Student Profiles Table
    await sql`
      CREATE TABLE IF NOT EXISTS student_profiles (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        school VARCHAR(255) DEFAULT '',
        stream VARCHAR(100) DEFAULT 'Physical Science',
        al_year VARCHAR(50) DEFAULT '2025',
        subjects JSONB DEFAULT '[]'::jsonb,
        z_score DECIMAL(5, 4) DEFAULT 0.0000,
        district VARCHAR(100) DEFAULT 'Colombo',
        interests TEXT[] DEFAULT ARRAY[]::TEXT[],
        preferred_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
        saved_course_ids INT[] DEFAULT ARRAY[]::INT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure columns exist if table was already created earlier
    await sql`ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS password VARCHAR(255);`;
    await sql`ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS school VARCHAR(255) DEFAULT '';`;
    await sql`ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS al_year VARCHAR(50) DEFAULT '2025';`;
    await sql`ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '[]'::jsonb;`;
    await sql`ALTER TABLE student_profiles ALTER COLUMN stream DROP NOT NULL;`;
    await sql`ALTER TABLE student_profiles ALTER COLUMN z_score DROP NOT NULL;`;
    await sql`ALTER TABLE student_profiles ALTER COLUMN district DROP NOT NULL;`;

    // 4. Password Resets Table
    await sql`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Scholarships Table
    await sql`
      CREATE TABLE IF NOT EXISTS scholarships (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL, -- 'University', 'Merit', 'Need-based', 'Corporate'
        provider VARCHAR(255) NOT NULL,
        eligibility TEXT NOT NULL,
        value VARCHAR(255) NOT NULL,
        deadline VARCHAR(100) NOT NULL,
        status VARCHAR(50) DEFAULT 'Open',
        description TEXT,
        benefits TEXT,
        requirements TEXT,
        application_instructions TEXT,
        official_source_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 6. Admin / Teachers Table
    await sql`
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        school VARCHAR(255) DEFAULT '',
        subject VARCHAR(255) DEFAULT '',
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 7. Assessment Questions Table (Managed via Admin Panel CRUD)
    await sql`
      CREATE TABLE IF NOT EXISTS assessment_questions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        category VARCHAR(100) NOT NULL, -- Technology, Business, Creative, Social
        sort_order INT DEFAULT 1,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Seed default 10 assessment questions if empty
    const questionCount = await sql`SELECT COUNT(*)::int as count FROM assessment_questions`;
    if (questionCount[0].count === 0) {
      await sql`
        INSERT INTO assessment_questions (text, category, sort_order)
        VALUES
        ('I enjoy solving problems using technology.', 'Technology', 1),
        ('I like taking leadership roles and organizing people.', 'Business', 2),
        ('I enjoy expressing my ideas through art, writing, or design.', 'Creative', 3),
        ('I feel fulfilled when I help others learn or solve personal problems.', 'Social', 4),
        ('I find coding or learning how computer systems work fascinating.', 'Technology', 5),
        ('I am interested in how businesses make money and grow.', 'Business', 6),
        ('I often come up with original and out-of-the-box ideas.', 'Creative', 7),
        ('I enjoy working in teams and collaborating with others.', 'Social', 8),
        ('I like analyzing data and numbers to find trends.', 'Technology', 9),
        ('I would like a career where I negotiate and pitch ideas.', 'Business', 10);
      `;
      console.log("Seeded default 10 assessment questions successfully!");
    }

    // Seed sample scholarships if table is empty
    const scholarshipCount = await sql`SELECT COUNT(*)::int as count FROM scholarships`;
    if (scholarshipCount[0].count === 0) {
      await sql`
        INSERT INTO scholarships (title, category, provider, eligibility, value, deadline, status, description, benefits, requirements, application_instructions, official_source_url)
        VALUES
        (
          'University Scholarship',
          'University',
          'University of Colombo',
          'A/L 3.0 GPA, Sri Lankan citizen',
          'Full tuition waiver + LKR 50,000 stipend',
          '30 Sep 2026',
          'Open',
          'A merit-based scholarship for Sri Lankan A/L students joining undergraduate programmes with strong academic performance.',
          'Tuition support • Monthly allowance',
          'Academic transcripts, proof of family income and a personal statement are required.',
          'Submit application through the University of Colombo Faculty Dean office.',
          'https://cmb.ac.lk/scholarships'
        ),
        (
          'Merit Scholarship',
          'Merit',
          'National Merit Fund',
          'A/L 3.5 GPA, top 10% in district',
          'LKR 150,000 annual stipend',
          '15 Oct 2026',
          'Open',
          'Recognizing highest achievers in G.C.E. Advanced Level across all 25 administrative districts.',
          'Direct grant of LKR 150,000 per year • Laptop subsidy scheme',
          'Results verification sheet and personal statement',
          'Shortlisted students will be invited for a panel interview after the initial application review.',
          'https://mohe.gov.lk/merit-scholarships'
        ),
        (
          'Financial Support',
          'Need-based',
          'Ministry of Higher Education',
          'Low-income family, A/L pass',
          'Monthly allowance + exam fee support',
          'Open now',
          'Open',
          'Mahapola Higher Education Scholarship Scheme & Bursary grants for qualified state university undergraduates.',
          'Mahapola Merit / Ordinary stipend up to LKR 5,000/month • Free hostel allocation priority',
          'Grama Niladhari income certificate certified by Divisional Secretariat.',
          'Priority is given to students from rural districts and families with demonstrated financial need.',
          'https://mahapola.gov.lk'
        ),
        (
          'Dialog Axiata Merit Grant',
          'Corporate',
          'Dialog Axiata PLC',
          'Top district ranks in Maths & Bio Science streams',
          'LKR 250,000 per year + Internship',
          '30 Nov 2026',
          'Open',
          'Industry scholarship supporting bright undergraduates in STEM, Computing and Telecommunications.',
          'Annual grant • Industry mentorship • Fast-track internship opportunities',
          'G.C.E. A/L result sheet with district rank proof',
          'Apply online via the Dialog Sustainability education portal.',
          'https://dialog.lk/sustainability'
        );
      `;
    }

    // Seed sample Universities & Courses if count is low
    const universityCount = await sql`SELECT COUNT(*)::int as count FROM universities`;
    const courseCount = await sql`SELECT COUNT(*)::int as count FROM courses`;

    if (universityCount[0].count === 0 || courseCount[0].count < 10) {
      console.log("Seeding comprehensive Universities and Courses data for Sri Lanka...");

      // Universities
      const [uom] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES ('University of Moratuwa', 'UOM', 'Katubedda, Moratuwa', 'Colombo', 'Leading technological university in Sri Lanka renowned for Engineering, IT, Architecture, and Quantity Surveying.', 'https://uom.lk')
        ON CONFLICT (short_name) DO UPDATE SET name = EXCLUDED.name RETURNING id;
      `;

      const [uoc] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES ('University of Colombo', 'UOC', 'Colombo 03', 'Colombo', 'Premier university in Sri Lanka offering world-class faculties in Medicine, Science, Computing (UCSC), Law, Arts, and Management.', 'https://cmb.ac.lk')
        ON CONFLICT (short_name) DO UPDATE SET name = EXCLUDED.name RETURNING id;
      `;

      const [uop] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES ('University of Peradeniya', 'UOP', 'Peradeniya, Kandy', 'Kandy', 'Largest university set amidst scenic hills offering Medicine, Dental Surgery, Veterinary Science, Engineering, Agriculture, Science, and Arts.', 'https://pdn.ac.lk')
        ON CONFLICT (short_name) DO UPDATE SET name = EXCLUDED.name RETURNING id;
      `;

      const [usj] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES ('University of Sri Jayewardenepura', 'USJ', 'Nugegoda, Gangodawila', 'Colombo', 'Famous for pioneering Management Studies & Commerce, Medical Sciences, Technology, Applied Sciences, and Engineering.', 'https://sjp.ac.lk')
        ON CONFLICT (short_name) DO UPDATE SET name = EXCLUDED.name RETURNING id;
      `;

      const [uok] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES ('University of Kelaniya', 'UOK', 'Dalugama, Kelaniya', 'Gampaha', 'Renowned for Commerce & Management, Medicine, Computing & Technology, Science, and Humanities.', 'https://kln.ac.lk')
        ON CONFLICT (short_name) DO UPDATE SET name = EXCLUDED.name RETURNING id;
      `;

      const [uor] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES ('University of Ruhuna', 'UOR', 'Wellamadama, Matara', 'Matara', 'Southern Sri Lanka educational hub with faculties in Engineering (Galle), Medicine (Karapitiya), Agriculture, Technology, and Science.', 'https://ruh.ac.lk')
        ON CONFLICT (short_name) DO UPDATE SET name = EXCLUDED.name RETURNING id;
      `;

      const [uoj] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES ('University of Jaffna', 'UOJ', 'Thirunelvely, Jaffna', 'Jaffna', 'Northern center of excellence with faculties of Medicine, Engineering (Kilinochchi), Technology, Science, and Arts.', 'https://univ.jfn.ac.lk')
        ON CONFLICT (short_name) DO UPDATE SET name = EXCLUDED.name RETURNING id;
      `;

      const [uwu] = await sql`
        INSERT INTO universities (name, short_name, location, district, description, website)
        VALUES ('Uva Wellassa University', 'UWU', 'Passara Road, Badulla', 'Badulla', 'Entrepreneurial university specializing in Technology, Science & Technology, Animal Science, and Value Addition.', 'https://uwu.ac.lk')
        ON CONFLICT (short_name) DO UPDATE SET name = EXCLUDED.name RETURNING id;
      `;

      // Insert / Update Courses across all Streams
      await sql`
        INSERT INTO courses (university_id, name, code, stream, degree_type, duration_years, min_z_score, district_cutoffs, description, career_paths)
        VALUES 
        -- Physical Science (Maths)
        (
          ${uom.id}, 'Engineering (Physical Science)', 'ENG-UOM', 'Physical Science', 'BSc (Hons) in Engineering', 4, 1.9200,
          '{"Colombo": 2.05, "Gampaha": 1.98, "Kandy": 1.95, "Galle": 1.92, "Kurunegala": 1.94, "Kalutara": 1.96}'::jsonb,
          'Covers Electronic, Computer Science, Mechanical, Civil, Chemical, Biomedical and Electrical Engineering disciplines.',
          ARRAY['Software Engineer', 'Civil Engineer', 'Electrical Engineer', 'Robotics Specialist']
        ),
        (
          ${uom.id}, 'Information Technology (IT)', 'IT-UOM', 'Physical Science', 'BSc (Hons) in Information Technology', 4, 1.6500,
          '{"Colombo": 1.78, "Gampaha": 1.72, "Kandy": 1.68, "Galle": 1.65, "Kurunegala": 1.69}'::jsonb,
          'Specialized program for software systems, cloud computing, cyber security, and enterprise solutions.',
          ARRAY['Full Stack Developer', 'Cloud Engineer', 'DevOps Specialist', 'System Analyst']
        ),
        (
          ${uom.id}, 'Quantity Surveying', 'QS-UOM', 'Physical Science', 'BSc (Hons) in Quantity Surveying', 4, 1.7200,
          '{"Colombo": 1.82, "Gampaha": 1.78, "Kandy": 1.74, "Galle": 1.72}'::jsonb,
          'Premier international quantity surveying program with RICS accreditation.',
          ARRAY['Quantity Surveyor', 'Cost Consultant', 'Project Manager', 'Contract Administrator']
        ),
        (
          ${uoc.id}, 'Computer Science (UCSC)', 'CS-UCSC', 'Physical Science', 'BSc (Hons) in Computer Science', 4, 1.7500,
          '{"Colombo": 1.88, "Gampaha": 1.82, "Kandy": 1.79, "Galle": 1.76, "Kurunegala": 1.80}'::jsonb,
          'Offered by University of Colombo School of Computing (UCSC) focusing on algorithms, AI, and systems.',
          ARRAY['AI Engineer', 'Data Scientist', 'Software Architect', 'Researcher']
        ),
        (
          ${uop.id}, 'Engineering (Peradeniya)', 'ENG-UOP', 'Physical Science', 'BSc (Hons) in Engineering', 4, 1.8400,
          '{"Colombo": 1.94, "Kandy": 1.87, "Galle": 1.85, "Kurunegala": 1.88, "Matara": 1.84}'::jsonb,
          'Oldest and prestigious engineering faculty in Sri Lanka with full IESL accreditation.',
          ARRAY['Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Manufacturing Engineer']
        ),
        (
          ${usj.id}, 'Software Engineering', 'SE-USJ', 'Physical Science', 'BSc (Hons) in Software Engineering', 4, 1.6800,
          '{"Colombo": 1.79, "Gampaha": 1.74, "Kandy": 1.70, "Kalutara": 1.72}'::jsonb,
          'Faculty of Applied Sciences program for modern software architectures, mobile apps, and distributed systems.',
          ARRAY['Software Engineer', 'Mobile Developer', 'QA Lead', 'Product Architect']
        ),

        -- Biological Science (Bio)
        (
          ${uoc.id}, 'Medicine (MBBS - Colombo)', 'MED-UOC', 'Biological Science', 'Bachelor of Medicine, Bachelor of Surgery', 5, 2.1000,
          '{"Colombo": 2.25, "Gampaha": 2.18, "Kandy": 2.15, "Galle": 2.12, "Kurunegala": 2.14, "Kalutara": 2.16}'::jsonb,
          'Premier medical degree with clinical training at National Hospital of Sri Lanka.',
          ARRAY['Medical Doctor', 'Surgeon', 'Consultant Physician', 'Medical Researcher']
        ),
        (
          ${uop.id}, 'Dental Surgery (BDS)', 'DS-UOP', 'Biological Science', 'Bachelor of Dental Surgery', 5, 1.8800,
          '{"Colombo": 1.95, "Kandy": 1.89, "Galle": 1.85, "Kurunegala": 1.88}'::jsonb,
          'The only dental faculty in Sri Lanka producing qualified dental surgeons with world-class clinical facilities.',
          ARRAY['Dental Surgeon', 'Orthodontist', 'Maxillofacial Surgeon']
        ),
        (
          ${usj.id}, 'Medicine (MBBS - USJ)', 'MED-USJ', 'Biological Science', 'Bachelor of Medicine, Bachelor of Surgery', 5, 2.0500,
          '{"Colombo": 2.18, "Gampaha": 2.12, "Kandy": 2.08, "Kalutara": 2.10}'::jsonb,
          'Top clinical medical training at Colombo South Teaching Hospital (Kalubowila) and Sri Jayewardenepura General Hospital.',
          ARRAY['Medical Doctor', 'Cardiologist', 'Paediatrician', 'Radiologist']
        ),
        (
          ${uop.id}, 'Veterinary Science (BVSc)', 'VET-UOP', 'Biological Science', 'Bachelor of Veterinary Science', 5, 1.7500,
          '{"Colombo": 1.82, "Kandy": 1.76, "Galle": 1.73, "Kurunegala": 1.75}'::jsonb,
          'National veterinary medicine program for animal health, pathology, surgery, and livestock production.',
          ARRAY['Veterinary Doctor', 'Animal Health Specialist', 'Livestock Consultant']
        ),
        (
          ${uok.id}, 'Pharmacy (B.Pharm)', 'PHARM-UOK', 'Biological Science', 'Bachelor of Pharmacy (Hons)', 4, 1.6200,
          '{"Colombo": 1.72, "Gampaha": 1.66, "Kandy": 1.63, "Galle": 1.60}'::jsonb,
          'Faculty of Medicine program covering pharmacology, clinical pharmacy, and drug manufacturing.',
          ARRAY['Clinical Pharmacist', 'Pharmaceutical Scientist', 'Regulatory Specialist']
        ),

        -- Commerce Stream
        (
          ${usj.id}, 'Business Administration / Management', 'BBA-USJ', 'Commerce', 'BSc (Hons) in Business Administration', 4, 1.7000,
          '{"Colombo": 1.82, "Gampaha": 1.76, "Kandy": 1.72, "Galle": 1.69, "Kurunegala": 1.73}'::jsonb,
          'Sri Lanka flagship management faculty with specialized pillars in marketing, finance, HR, and operations.',
          ARRAY['Business Manager', 'Corporate Strategist', 'Marketing Director', 'Entrepreneur']
        ),
        (
          ${usj.id}, 'Accounting & Finance', 'ACC-USJ', 'Commerce', 'BSc (Hons) in Accounting', 4, 1.8000,
          '{"Colombo": 1.92, "Gampaha": 1.86, "Kandy": 1.82, "Galle": 1.79}'::jsonb,
          'Leading accounting program in South Asia offering exemptions for CA, CIMA, and ACCA qualifications.',
          ARRAY['Chartered Accountant', 'Financial Controller', 'Investment Banker', 'Auditor']
        ),
        (
          ${uoc.id}, 'Finance & Business Economics', 'FIN-UOC', 'Commerce', 'BBA (Hons) in Finance', 4, 1.7400,
          '{"Colombo": 1.85, "Gampaha": 1.79, "Kandy": 1.75, "Kalutara": 1.77}'::jsonb,
          'Faculty of Management & Finance program focusing on equity markets, banking, and financial economics.',
          ARRAY['Financial Analyst', 'Portfolio Manager', 'Banking Specialist', 'Risk Consultant']
        ),
        (
          ${uok.id}, 'Human Resource Management', 'HRM-UOK', 'Commerce', 'BSc (Hons) in Human Resource Management', 4, 1.5800,
          '{"Colombo": 1.69, "Gampaha": 1.63, "Kandy": 1.60, "Kurunegala": 1.61}'::jsonb,
          'Comprehensive HR leadership, talent acquisition, organizational psychology, and labor law.',
          ARRAY['HR Manager', 'Talent Specialist', 'Corporate Trainer', 'HR Consultant']
        ),

        -- Arts Stream
        (
          ${uoc.id}, 'Law (LLB)', 'LAW-UOC', 'Arts', 'Bachelor of Laws (LLB)', 4, 1.8500,
          '{"Colombo": 1.98, "Gampaha": 1.91, "Kandy": 1.88, "Galle": 1.84, "Kurunegala": 1.89}'::jsonb,
          'Premier faculty of law producing attorneys-at-law, judges, legal counsel, and diplomats.',
          ARRAY['Attorney-at-Law', 'Legal Advisor', 'Judge / Magistrate', 'Diplomat']
        ),
        (
          ${uok.id}, 'Mass Communication & Media', 'MASS-UOK', 'Arts', 'BA (Hons) in Mass Communication', 4, 1.4500,
          '{"Colombo": 1.58, "Gampaha": 1.52, "Kandy": 1.48, "Kurunegala": 1.49}'::jsonb,
          'Covers digital journalism, television & radio production, advertising, and public relations.',
          ARRAY['Journalist', 'Media Producer', 'PR Manager', 'Content Creator']
        ),
        (
          ${uop.id}, 'Economics & Social Statistics', 'ECON-UOP', 'Arts', 'BA (Hons) in Economics', 4, 1.5200,
          '{"Colombo": 1.64, "Kandy": 1.57, "Galle": 1.53, "Kurunegala": 1.55}'::jsonb,
          'Macroeconomics, econometric modeling, policy analysis, and central banking.',
          ARRAY['Economic Analyst', 'Policy Researcher', 'Data Analyst', 'Central Banker']
        ),
        (
          ${usj.id}, 'English & Linguistics', 'ENG-USJ', 'Arts', 'BA (Hons) in English', 4, 1.4800,
          '{"Colombo": 1.60, "Gampaha": 1.54, "Kandy": 1.50, "Kalutara": 1.52}'::jsonb,
          'English literature, applied linguistics, translation studies, and international communication.',
          ARRAY['Lecturer', 'Editor / Author', 'Translator', 'Corporate Communications Lead']
        ),

        -- Technology Stream
        (
          ${usj.id}, 'Engineering Technology (BET)', 'BET-USJ', 'Technology', 'Bachelor of Engineering Technology (Hons)', 4, 1.6000,
          '{"Colombo": 1.72, "Gampaha": 1.66, "Kandy": 1.62, "Galle": 1.58, "Kurunegala": 1.63}'::jsonb,
          'Faculty of Technology program in Mechanical, Mechatronics, Energy, and Civil Technology.',
          ARRAY['Engineering Technologist', 'Mechatronics Engineer', 'Automation Lead', 'Plant Manager']
        ),
        (
          ${uok.id}, 'Information & Communication Tech (BICT)', 'BICT-UOK', 'Technology', 'Bachelor of Information & Communication Tech (Hons)', 4, 1.5200,
          '{"Colombo": 1.64, "Gampaha": 1.58, "Kandy": 1.55, "Kurunegala": 1.56}'::jsonb,
          'Applied software systems, network engineering, cyber defense, and mobile technologies.',
          ARRAY['Network Engineer', 'Cyber Security Analyst', 'DevOps Specialist', 'Software Developer']
        ),
        (
          ${uwu.id}, 'Biosystems Technology (BBST)', 'BST-UWU', 'Technology', 'Bachelor of Biosystems Technology (Hons)', 4, 1.4000,
          '{"Colombo": 1.52, "Badulla": 1.41, "Kandy": 1.44, "Kurunegala": 1.45, "Galle": 1.42}'::jsonb,
          'Food processing technology, bioprocess engineering, agricultural automation, and green bio-products.',
          ARRAY['Bioprocess Specialist', 'Food Quality Manager', 'Agricultural Technologist', 'QA Officer']
        ),
        (
          ${uor.id}, 'Information & Communication Tech (BICT)', 'BICT-UOR', 'Technology', 'Bachelor of Information & Communication Tech (Hons)', 4, 1.4600,
          '{"Colombo": 1.57, "Matara": 1.47, "Galle": 1.48, "Kandy": 1.49, "Kurunegala": 1.50}'::jsonb,
          'Faculty of Technology (Kamburupitiya) program specializing in enterprise IT & embedded systems.',
          ARRAY['IT Consultant', 'Software Engineer', 'System Administrator']
        );
      `;

      console.log("Comprehensive Sri Lanka Universities and Courses seed data inserted successfully!");
    }

    console.log("Neon Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing Database:", error);
    throw error;
  }
}
