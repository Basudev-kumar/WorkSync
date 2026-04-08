# 🔍 WorkSync — Full Project Analysis

> **Project Name:** WorkSync (internally still named `task-manager` in package.json)
> **Stack:** MERN — MongoDB · Express · React · Node.js
> **Deployment:** Frontend → Vercel · Backend → Render · Media → Cloudinary

---

## 1. 📁 File Structure

```
WorkSync/
├── backend/
│   ├── .env                        ← Environment variables (secrets, DB URI, ports)
│   ├── .gitignore
│   ├── server.js                   ← App entry point; wires everything together
│   ├── package.json                ← Backend dependencies & npm scripts
│   ├── out.txt                     ← Debug/test output file (shouldn't be committed)
│   ├── test.txt                    ← Scratch test file (shouldn't be committed)
│   ├── test_cloudinary.js          ← One-off Cloudinary connection test script
│   ├── config/
│   │   └── db.js                   ← MongoDB connection via Mongoose
│   ├── models/
│   │   ├── User.js                 ← User schema (name, email, password, role, avatar)
│   │   └── Task.js                 ← Task schema (title, status, priority, checklist…)
│   ├── controllers/
│   │   ├── authController.js       ← Register, Login, Get/Update profile
│   │   ├── taskController.js       ← Full CRUD + dashboard data + checklist logic
│   │   ├── userController.js       ← List all users (admin), get user by ID
│   │   └── reportController.js     ← Export tasks/users to Excel (.xlsx)
│   ├── middlewares/
│   │   ├── authMiddleware.js       ← JWT protect() + adminOnly() guards
│   │   └── uploadMiddleware.js     ← Multer + Cloudinary storage for image uploads
│   ├── routes/
│   │   ├── authRoutes.js           ← /api/auth/*
│   │   ├── taskRoutes.js           ← /api/tasks/*
│   │   ├── userRoutes.js           ← /api/users/*
│   │   └── reportRoutes.js         ← /api/reports/*
│   └── utils/                      ← Empty directory (placeholder)
│
└── frontend/
    ├── .env                        ← VITE_API_BASE_URL (empty → uses Vite proxy)
    ├── index.html                  ← Single HTML shell for Vite SPA
    ├── vite.config.js              ← Vite + proxy config (/api → localhost:8000)
    ├── tailwind.config.js          ← Old Tailwind v3 config (commented out — unused)
    ├── eslint.config.js
    ├── vercel.json                 ← Vercel SPA rewrite rules
    ├── package.json                ← Frontend dependencies (React 19, Recharts, etc.)
    └── src/
        ├── main.jsx                ← React DOM render root
        ├── App.jsx                 ← Router, route definitions, Root redirect logic
        ├── index.css               ← Global styles + Tailwind v4 @theme + custom classes
        ├── assets/                 ← Static assets (images, SVGs)
        ├── context/
        │   └── userContext.jsx     ← Global user state via React Context API
        ├── hooks/
        │   └── useUserAuth.jsx     ← Redirect hook (unauthenticated → /login)
        ├── routes/
        │   └── PrivateRoute.jsx    ← Role-based route guard (admin/member)
        ├── utils/
        │   ├── apiPaths.js         ← Centralized API endpoint constants
        │   ├── axiosInstance.js    ← Pre-configured Axios client with interceptors
        │   ├── data.js             ← Static: sidebar menus, priority/status options
        │   ├── helper.js           ← Email validator, number formatter
        │   └── uploadImage.js      ← Sends image as FormData to backend
        ├── components/
        │   ├── AvatarGroup.jsx     ← Stacked avatar pictures
        │   ├── DeleteAlert.jsx     ← Reusable delete confirmation dialog content
        │   ├── Modal.jsx           ← Generic modal wrapper
        │   ├── Progress.jsx        ← Progress bar component
        │   ├── TaskListTable.jsx   ← Tabular task list with priority/status badges
        │   ├── TaskStatusTabs.jsx  ← Filter tabs (All / Pending / In Progress / Completed)
        │   ├── Cards/
        │   │   ├── InfoCard.jsx    ← Stat summary card (e.g., "Total Tasks: 42")
        │   │   ├── TaskCard.jsx    ← Rich task card with checklist progress, avatars
        │   │   └── UserCard.jsx    ← Member card with task count breakdown
        │   ├── Charts/
        │   │   ├── CustomBarChart.jsx   ← Priority level bar chart (Recharts)
        │   │   ├── CustomPieChart.jsx   ← Status distribution pie chart (Recharts)
        │   │   ├── CustomLegend.jsx     ← Custom chart legend component
        │   │   └── CustomTooltip.jsx    ← Custom chart tooltip
        │   ├── Inputs/
        │   │   ├── Input.jsx            ← Basic labeled text input
        │   │   ├── SelectDropdown.jsx   ← Custom select menu
        │   │   ├── SelectUsers.jsx      ← Multi-user picker with search
        │   │   ├── TodoListInput.jsx    ← Add/remove checklist items
        │   │   ├── AddAttachmentsInput.jsx ← Add/remove URL attachments
        │   │   └── ProfilePhotoSelector.jsx ← Upload/preview profile picture
        │   └── layouts/
        │       ├── AuthLayout.jsx       ← Wrapper for auth pages (Login/Signup)
        │       ├── DashboardLayout.jsx  ← Sticky Navbar + collapsible SideMenu
        │       ├── Navbar.jsx           ← Top navigation bar
        │       └── SideMenu.jsx        ← Role-based sidebar with user avatar & links
        └── pages/
            ├── Auth/
            │   ├── Login.jsx           ← Split-screen login with animations
            │   └── SignUp.jsx          ← Registration with Cloudinary profile upload
            ├── Admin/
            │   ├── Dashboard.jsx       ← Admin stats, charts, recent tasks
            │   ├── ManageTasks.jsx     ← Task list with filter tabs, Excel export
            │   ├── CreateTask.jsx      ← Dual-purpose: create & edit tasks
            │   └── ManageUsers.jsx     ← View all members with task counts
            └── User/
                ├── UserDashboard.jsx   ← Member's personal stats & charts
                ├── MyTasks.jsx         ← Member's filtered task list
                └── ViewTaskDetails.jsx ← Task detail view + interactive checklist
```

---

## 2. 🧠 Backend Logic

### Technology Stack
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | HTTP server & request routing |
| **MongoDB + Mongoose 8** | NoSQL database + ODM |
| **bcryptjs** | Password hashing (salt rounds: 10) |
| **jsonwebtoken (JWT)** | Stateless authentication (7-day expiry) |
| **Cloudinary + Multer** | Cloud image storage for profile photos |
| **ExcelJS** | Server-side Excel report generation |
| **dotenv** | Environment variable management |
| **nodemon** | Dev hot-reloading |

### Step-by-Step Server Bootstrap (`server.js`)
1. Load env vars from `.env` via `dotenv.config()`
2. Create Express app instance
3. Apply **CORS** — allows requests from `http://localhost:5173` (dev) and `https://taskme-puce.vercel.app` (prod)
4. Apply `express.json()` body parser
5. Mount route groups (`/api/auth`, `/api/users`, `/api/tasks`, `/api/reports`)
6. Call `connectDB()` → on success, start listener on `PORT=8000`
7. On DB connection failure, log error and exit

### Database (`config/db.js`)
- Async `connectDB()` function that calls `mongoose.connect(MONGO_URI)`
- On error, calls `process.exit(1)` — intentionally crashes the server so it doesn't serve without a DB

### Data Models

#### User Schema (`models/User.js`)
```
name        String  (required)
email       String  (required, unique)
password    String  (required, bcrypt-hashed)
profileImageUrl  String (default: null)
role        Enum: ["admin", "member"]  (default: "member")
timestamps  createdAt, updatedAt
```

#### Task Schema (`models/Task.js`)
```
title         String (required)
description   String
priority      Enum: ["Low", "Medium", "High"]  (default: "Medium")
status        Enum: ["Pending", "In Progress", "Completed"]  (default: "Pending")
dueDate       Date (required)
assignedTo    [ObjectId → ref: User]   ← Array (tasks can be shared)
createdBy     ObjectId → ref: User
attachments   [String]                 ← Array of URLs
todoChecklist [{ text, completed }]    ← Embedded subdocuments
progress      Number (0–100, default: 0)
timestamps    createdAt, updatedAt
```

### API Routes Overview

#### Auth (`/api/auth`)
| Method | Path | Protection | Action |
|---|---|---|---|
| POST | `/register` | Public | Create user, optional admin token |
| POST | `/login` | Public | Validate credentials, return JWT |
| GET | `/profile` | `protect` | Return current user's profile |
| PUT | `/profile` | `protect` | Update name/email/password |
| POST | `/upload-image` | Public | Upload to Cloudinary, return URL |

#### Tasks (`/api/tasks`)
| Method | Path | Protection | Action |
|---|---|---|---|
| GET | `/dashboard-data` | `protect` | Admin stats + aggregation charts |
| GET | `/user-dashboard-data` | `protect` | Personal stats for logged-in user |
| GET | `/` | `protect` | Admin: all tasks; Member: assigned only |
| GET | `/:id` | `protect` | Single task with populated users |
| POST | `/` | `protect + adminOnly` | Create task |
| PUT | `/:id` | `protect` | Update task details |
| DELETE | `/:id` | `protect + adminOnly` | Delete task |
| PUT | `/:id/status` | `protect` | Update status (authorized users only) |
| PUT | `/:id/todo` | `protect` | Update checklist + auto-recalculate progress |

#### Users (`/api/users`)
| Method | Path | Protection | Action |
|---|---|---|---|
| GET | `/` | `protect + adminOnly` | All members with task count breakdown |
| GET | `/:id` | `protect` | Single user profile |

#### Reports (`/api/reports`)
| Method | Path | Protection | Action |
|---|---|---|---|
| GET | `/export/tasks` | `protect + adminOnly` | Download tasks as `.xlsx` |
| GET | `/export/users` | `protect + adminOnly` | Download user-task summary as `.xlsx` |

### Authentication Flow
1. Client sends `POST /api/auth/login` with `{email, password}`
2. Backend finds user by email, compares password with `bcrypt.compare()`
3. On success: returns `{_id, name, email, role, profileImageUrl, token}`
4. Client stores `token` in `localStorage`
5. Every subsequent request: `Authorization: Bearer <token>` header
6. `protect` middleware: extracts token → `jwt.verify()` → attaches `req.user` to request

### Admin Role Provisioning
Registration accepts an optional `adminInviteToken`. If it matches `process.env.ADMIN_INVITE_TOKEN` (value: `787878`), the user gets role `"admin"`. Otherwise `"member"`. This is a **shared secret** approach — not production-safe.

### Business Logic Highlights
- **Auto-progress calculation:** When a todo checklist item is toggled, the backend automatically recalculates `task.progress` as `(completedCount / totalItems) * 100` and auto-updates status to Pending/In Progress/Completed.
- **Dashboard aggregation:** Uses MongoDB's `$group` aggregation pipeline to count tasks by status and priority, ensuring all categories appear even when count is 0.
- **Overdue detection:** `dueDate: { $lt: new Date() }` and `status: { $ne: "Completed" }` — tasks past their due date that aren't done.
- **N+1 query in `getUsers`:** For each user, 3 separate `countDocuments()` calls are made — a known performance issue (see Issues section).

---

## 3. 🎨 Frontend Analysis

### Framework & Build Tool
| Technology | Version |
|---|---|
| **React** | 19.1.0 |
| **Vite** | 7.0.0 (build tool + dev server) |
| **React Router DOM** | 7.6.2 |
| **Recharts** | 3.0.1 (charts) |
| **Axios** | 1.10.0 (HTTP client) |
| **react-hot-toast** | 2.5.2 (notifications) |
| **moment.js** | 2.30.1 (date formatting) |
| **lucide-react + react-icons** | Icon libraries |

### Component Hierarchy

```
App
├── UserProvider (Context)
│   ├── Router
│   │   ├── /login → Login
│   │   ├── /signUp → SignUp
│   │   ├── PrivateRoute [admin]
│   │   │   ├── /admin/dashboard → Dashboard
│   │   │   │   └── DashboardLayout
│   │   │   │       ├── Navbar
│   │   │   │       ├── SideMenu
│   │   │   │       ├── InfoCard × 4
│   │   │   │       ├── CustomPieChart
│   │   │   │       ├── CustomBarChart
│   │   │   │       └── TaskListTable
│   │   │   ├── /admin/tasks → ManageTasks
│   │   │   │   └── DashboardLayout
│   │   │   │       ├── TaskStatusTabs
│   │   │   │       └── TaskCard × N
│   │   │   ├── /admin/create-task → CreateTask
│   │   │   │   └── DashboardLayout
│   │   │   │       ├── SelectDropdown
│   │   │   │       ├── SelectUsers
│   │   │   │       ├── TodoListInput
│   │   │   │       ├── AddAttachmentsInput
│   │   │   │       └── Modal > DeleteAlert
│   │   │   └── /admin/users → ManageUsers
│   │   │       └── DashboardLayout
│   │   │           └── UserCard × N
│   │   ├── PrivateRoute [member, admin]
│   │   │   ├── /user/dashboard → UserDashboard
│   │   │   ├── /user/tasks → MyTasks
│   │   │   └── /user/task-details/:id → ViewTaskDetails
│   │   └── / → Root (redirect based on role)
│   └── Toaster (global toast notifications)
```

### Data Flow
1. **Auth:** `Login.jsx` → POSTs to API → `updateUser()` in `UserContext` → saves token to localStorage → navigates
2. **Page Load:** `UserContext` useEffect reads token from localStorage → fetches `/api/auth/profile` → populates global `user`
3. **Protected pages:** `PrivateRoute` reads `{user, loading}` from context → shows spinner while loading → redirects if unauthorized
4. **Data fetching:** Each page calls `axiosInstance.get()` in a `useEffect()` → stores in local `useState`
5. **Mutations:** Form submissions call `axiosInstance.post/put/delete()` → `toast.success()` on success

### State Management
- **Global State:** React Context API (`UserContext`) manages the authenticated user object, a `loading` flag, `updateUser()` and `clearUser()` functions
- **Local State:** Every page uses `useState` for its own data (tasks, users, dashboard stats, form fields)
- **No Redux/Zustand** — the app relies entirely on Context + local state

---

## 4. 🎨 Styling & Design

### Approach
- **Tailwind CSS v4** (new `@import "tailwindcss"` syntax, configured in `index.css`)
- **Poppins** font imported from Google Fonts (also Fira Code, Sora — but Poppins is the active one)
- Custom design tokens defined in the new `@theme {}` block:
  - `--color-primary: #1368EC` (professional blue)
  - `--font-display: "Poppins"`

### Custom Utility Classes (in `index.css`)
| Class | Purpose |
|---|---|
| `.card` | White rounded-2xl card with subtle shadow |
| `.form-card` | Form container (rounded-lg, shadow) |
| `.form-input` | Styled input/textarea fields |
| `.card-btn` | Ghost button for card "see more" actions |
| `.add-btn` | Blue outlined submit button |
| `.download-btn` | Green tinted download button |
| `.btn-primary` | Filled primary action button |
| `.user-card` | User profile card tile |

### Color Palette
| Color | Usage |
|---|---|
| `#1368EC` (primary blue) | Active states, buttons, badges |
| `bg-violet-500` | Pending status |
| `bg-cyan-500` | In Progress status |
| `bg-lime-500` | Completed status |
| `bg-rose-500` | Delete/danger actions |
| `#fcfbfc` | Background (near-white) |
| White / `gray-100` | Cards, panels |

### Layout & Responsiveness
- **Sidebar:** Hidden on screens `< 1080px` (`max-[1080px]:hidden`) — no mobile hamburger menu is implemented
- **Dashboard:** Responsive 2→4 column grid for stat cards, 1→2 column for charts
- **Task list:** 1→3 column card grid
- **Auth pages:** Split-screen (form left, animated visual right) on large screens; single-column on mobile

### UI/UX Patterns
- Animated loading spinner (Tailwind `animate-spin`)
- Pulsing blob decorations on login page (glassmorphism-style)
- Status color badges throughout (cyan/lime/violet)
- Gradient CTA button on login (`from-indigo-600 to-purple-600`)
- `react-hot-toast` for non-blocking success/error notifications
- Icon-rich sidebar using `react-icons/lu` (Lucide icons)

---

## 5. 🔗 Frontend ↔ Backend Integration

### API Communication Layer

**`axiosInstance.js`** is the central HTTP client:
```js
const axiosInstance = axios.create({
  baseURL: BASE_URL,   // '' in dev → requests go relative (proxied)
  timeout: 10000,
  headers: { "Content-Type": "application/json" }
});
```

**Request Interceptor:** Reads `token` from `localStorage` and injects `Authorization: Bearer <token>` into every request header automatically.

**Response Interceptor:**
- `401` → Auto-redirects to `/login` (clears stale sessions)
- `500` → Logs server error
- Timeout → Logs connection abort

### Vite Proxy (Development)
```js
// vite.config.js
proxy: {
  '/api': { target: 'http://localhost:8000', changeOrigin: true }
}
```
`VITE_API_BASE_URL` is deliberately left **empty** in `.env`, so all `/api/*` requests hit the Vite dev server and are proxied to the Express backend on port 8000. This avoids CORS issues in development.

### API Path Constants (`apiPaths.js`)
All endpoint strings are centralized in `API_PATHS` — changes to API structure only need to be made in one place. Dynamic paths use arrow functions: `GET_TASK_BY_ID: (taskId) => /api/tasks/${taskId}`.

### Image Upload Flow
```
User picks image → ProfilePhotoSelector
→ uploadImage() sends FormData to POST /api/auth/upload-image
→ Multer streams to Cloudinary (folder: taskme_profiles)
→ Backend returns Cloudinary URL
→ URL stored in taskData.profileImageUrl
→ Sent with registration/profile update
```

---

## 6. ⚙️ Configuration & Setup

### Backend Environment Variables (`.env`)
| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `PORT` | Server port (8000) |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `ADMIN_INVITE_TOKEN` | Passphrase to register as admin (787878) |
| `BASE_URL` | Backend production URL (Render) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

> ⚠️ **The `.env` file is committed to the repository** — all secrets including the MongoDB URI, JWT secret, and Cloudinary credentials are exposed.

### Frontend Environment Variables (`.env`)
| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `""` (empty — uses Vite proxy in dev) |

### How to Run the Project

**Prerequisites:** Node.js (v18+), MongoDB Atlas account or local MongoDB

#### Backend
```bash
cd backend
npm install
# Ensure .env has MONGO_URI, PORT, JWT_SECRET, CLOUDINARY_* vars
npm run dev       # Nodemon hot-reload on port 8000
# OR
npm start         # Production start
```

#### Frontend
```bash
cd frontend
npm install
# Vite proxy will forward /api/* to localhost:8000 automatically
npm run dev       # Starts on http://localhost:5173
```

#### Both Together
Start the backend first (port 8000), then the frontend (port 5173). The Vite proxy handles the connection — no CORS config changes needed for local dev.

---

## 7. 🧩 Key Features

### Feature 1: Role-Based Authentication
- Registration with optional admin invite token (`787878`)
- JWT stored in localStorage, auto-attached by Axios interceptor
- `PrivateRoute` with `allowedRoles` prop prevents UI access
- Backend `protect` + `adminOnly` middleware prevents API access
- `UserContext` persists user session across page refreshes via `/api/auth/profile` fetch

### Feature 2: Task Management (Admin)
- **Create Task:** Title, description, priority (Low/Medium/High), due date, multi-user assignment, checklist items, URL attachments
- **Edit Task:** Same form, pre-populated via `location.state.taskId`
- **Delete Task:** Modal confirmation dialog before API call
- **Filter Tasks:** Tab bar filters by status with counts
- **Task Card:** Shows priority badge, status, progress bar, assigned-user avatar group, checklist item count, attachment count

### Feature 3: Smart Checklist & Auto-Progress
- Users can check/uncheck todo items in `ViewTaskDetails`
- Each toggle hits `PUT /api/tasks/:id/todo`
- Backend auto-recalculates `progress = (completed / total) * 100`
- Status auto-updates: 0% → Pending, >0% → In Progress, 100% → Completed

### Feature 4: Analytics Dashboards
- **Admin Dashboard:** Total/Pending/InProgress/Completed counts + Pie chart (status distribution) + Bar chart (priority breakdown) + recent 10 tasks table
- **User Dashboard:** Same structure but scoped to the logged-in user's assigned tasks only
- Charts built with Recharts with custom tooltips and legends

### Feature 5: Excel Report Export
- Admin can download task list or user-task summary as `.xlsx`
- ExcelJS generates the workbook on the server with styled bold headers
- Frontend triggers blob download by creating a temporary `<a>` element

### Feature 6: Profile Photo Upload
- Cloudinary storage via `multer-storage-cloudinary`
- Images uploaded to folder `taskme_profiles`
- Allowed formats: JPEG, PNG, JPG
- Shows preview in sidebar and across avatar groups

### Feature 7: Multi-User Task Assignment
- `SelectUsers` component fetches all members from `GET /api/users`
- Supports selecting multiple members for a single task
- Assigned users see the task on their `MyTasks` page and dashboard

---

## 8. 🚨 Issues & Improvements

### 🔴 Critical Issues

#### 1. Secrets in Version Control
```
backend/.env → MongoDB URI, JWT secret, Cloudinary keys — ALL COMMITTED
```
**Fix:** Add `.env` to `.gitignore`, rotate all exposed secrets immediately, use environment variable managers (Railway, Render, Vercel's env panel).

#### 2. Admin Invite Token is Trivially Weak
`ADMIN_INVITE_TOKEN=787878` — a 6-digit number is easily guessed.
**Fix:** Use a cryptographically random 32-byte token. Consider an invite-link flow or admin approval queue.

#### 3. JWT Token Stored in `localStorage` (XSS Vulnerable)
```js
localStorage.setItem("token", token);
```
`localStorage` is accessible to any JS on the page. If an XSS vulnerability exists, tokens can be stolen.
**Fix:** Store JWT in an `HttpOnly` cookie — immune to XSS.

#### 4. `connectDB()` is Called Twice (Dead Code)
```js
// Line 34: connectDB(); ← commented out
// Line 60: connectDB().then(...)  ← active
```
The commented-out call at line 34 is leftover dead code.

#### 5. accessToken Hardcoded in `.env`
```
accessToken = eyJhbGciOiJI...  ← a real JWT sitting in .env
```
This is an expired/stale test token but follows poor practices.

---

### 🟡 Performance Issues

#### 6. N+1 Query for User Task Counts (`userController.js`)
```js
users.map(async (user) => {
  await Task.countDocuments({ assignedTo: user._id, status: "Pending" });       // ← 1 query
  await Task.countDocuments({ assignedTo: user._id, status: "In Progress" });   // ← 1 query
  await Task.countDocuments({ assignedTo: user._id, status: "Completed" });     // ← 1 query
})
```
For 50 users = 150 separate DB queries.
**Fix:** Single aggregation using `$group` and `$facet`.

#### 7. Missing API Call Cancellation
`useEffect` hooks fire API calls but return `() => {}` — no cleanup/abort on unmount.
**Fix:** Use `AbortController` with Axios `cancelToken` or `signal`.

#### 8. Missing Pagination
`getTasks`, `getUsers`, etc. fetch entire collections with no `.limit()` or pagination.
**Fix:** Add cursor/offset pagination with `?page=&limit=` query params.

---

### 🟠 Code Quality Issues

#### 9. Typo in API Response Key (`statusSummaty`)
```js
// taskController.js line 65:
statusSummaty: { allTasks, pendingTasks, inProgressTasks, completedTasks }
// Frontend compensates:
const statusSummary = response.data?.statusSummaty || {};
```
The typo "Summaty" propagates to the frontend. Fix the typo in both places.

#### 10. `console.log` Left in Production Code
```js
// Dashboard.jsx line 88:
console.log("Bar Chart Data sent to CustomBarChart: ", barChartData);
// apiPaths.js line 9:
console.log("Backend Base URL: ", import.meta.env.VITE_API_BASE_URL);
```
Remove all debug logs before production deployment.

#### 11. Commented-Out Code Blocks
`reportController.js` contains 138 lines of commented-out duplicated code. `tailwind.config.js` is entirely commented out.
**Fix:** Delete dead code; use git history for recovery if needed.

#### 12. No Mobile Sidebar
The sidebar is hidden on screens `< 1080px` with `max-[1080px]:hidden` but no hamburger/drawer replacement exists.
**Fix:** Add a slide-in mobile drawer triggered by a hamburger button in the Navbar.

#### 13. `updateUserProfile` Doesn't Return `profileImageUrl`
```js
// authController.js line 164:
// profileImageUrl:updatedUser.profileImageUrl,  ← commented out!
```
Profile image is lost on update.

#### 14. `deleteUser` Route Exists But Controller Is Commented Out
```js
// userController.js: deleteUser is commented out
// userRoutes.js: route is also commented out
```
Feature is half-built and unfinished.

#### 15. `useUserAuth` Hook Has a Dead Code Path
```js
if (user) return;           // ← exits early
if (!user) {                // ← this is always true at this point (redundant check)
  clearUser();
  navigate("/login");
}
```
The second `if (!user)` is always true since the first `if (user)` would have returned.

#### 16. `"Forgot Password"` Link Goes Nowhere
`Login.jsx` links to `/forgot-password` which has no route defined.

#### 17. Empty `backend/utils/` Directory
Created but never populated. Either add utilities there or remove it.

#### 18. Stale Files (`out.txt`, `test.txt`, `test_cloudinary.js`)
Debug/test files should not be in the repository.

---

### 🟢 Improvements to Consider

| Area | Suggestion |
|---|---|
| **Error Handling** | Add a global Express error-handling middleware instead of try/catch in every controller |
| **Input Validation** | Add `express-validator` or `zod` for server-side request body validation |
| **Rate Limiting** | Add `express-rate-limit` to `/api/auth/*` to prevent brute-force attacks |
| **Helmet.js** | Add HTTP security headers (XSS protection, no-sniff, etc.) |
| **Refresh Tokens** | 7-day JWT without a refresh mechanism — consider short-lived access + refresh token pair |
| **Task Notifications** | Email/push alerts when a task is assigned or nearing due date |
| **Unit Tests** | No test coverage whatsoever — add Jest for backend, Vitest + Testing Library for frontend |
| **React Query** | Replace manual `useEffect` fetch patterns with TanStack Query for caching, loading states, and auto-refetch |
| **TypeScript** | Strong typing would catch the `statusSummaty` typo at compile time |

---

## 9. 📝 Summary

**WorkSync** is a **role-based task management platform** built on the MERN stack. It serves two personas:

- **Admins** can create, assign, edit, and delete tasks; view analytics dashboards with charts; manage team members; and export reports to Excel.
- **Members** can view their assigned tasks, interact with todo checklists (which auto-update progress), and see their own performance dashboard.

The app is deployed with the **frontend on Vercel** and **backend on Render**, using **MongoDB Atlas** as the cloud database and **Cloudinary** for profile image storage.

The codebase demonstrates solid understanding of MERN architecture — JWT authentication, role-based access control, React Context API, Axios interceptors, and MongoDB aggregation pipelines. The code is well-organized with a clean separation of concerns (models/controllers/routes).

However, several **production-readiness concerns** exist: exposed secrets in version control, weak admin token, JWT stored in localStorage, no mobile sidebar, N+1 database queries, missing input validation, and no test coverage. Addressing the critical security issues should be the first priority before any real-world deployment.
