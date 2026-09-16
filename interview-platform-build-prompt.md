# Build Prompt: Interview Practice Platform with AI Feedback (MERN + Gemini)

Copy everything below into your AI tool of choice.

---

Build a full-stack **Interview Practice Platform with AI Feedback** using the MERN stack (MongoDB, Express, React, Node.js) with Google's Gemini API for AI-generated feedback. Create a complete, working project with the folder structure, all backend and frontend files, and a README — not just a description.

## Concept

Users register, pick an interview category (Technical, Behavioral, HR, System Design, or Mixed) and optional target role, then go through a timed session of 5 questions pulled from a MongoDB question bank. For each question they type an answer; the backend sends the question + answer to Gemini, which returns structured JSON feedback (scores for relevance, clarity, confidence, communication, and overall out of 10, plus strengths, weaknesses, suggestions, and a stronger example answer). At the end of the session, per-question scores are averaged into an overall session score (0–100). A Progress page aggregates all completed sessions into a score trend over time and the most frequently recurring weaknesses.

## Tech stack

- **Frontend:** React 18 with Vite, React Router v6, Axios
- **Backend:** Node.js + Express (ESM / `"type": "module"`)
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (jsonwebtoken) + bcryptjs for password hashing
- **AI:** Google Gemini API via the **`@google/genai`** npm package (current official SDK — do NOT use the deprecated `@google/generative-ai` package, which Google retired; support ended November 2025). Default model: `gemini-2.5-flash`, read from an env var `GEMINI_MODEL` so it can be swapped without code changes.

## Folder structure

```
interview-practice-platform/
├── backend/
│   ├── config/
│   │   └── db.js                  # Mongoose connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── questionController.js
│   │   ├── interviewController.js
│   │   ├── feedbackController.js
│   │   └── progressController.js
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT "protect" middleware
│   │   └── errorMiddleware.js     # notFound + errorHandler
│   ├── models/
│   │   ├── User.js
│   │   ├── Question.js
│   │   ├── InterviewSession.js
│   │   └── Feedback.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── feedbackRoutes.js
│   │   └── progressRoutes.js
│   ├── services/
│   │   └── aiService.js           # All Gemini calls isolated here
│   ├── utils/
│   │   └── generateToken.js
│   ├── data/
│   │   └── seedQuestions.js       # Seeds ~10 sample questions
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance, injects JWT from localStorage
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # login/register/logout, current user state
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   ├── Timer.jsx
│   │   │   ├── FeedbackCard.jsx
│   │   │   └── ProgressChart.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Categories.jsx      # session setup: category/role/# questions
│   │   │   ├── InterviewSession.jsx # one question at a time, timer, answer, feedback
│   │   │   ├── FeedbackResult.jsx  # full session breakdown after completion
│   │   │   └── Progress.jsx        # score trend + recurring weaknesses
│   │   ├── App.jsx                 # React Router routes
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js              # dev proxy: /api -> http://localhost:5000
├── README.md
└── package.json                    # root helper script only
```

## Data models (Mongoose schemas)

**User**: name, email (unique), password (hashed via bcrypt pre-save hook), targetRole, experienceLevel (enum: Student/Entry-level/Mid-level/Senior). Method `matchPassword(entered)`.

**Question**: text, category (enum: Technical/Behavioral/HR/System Design), role (string, default "General"), difficulty (enum: Easy/Medium/Hard), idealPoints (array of strings — key points a strong answer should hit, passed to the AI grader), tags (array of strings).

**InterviewSession**: user (ref User), category (enum includes "Mixed"), role, status (enum: in-progress/completed/abandoned), answers (array of {question ref, userAnswer, responseTimeSeconds, feedback ref}), overallScore (0–100), startedAt, completedAt.

**Feedback**: session ref, question ref, user ref, scores {relevance, clarity, confidence, communication, overall — each 0–10}, strengths (array), weaknesses (array), suggestions (array), improvedAnswerExample (string), rawModelOutput (string, for debugging).

## API endpoints

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` (protected), `PUT /api/auth/me` (protected)
- `GET /api/questions?category=&role=&difficulty=&limit=` — random sample via `$sample` aggregation
- `GET /api/questions/meta/filters` — distinct categories/roles for UI dropdowns
- `POST /api/interviews/start` (protected) — body `{category, role, numQuestions}`, samples questions, creates session
- `GET /api/interviews` (protected) — user's session history
- `GET /api/interviews/:sessionId` (protected) — populated session with questions + feedback
- `POST /api/interviews/:sessionId/answer` (protected) — body `{questionId, userAnswer, responseTimeSeconds}`, calls AI service, saves Feedback, returns it
- `PUT /api/interviews/:sessionId/complete` (protected) — averages feedback.scores.overall across answered questions into session.overallScore (×10 to scale to 100), marks completed
- `GET /api/feedback` and `GET /api/feedback/:id` (protected)
- `GET /api/progress` (protected) — returns totalSessions, scoreTrend (array of {sessionId, date, category, overallScore}), avgScores (per dimension), recurringWeaknesses (top 5 most-frequent weakness strings with counts)

## AI service requirements (critical — this is the core feature)

Create `backend/services/aiService.js` that exports `generateFeedback(question, userAnswer)`:

1. Import from `@google/genai`: `import { GoogleGenAI, Type } from "@google/genai";`
2. Lazily construct the client: `new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })`. Throw a clear error if the key is missing/placeholder so the failure path is obvious.
3. Define a `responseSchema` using `Type.OBJECT` / `Type.ARRAY` / `Type.STRING` / `Type.INTEGER` that forces this exact JSON shape:
   ```
   {
     "scores": { "relevance": int, "clarity": int, "confidence": int, "communication": int, "overall": int },  // each 0-10
     "strengths": [string],
     "weaknesses": [string],
     "suggestions": [string],
     "improvedAnswerExample": string
   }
   ```
4. Build a prompt including: interview category, target role, difficulty, the question text, the question's `idealPoints` (key points a strong answer should cover), and the candidate's answer.
5. Call the model like this:
   ```js
   const response = await client.models.generateContent({
     model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
     contents: prompt,
     config: {
       systemInstruction: "You are an expert interview coach...",
       temperature: 0.4,
       responseMimeType: "application/json",
       responseSchema: feedbackSchema,
     },
   });
   const raw = response.text; // note: .text is a property, not a method, on this SDK
   ```
6. Parse `raw` as JSON, return `{ ...parsed, rawModelOutput: raw }`.
7. Wrap the whole thing in try/catch. On any failure (missing key, rate limit, network error, bad JSON), `console.error` the actual error message with a clear `[aiService]` prefix, and fall back to a simple heuristic scorer based on answer word count — so the app still works end-to-end even if Gemini is briefly unavailable. Never let a fallback fail silently; always log why.

**Important gotcha to avoid:** Do NOT use the `@google/generative-ai` package or the `genAI.getGenerativeModel({...}).generateContent(...)` pattern — that's the deprecated SDK and commonly causes silent failures that make it look like "AI isn't working" when really every call is erroring and hitting a fallback. Use `@google/genai` with `client.models.generateContent({...})` as shown above. Verify the actual latest version on npm before pinning it in package.json rather than guessing a version number.

## Frontend behavior details

- `AuthContext` stores JWT in `localStorage`, attaches it via an Axios request interceptor, and fetches `/api/auth/me` on load to restore the session.
- `ProtectedRoute` redirects to `/login` if not authenticated.
- `Categories` page: chip-style buttons for category, a role dropdown populated from `/api/questions/meta/filters`, a number input for question count (1–10), "Start Interview" button calling `/api/interviews/start` and navigating to `/session/:sessionId` with the questions passed via router state.
- `InterviewSession` page: shows one question at a time with a running `mm:ss` timer, a textarea for the answer, "Submit Answer" (disabled while empty/submitting) which calls `/api/interviews/:sessionId/answer` and displays the returned `FeedbackCard`, then "Next Question" / "Finish Interview" on the last question which calls `/api/interviews/:sessionId/complete` and navigates to `/feedback/:sessionId`.
- `FeedbackCard` component: renders score pills for each of the 5 dimensions, bulleted strengths/weaknesses/suggestions, and the improved example answer in a highlighted box.
- `FeedbackResult` page: shows overall session score, then every question with the user's answer and its FeedbackCard, "Practice Again" / "Back to Dashboard" buttons.
- `Progress` page: bar chart (`ProgressChart` component, plain CSS/div-based, no chart library needed) of score trend across completed sessions, average scores grid, and a list of recurring weaknesses with mention counts.
- `Dashboard`: quick stats (total sessions, avg overall score, # recurring weak areas), CTA buttons, recent session list.
- Clean, minimal CSS (no Tailwind needed) — indigo primary color (`#4f46e5`), card-based layout, rounded corners, light gray background.

## Environment variables (`backend/.env.example`)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/interview_platform
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
```

## Seed data

Include `backend/data/seedQuestions.js`, a standalone script (run via `npm run seed`) that connects to MongoDB, clears the Question collection, and inserts ~10 sample questions spanning all four categories and a couple of roles (e.g. Frontend Developer, Backend Developer), each with realistic `idealPoints`.

## Deliverables

1. Full folder structure as above, every file actually created (not stubbed).
2. `backend/package.json` with correct, currently-published dependency versions — check npm for the real latest version of `@google/genai` rather than assuming one.
3. `frontend/package.json` with Vite + React + React Router + Axios.
4. A `README.md` explaining setup (get a free Gemini key at https://aistudio.google.com/apikey, `npm install` in both folders, `.env` setup, `npm run seed`, `npm run dev` in both), the request flow end to end, and how to swap the Gemini model or provider later.
5. Syntax-check every file before considering the task done.
