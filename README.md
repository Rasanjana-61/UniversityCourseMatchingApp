![Career Match Banner](./assets/banner.png)

# 🎓 Career Match — University Course Matching App

**Career Match** is a comprehensive platform designed to help Sri Lankan Advanced Level (A/L) students find the right university courses based on their Z-Scores, streams, and district quotas. It also provides career guidance, scholarships, and a direct inquiry portal.

---

## ✨ Key Features
- **🎯 Smart Course Matching:** Enter your Z-Score and district to instantly see eligible university courses.
- **🏛️ University Explorer:** View detailed profiles of Sri Lankan universities and their faculties.
- **💼 Career Guidance:** Explore career paths linked to specific degree programs.
- **🎓 Scholarships Hub:** Discover and apply for financial aid and scholarships.
- **💬 Student Inquiries:** Direct chat/inquiry system to get answers from administrators.
- **🔔 Real-time Notifications:** Stay updated with deadlines, news, and personal replies.

---

## 🛠️ Technology Stack
- **Frontend:** React Native (Expo), TypeScript, Expo Router
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (Neon Serverless DB)

---

## 🚀 Getting Started (How to Run the App)

Follow these instructions to run both the **Backend** and **Frontend** locally on your machine.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Expo Go app](https://expo.dev/client) installed on your iOS or Android phone (optional, for testing on a real device).

### 1️⃣ Setup and Run the Backend Server

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Set up the Environment Variables:
   - Create a `.env` file inside the `Backend` directory.
   - Add your Neon PostgreSQL database connection string and JWT secret:
     ```env
     DATABASE_URL=postgres://<username>:<password>@<host>/<database>?sslmode=require
     JWT_SECRET=your_secret_key_here
     ADMIN_JWT_SECRET=your_admin_secret_key_here
     ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:5000`.*

### 2️⃣ Setup and Run the Frontend (Expo App)

1. Open a **new terminal window** and navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Update the API Base URL (If testing on a physical device):
   - By default, the app looks for the backend at `http://localhost:5000` or `http://10.0.2.2:5000` (for Android emulators). 
   - If you are testing on your physical phone, update the `getApiUrl()` function in `Frontend/src/services/api.ts` to use your computer's local Wi-Fi IP address (e.g., `http://192.168.x.x:5000`).
4. Start the Expo development server:
   ```bash
   npx expo start --clear
   ```
5. **Run the App:**
   - **On Android Emulator:** Press `a` in the terminal.
   - **On iOS Simulator:** Press `i` in the terminal.
   - **On Physical Device:** Scan the QR code shown in the terminal using the **Expo Go** app on your phone.

---

## 👨‍💻 Contributing
Feel free to fork this project and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the MIT License.
