# Intteree — AI Interview Practice & Coaching Platform (MERN + Gemini API)

A full-stack web application designed for interactive technical, behavioral, HR, and system design interview practice with real-time AI evaluations powered by Google's **Gemini API** (`@google/genai` SDK).

---

## 🌟 Key Features

- **Interactive Practice Sessions**: timed question-by-question interview flow with customized target role and question count.
- **AI Feedback Engine (`@google/genai`)**: Enforces JSON response schemas for structured scoring across 5 dimensions:
  1. **Relevance** (0–10)
  2. **Clarity** (0–10)
  3. **Confidence** (0–10)
  4. **Communication** (0–10)
  5. **Overall** (0–10)
- **Comprehensive Feedback Breakdown**: bulleted strengths, weakness warnings, actionable tips, and a generated **Stronger Example Response**.
- **Progress & Weakness Analytics**: aggregated score trend visualization over time and top 5 recurring focus areas.
- **Resilient Fallback Scoring**: local heuristic fallback evaluator ensures the application runs uninterrupted even if the Gemini API key is missing or unconfigured.

---

## 🏗️ Architecture & Folder Structure

```
interview-practice-platform/
├── backend/
│   ├── config/
│   │   └── db.js                  # Mongoose MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Register, login, me, profile update
│   │   ├── questionController.js   # Question bank sampling & filter metadata
│   │   ├── interviewController.js  # Session management, AI evaluation call & complete
│   │   ├── feedbackController.js   # Feedback retrieval endpoints
│   │   └── progressController.js   # Historical score trend & weakness analytics
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT Bearer protect middleware
│   │   └── errorMiddleware.js     # 404 & centralized error handler
│   ├── models/
│   │   ├── User.js                # User schema with bcrypt password hashing
│   │   ├── Question.js            # Question bank schema with idealPoints
│   │   ├── InterviewSession.js    # Live session state & aggregated overallScore
│   │   └── Feedback.js            # 5-dimension AI score & suggestions schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── feedbackRoutes.js
│   │   └── progressRoutes.js
│   ├── services/
│   │   └── aiService.js           # Isolated Gemini API (@google/genai) integration
│   ├── utils/
│   │   └── generateToken.js       # JWT token signer
│   ├── data/
│   │   └── seedQuestions.js       # Sample question seeder script
│   ├── .env.example
│   ├── package.json
│   └── server.js                  # Express app entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios client with JWT header interceptor
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state & session restoration
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── Timer.jsx
│   │   │   ├── FeedbackCard.jsx
│   │   │   └── ProgressChart.jsx  # CSS bar chart of session score trends
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Categories.jsx
│   │   │   ├── InterviewSession.jsx
│   │   │   ├── FeedbackResult.jsx
│   │   │   └── Progress.jsx
│   │   ├── App.jsx                 # React Router v6 setup
│   │   ├── main.jsx
│   │   └── index.css              # Styling & Design system
│   ├── package.json
│   └── vite.config.js              # Dev proxy (/api -> http://localhost:5000)
├── README.md
└── package.json                    # Root setup & dev execution scripts
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local instance running at `mongodb://127.0.0.1:27017/interview_platform` (or a MongoDB Atlas URI)
- **Google Gemini API Key**: Get a free API key at [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 2. Installation
Run the root helper script to install all dependencies for both backend and frontend:

```bash
npm run setup
```

*(Alternatively: `cd backend && npm install` and `cd frontend && npm install`)*

### 3. Environment Setup
Configure `backend/.env` (copied from `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/interview_platform
JWT_SECRET=supersecret_interview_platform_jwt_key_2026
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
```

### 4. Seed the Question Bank
Seed sample questions covering Technical, Behavioral, HR, and System Design categories:

```bash
npm run seed
```

### 5. Running the Application
Start both backend and frontend development servers:

In Terminal 1 (Backend):
```bash
npm run dev:backend
```

In Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

Open your browser to `http://localhost:5173`.

---

## 🔁 End-to-End Request Flow

1. **Authentication**: User logs in or registers. JWT token stored in `localStorage` and automatically attached via Axios interceptor to API calls.
2. **Session Setup**: User configures Category (e.g. Technical / System Design), Target Role (e.g. Frontend Developer), and Question Count.
3. **Session Start**: `POST /api/interviews/start` samples random questions from MongoDB using `$sample` aggregation.
4. **Interactive Response & AI Evaluation**:
   - Timer counts candidate response duration (`mm:ss`).
   - Candidate submits answer -> `POST /api/interviews/:sessionId/answer`.
   - Backend passes question + `idealPoints` + answer to `aiService.js`.
   - `aiService.js` constructs `GoogleGenAI` instance and calls `ai.models.generateContent({...})` using response schema JSON output.
   - Structured feedback returned and stored in `Feedback` document.
5. **Session Completion**:
   - `PUT /api/interviews/:sessionId/complete` averages per-question scores into `session.overallScore` (scaled to 0-100).
6. **Analytics & Progress**:
   - `GET /api/progress` aggregates historical score trends and counts top 5 recurring weakness patterns across all sessions.

---

## 🔀 Swapping Gemini Models or AI Providers

To swap Gemini model versions (e.g. to `gemini-2.5-pro` or `gemini-1.5-pro`), update your `backend/.env`:

```env
GEMINI_MODEL=gemini-2.5-pro
```

No code modifications are necessary because `backend/services/aiService.js` dynamically reads `process.env.GEMINI_MODEL`.
