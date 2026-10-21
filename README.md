# AI Resume Builder

A MERN stack web app that helps students and freshers make **ATS-friendly resumes for a specific job**.
You import your resume (or fill a short form), paste the job description, and the site builds a resume from
**your own details** with the skills that job asks for. Then you check its ATS score and download a PDF.

> **Current phase: full stack.** The React frontend talks to a Node.js + Express + MongoDB backend: real
> accounts, saved resumes and an admin panel. The AI routes run on the server with Google Gemini; the frontend
> buttons switch from the rule-based "demo mode" to them in Part 6 (see [Roadmap](#roadmap)).

![Landing page](docs/screenshots/01-landing.png)

---


## Problem statement

Many job seekers face difficulties in creating professional and ATS-friendly resumes due to limited knowledge of
resume formats, industry requirements, and job-specific skills. Traditional resume builders provide general
templates that may not match the expectations of different companies and job roles. Creating a customized resume
for each company and position is time-consuming and requires proper understanding of required keywords and formats.
Therefore, there is a need for an AI-powered Resume Builder that can generate, customize, and optimize resumes based
on specific companies, industries, and job roles while improving ATS compatibility and overall resume quality.

## Objectives

| # | Objective |
|---|---|
| O1 | Develop an AI-powered Resume Builder using the MERN Stack that generates professional, ATS-friendly resumes. |
| O2 | Enable users to create resumes tailored to specific companies and job roles by entering the target company and position. |
| O3 | Use AI along with collected company-specific resume data to generate customized resume content that aligns with employer expectations. |
| O4 | Provide customizable resume templates, real-time editing, preview, and PDF download features. |
| O5 | Reduce the time and effort required to create high-quality resumes while improving shortlisting chances through ATS-compatible, role-focused resumes. |
| O6 | Provide a secure and user-friendly platform for storing, managing, and updating multiple resumes. |

## Features

| Feature | What it does |
|---|---|
| **Import a resume** | Upload a PDF or Word (.docx) file, or paste the text. Name, email, phone, LinkedIn, summary, skills, experience, projects, education and certifications are filled in. You check and correct them before editing. Scanned PDFs show a clear message. |
| **Three ways to start** | "Create resume" offers: Import my resume, Fill a form, or Start blank. |
| **Paste a job description** | The site finds the skills the job asks for (about 130 skills, with short forms like JS = JavaScript, k8s = Kubernetes) and shows them as chips. |
| **Create form** | Your own skills, projects and internships. "Generate" uses only what you typed: it turns your sentences into bullet points and writes a 40–80 word summary. |
| **Resume editor** | Edit every section with a live A4 preview, a live ATS score, and the job's skills (green = in your resume, grey = missing; click one to add it). |
| **ATS checker** | Score out of 100 with matched and missing skills, fixes ranked by importance with "Fix in editor" links, and a "How this score works" box. |
| **Tailor for a new job** | Make a copy of any resume for a new job description. Matching skills move to the top, the summary is rewritten, and you tick only the missing skills you really have. The original stays unchanged. |
| **Templates and PDF** | Classic, Modern and Minimal templates. Downloads a text-based PDF that ATS systems can read. |
| **Accounts and dashboard** | Sign up, log in, profile, and a dashboard of all your resumes (edit, duplicate, download, delete, search). |
| **Admin** | Manage templates, sample companies and roles; see totals; reset the demo data. |
| **Form validation** | Mobile numbers (+91, 10 digits), CGPA out of 10 or percentage with %, years, dates, links and passwords, with errors shown as you fill the form. |

## What is real and what is demo mode

| Part | Status now |
|---|---|
| Import from PDF / Word / text | **Real.** Text is read in the browser with `pdfjs-dist` and `mammoth`, then split into sections with simple rules. |
| Skills found in a job description | **Real.** Whole-word matching against the skills list (`client/src/data/skillsList.js`). |
| ATS score | **Real calculation**, explained on the results page. It is an estimate like Jobscan; real ATS systems differ. |
| Editor, preview, PDF, validation, tailoring | **Real.** |
| "Generate", "Improve with AI", tailored summary | **Demo mode in the frontend** (written rules that only rearrange what you typed). The real Gemini AI routes already work on the server; Part 6 connects these buttons to them. |
| Accounts and saved resumes | **Real.** Stored in MongoDB through the Express API. Passwords are hashed with bcrypt; login uses a JWT. |
| Companies, roles and templates | **Real.** Stored in MongoDB and edited on the admin pages. Roles and templates are added by `npm run seed-catalog`; companies are added by the admin. |
| Admin overview | **Real.** Statistics are worked out by MongoDB; the admin can block, unblock and delete users. |

### How the ATS score works

| Part | Points |
|---|---|
| Skills from the job description found in the resume | 50 |
| Job title mentioned in the summary or experience | 10 |
| Sections present: contact, summary, skills, projects or experience, education | 20 (4 each) |
| Bullet quality: bullets with numbers (8), bullets starting with an action verb (8), summary of 40–80 words (4) | 20 |

Without a job description, only sections and bullet quality are checked and the result is shown out of 100.
The logic is in one function, `calculateAtsScore()` in `client/src/utils/atsScore.js`.

## How the AI part will be connected (Phase 3)

All AI work goes through four functions in `client/src/services/aiService.js`:

| Function | What it does |
|---|---|
| `generateBullets(text, jobDescription)` | Turns the user's sentences into bullet points |
| `writeSummary(profile, jobDescription)` | Writes a 40–80 word summary from the user's own details |
| `improveSection(section, content, jobDescription)` | Rephrases one section without adding facts |
| `tailorSummary(resume, jobDescription)` | Rewrites the summary for a new job |

Pages never contain AI logic; they only call these functions. In Phase 3, only the inside of each function
changes: it will call our Express backend (for example `POST /api/ai/summary`), and the backend will call a real
AI model. The API key stays on the server, because a key in frontend code can be seen by anyone.

## Tech stack

| Layer | Now | Later phases |
|---|---|---|
| Frontend | React 19 + Vite, plain JavaScript, React Router, Tailwind CSS, Context API | same |
| File reading | pdfjs-dist (PDF), mammoth (Word .docx) | same |
| PDF download | react-to-print (browser print, keeps real text) | same |
| Data | MongoDB with Mongoose (users, resumes, ATS check records, companies, roles, templates) | same |
| API | Node.js + Express 5 REST API; the frontend calls it through `client/src/services/api.js` | same |
| Login | bcrypt-hashed passwords, JWT in the `Authorization` header | same |
| AI | Rule-based demo in `aiService.js` | AI model called from the backend |

## Folder structure

```
ai-resume-builder/
├── client/                     React frontend
│   ├── vercel.json             lets page links work on Vercel
│   └── src/
│       ├── pages/              one file per page (Dashboard, Create, Import, Editor, ATS checker …)
│       ├── components/         shared UI, plus editor/, wizard/, ats/, landing/, admin/, templates/
│       ├── services/           api.js (calls the backend), authService, resumeService, catalogService …
│       ├── utils/              atsScore, jobDescription, resumeImport, validation, keywordUtils …
│       ├── data/               skillsList, sections, the example resume and companies used only for previews
│       └── context/            logged-in user, resumes, catalog, toasts
├── server/                     Express + MongoDB backend (Phase 2, in progress)
│   ├── server.js               starts Express and connects to MongoDB
│   ├── config/                 database connection
│   ├── models/                 User, Resume, AtsCheck, Company, Role, Template (Mongoose)
│   ├── middleware/             login checks (protect, adminOnly), 404 and error handler
│   ├── controllers/, routes/   API code: auth, users, resumes, ats, admin, catalog, ai
│   ├── services/               geminiService.js (the only file that uses the Gemini key)
│   ├── prompts/                one AI prompt per route, plus the shared rules
│   ├── data/                   skillsList (same list as the frontend)
│   ├── utils/                  validators and skill helpers (same rules as the frontend)
│   ├── seed/                   roles and templates (site configuration) for npm run seed-catalog
│   └── scripts/                create-admin, check (tests), pick-model, set-models, ai-demo, secret-check
└── docs/screenshots/
```

## How to run

Requirements: Node.js 20 or newer and MongoDB Community Server (running locally).

```bash
git clone https://github.com/suiishiii67/ai-resume-builder.git
cd ai-resume-builder

# 1. Backend (first time: see the Backend section for server/.env)
cd server
npm install
npm run create-admin      # the admin account from server/.env
npm run seed-catalog      # the built-in roles and templates (safe to run again)
npm run dev               # http://localhost:5001

# 2. Frontend, in a second terminal
cd client
npm install
npm run dev               # http://localhost:5173
```

Open http://localhost:5173 and sign up. The frontend calls the API at `http://localhost:5001/api`; to use
another address, copy `client/.env.example` to `client/.env` and change `VITE_API_URL`.

| Command (inside `client/`) | What it does |
|---|---|
| `npm run dev` | Start the app for development |
| `npm run build` | Production build into `client/dist` |
| `npm run lint` | Check the code with ESLint |

### Deploy on Vercel

Import the GitHub repo in Vercel, set **Root Directory** to `client`, and deploy. Vercel detects Vite
automatically; `client/vercel.json` makes links like `/dashboard` work when the page is refreshed.

## Backend

The backend runs only on your laptop. Requirements: Node.js 20+ and MongoDB Community Server.

```bash
# 1. Start MongoDB (macOS with Homebrew; on Windows it runs as a service after install)
brew services start mongodb-community

# 2. Install and configure
cd server
npm install
cp .env.example .env        # then fill in JWT_SECRET and the ADMIN_ values

# 3. Create the admin account (from ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD in .env)
npm run create-admin

# 4. Add the built-in roles and templates (site configuration, not demo data)
npm run seed-catalog

# 5. Start the server, then run the tests in a second terminal
npm run dev
npm run check
```

The API runs on http://localhost:5001 (`GET /api/health` should return `{ "ok": true, "db": "connected" }`).
Port 5001 is used because macOS uses port 5000 for AirPlay Receiver.

| Command (inside `server/`) | What it does |
|---|---|
| `npm run dev` | Start the server and restart it when a file changes (nodemon) |
| `npm start` | Start the server |
| `npm run create-admin` | Create the admin account, or make that email an admin if it already exists |
| `npm run seed-catalog` | Add the built-in roles and templates (only the missing ones; never deletes) |
| `npm run create-admin -- --reset-password` | Same, and also set that account's password to `ADMIN_PASSWORD` (if you forget it) |
| `npm run check` | Test the running server and print PASS / FAIL for each test |
| `npm run check -- --ai` | Same, plus the AI answer tests (about 7 real Gemini requests, so use it sparingly) |

### API

Routes marked **login** need the header `Authorization: Bearer <token>` (the token comes from signup or
login and is valid for 7 days). Errors always come back as `{ "message": "..." }`. The password is never
sent back.

| Method | URL | Access | Body | Returns |
|---|---|---|---|---|
| GET | `/api/health` | Public | | `{ ok, db }` |
| POST | `/api/auth/signup` | Public | `{ name, email, password }` | `{ token, user }` (role is always `user`) |
| POST | `/api/auth/login` | Public | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | Login | | `{ user }` |
| PATCH | `/api/users/me` | Login | `{ name, email }` | `{ user }` |
| PATCH | `/api/users/me/password` | Login | `{ currentPassword, newPassword }` | `{ message }` |
| GET | `/api/resumes` | Login | | `{ resumes }` (my own, newest edited first) |
| GET | `/api/resumes/:id` | Login | | `{ resume }` |
| POST | `/api/resumes` | Login | resume fields (`title` required) | `{ resume }` |
| PUT | `/api/resumes/:id` | Login | the fields to change | `{ resume }` |
| DELETE | `/api/resumes/:id` | Login | | `{ message }` |
| POST | `/api/resumes/:id/duplicate` | Login | | `{ resume }` ("… (copy)", no ATS score) |
| PATCH | `/api/resumes/:id/ats-score` | Login | `{ score }` (0–100) | `{ resume }` |
| POST | `/api/ats/checks` | Public or login | `{ source, resumeId, score, jobTitle, hasJobDescription, missingSkills }` | `{ check }` |
| GET | `/api/admin/stats` | Admin | | `{ totals, averageAtsScore, topMissingSkills, topJobTitles, resumesByCreatedVia, latestResumes }` |
| GET | `/api/admin/users` | Admin | | `{ users }` (each with `resumeCount`) |
| PATCH | `/api/admin/users/:id/block` | Admin | | `{ user }` (blocks, or unblocks if blocked) |
| DELETE | `/api/admin/users/:id` | Admin | | `{ message }` (also deletes their resumes and ATS checks) |
| GET | `/api/admin/resumes` | Admin | | `{ resumes }` (newest 100, with `owner: { name, email }`) |
| GET | `/api/admin/ats-checks` | Admin | | `{ checks }` (newest 100) |
| GET | `/api/catalog` | Public | | `{ companies, roles, templates }` |
| POST | `/api/admin/companies` (also `roles`, `templates`) | Admin | the item's fields | `{ item }` (gets a readable id like `infosys`) |
| PUT | `/api/admin/companies/:id` (also `roles`, `templates`) | Admin | the fields to change | `{ item }` |
| DELETE | `/api/admin/companies/:id` (also `roles`, `templates`) | Admin | | `{ message }` (at least one template must stay) |

Status codes: `400` invalid input or email already used, `401` not logged in / wrong email or password,
`403` account blocked or not an admin, `404` unknown route or a resume that isn't yours, `429` too many
quick checks.

Rules worth knowing:

- **Your own resumes only.** Every resume query includes your user id, so someone else's resume gives the
  same `404 Resume not found` as one that doesn't exist. `userId`, `atsScore` and `atsCheckedAt` can't be
  set through create/update; the score is saved only through `/ats-score`.
- **Resume limits:** title up to 120 characters, up to 50 skills and 20 entries per section, job
  description text up to 15,000 characters. Phone: Indian mobile, or international with a country code
  (`+44 20 7946 0958`).
- **ATS check records keep only the result** (score, job title, missing skills), never the resume or job
  description text. Without login the source must be `quick` and no `resumeId` is allowed; these checks are
  limited to 30 per hour per IP address.
- **Admins** can't block or delete their own account or another admin.

**No demo data.** The database starts empty: real users sign up and import their own resumes. The only
account the backend creates is the admin from `.env`. `npm run check` makes temporary users
(`check-<random>@test.local`) and deletes them, with their resumes and ATS checks, when it finishes.

### AI (Google Gemini)

The AI routes call Google Gemini **from the server**, so the API key is never in the browser.

**1. Get a free key.** Sign in at [Google AI Studio](https://aistudio.google.com/apikey) and create an API key.
No billing is needed; without billing the key uses the free tier.

**2. Put it ONLY in `server/.env`:**

```
GEMINI_API_KEY=your-key-here
```

Never put the real key in `.env.example`, the frontend, the README, a screenshot or a commit, and never share
it. `.env` is in `.gitignore`. Run `npm run secret-check` before every commit: it scans all tracked files for
anything that looks like a key, password or database password and prints only the file and line. If a key
ever leaks, delete it in Google AI Studio and create a new one.

**3. Choose the models:**

```bash
npm run pick-model                      # lists the Flash models your key can use and test-calls the best ones
npm run set-models -- <main> <backup>   # saves GEMINI_MODEL and GEMINI_FALLBACK_MODEL in .env (nothing else)
npm run pick-model -- --saved           # tests the saved models through the app's own code
npm run ai-demo                         # before/after of three weak bullets, and which model answered
```

`pick-model` chooses the newest **stable** Flash model as the main model and the newest stable Flash-Lite
as the backup (a preview only if no stable one answers). Pro models are not used: lower free limits and
slower. If the main model is busy (500/503/504), over its free limit (429), missing (404) or slower than
20 seconds, the request is sent once to the backup. If both fail, the user sees a friendly message
("AI limit reached, try again in a minute" or "AI is not available right now"), never Gemini's own error.

**Free-tier limits are low.** Google sets them per model and per day (for example 20 requests a day for
some Flash models). Each user may also make at most 30 AI requests per hour on our server. A full
`npm run check` makes no AI requests; `npm run check -- --ai` adds the AI answer tests (about 7 requests).

| Method | URL | Body | Returns |
|---|---|---|---|
| POST | `/api/ai/bullets` | `{ text, jobDescription }` | `{ bullets }` |
| POST | `/api/ai/summary` | `{ profile, jobDescription }` | `{ summary }` (40–80 words) |
| POST | `/api/ai/improve` | `{ section, content, jobDescription }` | `{ value, note }` (`value` has the same shape as `content`) |
| POST | `/api/ai/tailor-summary` | `{ resume, jobDescription }` | `{ summary }` |
| POST | `/api/ai/generate` | `{ options }` | the first resume draft (same shape as the frontend's `generateResume`) |
| POST | `/api/ai/job-insights` | `{ jobDescription }` | `{ jobTitle, mustHaveSkills, niceToHaveSkills, experienceLevel, keyPoints }` |

All AI routes need login. Each piece of text may be up to 6,000 characters. `jobDescription` can be text or
the resume's `{ text, title, company, skills }` object. AI requests and answers are not saved.

**How the AI is kept honest.** Every prompt (in `server/prompts/`, one file per route) includes the same
rules from `prompts/rules.js`:

- use only the facts the user gave; never invent companies, job titles, numbers, dates, skills, tools,
  certifications, results, purposes or praise
- keep every number the user wrote and never add new numbers or percentages
- bullets start with a strong action verb that matches the user's real part, one line, under 25 words, no
  full stop, no "I" or "my"
- use the job description's wording only where it truly fits the user's facts
- simple, professional English for tech jobs in India and abroad
- reply with JSON only, in the exact shape asked for

The code also protects the facts: `improve` for experience/projects sends only the bullets to the AI and
copies the new bullets back into the original entries, so titles, companies and dates can't change;
`improve` for skills runs in plain code (standard names, no repeats) and needs no AI; `generate` builds
the whole draft in plain code and asks the AI only for the summary and bullets, in one request. Every
reply's shape is checked, and a wrong shape returns `502 AI returned an unexpected answer`.

### Frontend to-do for Part 6 (AI in the frontend)

- Make `aiService.js` call the `/api/ai/*` routes, and fall back to the current rule-based "basic mode" when
  the AI answers 429/502/503 or the server can't be reached. Optionally show `/api/ai/job-insights` next to
  the job description.

## Accounts

There are **no demo accounts and no sample data**. The database starts empty:

- **Users** sign up on the site and import or create their own resumes.
- **The admin** is created from `ADMIN_NAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env` with
  `npm run create-admin`, then logs in on the normal login page and is taken to `/admin`.

The templates gallery and the landing page draw their previews with one clearly marked example resume
(`client/src/data/exampleResume.js`), and the landing demo uses made-up example companies
(`client/src/data/exampleCompanies.js`). Neither is saved in the database.

## Screenshots

| | |
|---|---|
| ![Dashboard](docs/screenshots/02-dashboard.png) Dashboard | ![Import](docs/screenshots/09-import.png) Import a resume |
| ![Create](docs/screenshots/03-wizard-target.png) Paste a job description | ![Editor](docs/screenshots/05-editor.png) Editor with live score |
| ![ATS checker](docs/screenshots/06-ats-checker.png) ATS checker | ![Tailor](docs/screenshots/10-tailor.png) Tailor for a new job |

<img src="docs/screenshots/08-mobile-editor.png" alt="Editor on a phone" width="260">

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| Phase 1 | Frontend: all pages, import, job description matching, ATS score, tailoring | **Done** |
| Phase 2 | Backend: Node.js + Express REST API, MongoDB, real login (bcrypt, JWT), frontend connected | **Done** |
| Phase 3 | Real AI model (Gemini) on the server; `aiService.js` connected to it in Part 6 | In progress |
| Phase 4 | Testing and deployment | Planned |
