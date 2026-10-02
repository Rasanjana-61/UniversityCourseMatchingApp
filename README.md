# University Course Matching App

A full-stack university and course discovery platform that helps students find suitable degree programmes based on their A/L stream, Z-score, district, interests, and preferred study locations.

The project contains:

- **Frontend**: Expo + React Native + TypeScript application for Android, iOS, and web.
- **Backend**: Node.js + Express REST API.
- **Database**: PostgreSQL hosted with Neon and accessed through the Neon serverless driver.

## Features

### Student features

- Create an account and log in securely.
- Manage a student profile including stream, district, school, Z-score, interests, and preferred locations.
- Browse universities and courses.
- Search and filter courses by stream and keyword.
- View course details, admission requirements, degree duration, career paths, and university information.
- Match courses using:
  - A/L stream
  - Z-score
  - District-specific cutoffs
  - Interests
  - Preferred university locations
- View recommendations grouped as safe, target, reach, and challenging options.
- Compare courses and save favourite courses.
- Browse scholarship opportunities and view scholarship details.
- Complete the career and course assessment.
- Submit inquiries to administrators and view inquiry replies.
- Reset a forgotten password using an OTP sent by email.

### Teacher and administrator features

- Teacher and administrator registration and login.
- JWT-protected dashboards.
- View student statistics, Z-score ranges, stream distributions, and district distributions.
- Search and filter student profiles.
- Manage assessment questions through CRUD operations.
- Review and reply to student inquiries.
- Manage university, course, scholarship, and student-related data through the backend services.

## Technology stack

### Frontend

- React Native
- Expo SDK 57
- Expo Router
- TypeScript
- React Native Web
- Async Storage
- React Native Reanimated

### Backend

- Node.js
- Express 5
- ES modules
- CORS
- JWT authentication
- bcrypt password hashing
- Nodemailer for password-reset emails
- Neon serverless PostgreSQL client
- Prisma schema and client dependencies

## Project structure

```text
University-course-matching-app/
├── Backend/
│   ├── config/
│   │   ├── db.js                 # Neon database connection and table initialization
│   │   └── emailService.js       # OTP email service
│   ├── prisma/
│   │   └── schema.prisma         # Prisma data model
│   ├── routes/
│   │   ├── adminRoute.js
│   │   ├── authRoute.js
│   │   ├── coursesRoute.js
│   │   ├── inquiriesRoute.js
│   │   ├── matchingRoute.js
│   │   ├── scholarshipsRoute.js
│   │   ├── studentsRoute.js
│   │   ├── teachersRoute.js
│   │   └── universitiesRoute.js
│   ├── .env.example
│   ├── index.js                  # Express application entry point
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── app/                  # Expo Router routes
│   │   ├── components/           # Reusable UI components
│   │   ├── context/              # Application state
│   │   ├── screens/              # Application screens
│   │   └── services/api.ts       # Backend API client
│   ├── assets/
│   ├── app.json
│   └── package.json
│
└── README.md
```

## Prerequisites

Install the following before starting the project:

- Node.js 18 or later
- npm
- A PostgreSQL database. Neon PostgreSQL is recommended.
- Expo Go for testing on a physical mobile device, or an Android/iOS emulator.

## Backend setup

1. Open a terminal in the backend directory:

   ```bash
   cd Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create an environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows, create a file named `.env` manually and copy the values from `.env.example`.

4. Configure the database and server settings in `Backend/.env`:

   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   DIRECT_URL="postgresql://user:password@host/dbname?sslmode=require"
   PORT=5000
   ```

5. For production email delivery, add Gmail SMTP credentials or equivalent email settings:

   ```env
   EMAIL_USER="your-email@example.com"
   EMAIL_PASS="your-app-password"
   ```

   When email credentials are not configured, password-reset emails are logged in the backend console in development mode.

6. Start the backend in development mode:

   ```bash
   npm run dev
   ```

   Or start it normally:

   ```bash
   npm start
   ```

The API runs by default at `http://localhost:5000`.

When the server starts, it initializes the required PostgreSQL tables and inserts default assessment questions and sample university, course, scholarship, and inquiry data when the relevant tables are empty.

### Check the backend health

Open the following URL in a browser or API client:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "service": "University Course Matching API"
}
```

## Frontend setup

1. Open a second terminal in the frontend directory:

   ```bash
   cd Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start Expo:

   ```bash
   npm start
   ```

4. Choose a platform from the Expo terminal, or use one of these commands:

   ```bash
   npm run android
   npm run ios
   npm run web
   ```

## Frontend and backend connection

The frontend API configuration is located at:

```text
Frontend/src/services/api.ts
```

The default API URLs are:

| Platform | API URL |
| --- | --- |
| Web browser | `http://localhost:5000/api` |
| Android emulator | `http://10.0.2.2:5000/api` |
| iOS simulator | `http://localhost:5000/api` |
| Physical device with Expo Go | `http://<YOUR_COMPUTER_IP>:5000/api` |

For a physical device:

1. Connect the phone and computer to the same Wi-Fi network.
2. Find the computer's local IP address.
3. Update `LAN_API_URL` in `Frontend/src/services/api.ts`.
4. Ensure the backend is running on port `5000`.
5. Start Expo and open the application in Expo Go.

Example:

```ts
export const LAN_API_URL = "http://192.168.1.100:5000/api";
```

Replace the example IP address with the actual local IP address of the computer running the backend.

## Main API routes

All routes are prefixed with `/api`.

| Module | Base route | Purpose |
| --- | --- | --- |
| Health | `/health` | Check whether the API is running |
| Authentication | `/auth` | Student registration, login, profile verification, and password reset |
| Universities | `/universities` | List and view universities |
| Courses | `/courses` | List courses, search courses, and view admission details |
| Students | `/students` | Create, update, view, and delete student profiles; save courses |
| Matching | `/match` | Generate course recommendations using student results and preferences |
| Scholarships | `/scholarships` | Browse and view scholarship opportunities |
| Teachers | `/teachers` | Teacher registration, login, dashboard, and student data |
| Administration | `/admin` | Admin authentication, dashboard, student data, and assessment questions |
| Inquiries | `/inquiries` | Submit and manage student support inquiries |

### Course matching example

Send a `POST` request to `/api/match` with a body similar to:

```json
{
  "stream": "Physical Science",
  "zScore": 1.75,
  "district": "Colombo",
  "interests": ["Artificial Intelligence", "Robotics"],
  "preferredLocations": ["Colombo", "Kandy"]
}
```

The response includes the top recommendations, eligible courses, reach courses, other courses, match scores, district cutoffs, and match status.

## Database

The backend uses Neon PostgreSQL through `@neondatabase/serverless`.

Database initialization is handled in:

```text
Backend/config/db.js
```

The initialization process creates or updates tables for:

- Universities
- Courses
- Student profiles
- Password resets
- Scholarships
- Teachers and administrators
- Assessment questions
- Student inquiries

The Prisma model definition is available in:

```text
Backend/prisma/schema.prisma
```

The current Express startup flow uses the SQL initialization logic in `Backend/config/db.js`, so make sure `DATABASE_URL` is configured before starting the backend.

## Authentication and security

- Student passwords are hashed with bcrypt.
- Student, teacher, and administrator sessions use JWT tokens.
- Protected requests send the token using the `Authorization` header:

  ```text
  Authorization: Bearer <token>
  ```

- Do not commit `.env` files, database credentials, JWT secrets, email passwords, or other private keys.
- For deployment, set strong values for the JWT secrets instead of relying on development fallbacks.

Recommended production environment variables include:

```env
DATABASE_URL="your-neon-database-url"
DIRECT_URL="your-direct-database-url"
PORT=5000
JWT_SECRET="replace-with-a-long-random-secret"
ADMIN_JWT_SECRET="replace-with-a-long-random-secret"
TEACHER_JWT_SECRET="replace-with-a-long-random-secret"
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-app-password"
NODE_ENV="production"
```

## Useful commands

### Backend

```bash
cd Backend
npm install       # Install backend dependencies
npm run dev       # Start with Nodemon
npm start         # Start normally
npm run check-db  # Check database connectivity
```

### Frontend

```bash
cd Frontend
npm install          # Install frontend dependencies
npm start            # Start Expo
npm run android      # Open Android target
npm run ios          # Open iOS target
npm run web          # Open web target
npm run lint         # Run Expo linting
```

## Troubleshooting

### The frontend cannot connect to the backend

- Confirm that the backend is running on port `5000`.
- Test `http://localhost:5000/api/health`.
- Use `10.0.2.2` for an Android emulator instead of `localhost`.
- For Expo Go, use the computer's LAN IP address and connect both devices to the same Wi-Fi network.
- Check that the computer firewall allows connections to port `5000`.

### The backend cannot connect to the database

- Confirm that `DATABASE_URL` is present in `Backend/.env`.
- Check that the Neon database is active and accessible.
- Verify that the connection string includes the required SSL configuration.
- Run:

  ```bash
  cd Backend
  npm run check-db
  ```

### Password reset emails are not delivered

- Configure `EMAIL_USER` and `EMAIL_PASS`.
- For Gmail, use an App Password rather than a normal account password.
- In development without email credentials, check the backend console for the generated OTP.

## Development notes

- The backend enables CORS for frontend development.
- The API includes request logging, a health-check route, a JSON 404 response, and centralized error handling.
- Course recommendations are calculated using the student's Z-score compared with the relevant district cutoff, then adjusted using interest and location matches.
- Seed data is intended for development and demonstration. Review and replace it before production deployment.

## License

The frontend includes an MIT license file. Review the project licensing requirements before distributing the complete application.
