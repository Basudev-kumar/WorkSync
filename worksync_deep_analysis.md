# WorkSync — Complete Codebase Deep-Dive

> **Target audience**: Engineers who want complete mastery of this repository — every decision explained, every edge case surfaced.

---

## 1. 📁 File & Folder Structure

```
WorkSync/
├── backend/                        ← Node.js / Express REST API
│   ├── config/
│   │   └── db.js                   ← Mongoose connection factory
│   ├── controllers/
│   │   ├── authController.js       ← Register / Login / Profile CRUD
│   │   ├── taskController.js       ← Full task lifecycle + dashboards
│   │   ├── userController.js       ← Member list (with N+1 aggregation fix)
│   │   └── reportController.js     ← Excel export (exceljs)
│   ├── middlewares/
│   │   ├── authMiddleware.js       ← JWT protect + adminOnly guards
│   │   └── uploadMiddleware.js     ← multer + Cloudinary storage
│   ├── models/
│   │   ├── User.js                 ← Mongoose User schema (RBAC role field)
│   │   └── Task.js                 ← Mongoose Task schema (embedded todos)
│   ├── routes/
│   │   ├── authRoutes.js           ← /api/auth/*
│   │   ├── userRoutes.js           ← /api/users/*
│   │   ├── taskRoutes.js           ← /api/tasks/*
│   │   └── reportRoutes.js         ← /api/reports/*
│   ├── utils/
│   │   └── errorHandler.js         ← Global Express error middleware
│   ├── .env                        ← Secrets (MONGO_URI, JWT_SECRET, Cloudinary)
│   ├── server.js                   ← App entry: CORS, middleware, route mounting
│   ├── test_cloudinary.js          ← Manual Cloudinary connectivity probe
│   └── package.json
│
└── frontend/                       ← React 19 + Vite + Tailwind v4 SPA
    ├── public/                     ← Static assets (favicon etc.)
    ├── src/
    │   ├── App.jsx                 ← Router tree + ThemeProvider + UserProvider
    │   ├── main.jsx                ← ReactDOM.createRoot entry point
    │   ├── index.css               ← Tailwind v4 @theme tokens + component classes
    │   │
    │   ├── context/
    │   │   ├── userContext.jsx     ← Global user state (fetch on mount, JWT cache)
    │   │   └── themeContext.jsx    ← Dark/light mode (localStorage + system pref)
    │   │
    │   ├── hooks/
    │   │   └── useUserAuth.jsx     ← Redirect-to-login hook (used in page components)
    │   │
    │   ├── routes/
    │   │   └── PrivateRoute.jsx    ← Route guard: blocks unauthenticated + wrong-role access
    │   │
    │   ├── utils/
    │   │   ├── apiPaths.js         ← Centralised API endpoint constants
    │   │   ├── axiosInstance.js    ← Axios + JWT interceptor + 401 auto-redirect
    │   │   ├── uploadImage.js      ← Wraps multipart/form-data upload to /api/auth/upload-image
    │   │   ├── data.js             ← Sidebar menus + PRIORITY_DATA + STATUS_DATA
    │   │   └── helper.js           ← validateEmail() util
    │   │
    │   ├── pages/
    │   │   ├── Auth/
    │   │   │   ├── Login.jsx       ← Premium split-screen login (Remember Me, show/hide)
    │   │   │   ├── SignUp.jsx      ← 2-step signup with strength meter + optional admin token
    │   │   │   └── auth.css        ← Mesh gradient + orb animations + auth-input class
    │   │   ├── Admin/
    │   │   │   ├── Dashboard.jsx   ← Admin KPI cards + pie + bar charts + recent tasks table
    │   │   │   ├── ManageTasks.jsx ← Paginated task list with status tabs + delete
    │   │   │   ├── CreateTask.jsx  ← Create / Update task form (dual mode)
    │   │   │   └── ManageUsers.jsx ← Member roster with task counts + export buttons
    │   │   └── User/
    │   │       ├── UserDashboard.jsx  ← User-specific KPIs + charts + recent tasks
    │   │       ├── MyTasks.jsx        ← Filtered task cards for logged-in user
    │   │       └── ViewTaskDetails.jsx ← Task detail view + inline checklist toggle
    │   │
    │   └── components/
    │       ├── layouts/
    │       │   ├── DashboardLayout.jsx ← Page shell: Navbar + SideMenu + children
    │       │   ├── Navbar.jsx          ← Top bar: hamburger, avatar, dark mode toggle
    │       │   └── SideMenu.jsx        ← Role-aware sidebar with logout handler
    │       ├── Cards/
    │       │   ├── TaskCard.jsx        ← Card view for a single task
    │       │   ├── InfoCard.jsx        ← Coloured stat card (label + value + dot)
    │       │   └── UserCard.jsx        ← Member card with task count breakdown
    │       ├── Charts/
    │       │   ├── CustomPieChart.jsx  ← Recharts donut chart (status distribution)
    │       │   ├── CustomBarChart.jsx  ← Recharts bar chart (priority levels)
    │       │   ├── CustomTooltip.jsx   ← Dark-aware tooltip for charts
    │       │   └── CustomLegend.jsx    ← Dark-aware legend labels
    │       ├── Inputs/
    │       │   ├── SelectDropdown.jsx  ← Custom dropdown (click-outside, dark)
    │       │   ├── SelectUsers.jsx     ← Modal multi-select user picker
    │       │   ├── TodoListInput.jsx   ← Add / delete todo items (Enter-key support)
    │       │   └── AddAttachmentsInput.jsx ← Add / delete attachment links
    │       ├── AvatarGroup.jsx         ← Stacked avatar circles with overflow count
    │       ├── DeleteAlert.jsx         ← Confirmation dialog content (used inside Modal)
    │       ├── Modal.jsx               ← Generic overlay modal shell
    │       ├── Progress.jsx            ← Progress bar with status-aware colour
    │       ├── TaskListTable.jsx       ← Tabular task list for dashboard panels
    │       └── TaskStatusTabs.jsx      ← Horizontal tab bar with badge counts
    │
    ├── vite.config.js              ← Vite: React plugin, Tailwind plugin, dev proxy
    ├── tailwind.config.js          ← Legacy v3 config (no-op in v4, Tailwind is now plugin-driven)
    ├── vercel.json                 ← SPA rewrite rule for Vercel deployment
    └── package.json
```

---

## 2. 🧠 Backend Logic

### Technology Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js (CommonJS modules — `"type": "commonjs"`) |
| Framework | **Express 5** (`^5.1.0`) — async error propagation is built-in |
| Database | **MongoDB** via **Mongoose 8** |
| ORM | Mongoose schemas with embedded sub-documents |
| Auth | **bcryptjs** (hashing) + **jsonwebtoken** (JWT) |
| File Upload | **multer** + **multer-storage-cloudinary** → Cloudinary CDN |
| Reports | **exceljs** — streams `.xlsx` files directly to response |
| Dev tooling | **nodemon** for hot reload |

### Request → Response Lifecycle

```
HTTP Request
    │
    ▼
server.js
  ├── cors() — validates Origin header against allowlist
  ├── express.json() — parses application/json body into req.body
  │
  ├── /api/auth    → authRoutes.js
  ├── /api/users   → userRoutes.js
  ├── /api/tasks   → taskRoutes.js
  └── /api/reports → reportRoutes.js
        │
        ▼
  Route handler chain:  protect? → adminOnly? → controller
        │
        ▼
  controller: business logic, DB queries, response
        │
        ▼ (on throw / next(err))
  errorHandler middleware → JSON error response
```

### `config/db.js` — Database Connection
```js
await mongoose.connect(process.env.MONGO_URI, {});
```
- Called **before** `app.listen()` — if connection fails, `process.exit(1)` prevents a zombie server.
- Empty options object `{}` uses Mongoose 8 defaults (connection pooling, retry logic built-in).

### `server.js` — Entry Point

**Critical detail**: `dotenv.config()` is called **before any module imports** because Node.js resolves require-time constants. If dotenv were called after importing a module that reads `process.env.*` at module load, the variables would be undefined.

**CORS configuration**:
```js
origin: ["https://taskme-puce.vercel.app", "http://localhost:5173"]
```
- Hardcoded allowlist — the production URL still says "taskme" (old project name). `WorkSync` was renamed from TaskMe.
- `allowedHeaders: ["content-type","Authorization"]` — lowercase `c` in `content-type` is intentional (HTTP headers are case-insensitive, but some strict CORS implementations distinguish).

---

## 3. 🔐 Authentication & Authorization

### Registration Flow (step-by-step)

```
POST /api/auth/register
  Body: { name, email, password, profileImageUrl, adminInviteToken }

1. User.findOne({ email })
   → If found: return 400 "User already exists"

2. Check adminInviteToken == process.env.ADMIN_INVITE_TOKEN
   → Loose equality (==) — string comparison of env var
   → If match: role = "admin", else role = "member"

3. bcrypt.genSalt(10) → bcrypt.hash(password, salt)
   → 10 rounds = ~100ms work factor

4. User.create({ name, email, password: hashedPassword, profileImageUrl, role })

5. Return: { _id, name, email, role, profileImageUrl, token: generateToken(user._id) }
   → Token is JWT signed with process.env.JWT_SECRET, expires in 7 days
```

**Security gap**: `adminInviteToken == process.env.ADMIN_INVITE_TOKEN` uses loose equality (`==`). While this works for string comparison, strict equality (`===`) is always preferred to avoid type coercion edge cases. More critically, the token `787878` (a 6-digit numeric string) is hardcoded in `.env` — trivially brute-forceable.

### Login Flow

```
POST /api/auth/login
  Body: { email, password }

1. User.findOne({ email })
   → If not found: 401 "Invalid email or password"
   → Note: same message for both "email not found" and "wrong password"
   → This is correct (prevents email enumeration attacks)

2. bcrypt.compare(password, user.password)
   → If no match: 401

3. Return: { _id, name, email, role, profileImageUrl, token }
```

### JWT Structure

```js
jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" })
```
- Payload: `{ id, iat, exp }` — minimal, no role embedded.
- The role is fetched fresh from DB on every protected request (via `protect` middleware) — this is **correct**: it means a role change takes effect immediately without token reissue.

### `protect` Middleware — Line-by-Line

```js
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {       // ← Note: no space check after "Bearer"
      token = token.split(" ")[1];                   // "Bearer <token>" → token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token failed", error: error.message });
  }
};
```

**Edge case**: `token.startsWith("Bearer")` (no trailing space). A token like `"Bearerxxx"` would not match because `split(" ")[1]` would return `undefined`. `jwt.verify(undefined, ...)` throws, caught by the catch block → 401. Functionally safe, but imprecise.

**DB hit on every request**: `User.findById(decoded.id)` is called for every protected route. This is a network round-trip to MongoDB on every API call. **Improvement**: cache user in Redis with a short TTL or embed role in the JWT payload (with the tradeoff of delayed role-change propagation).

### `adminOnly` Middleware

```js
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied, admin only" });
  }
};
```

**Implicit dependency**: `adminOnly` **must** always be registered after `protect` because it reads `req.user` which `protect` sets. The task routes correctly chain them: `protect, adminOnly`.

### Role-Based Access Control (RBAC) Map

| Endpoint | `protect` | `adminOnly` | Notes |
|---|---|---|---|
| `POST /api/tasks/` | ✅ | ✅ | Create task — Admin only |
| `DELETE /api/tasks/:id` | ✅ | ✅ | Delete task — Admin only |
| `GET /api/tasks/` | ✅ | ❌ | Admin sees all; member sees only assigned |
| `PUT /api/tasks/:id/status` | ✅ | ❌ | Any user, but assignment-checked in controller |
| `PUT /api/tasks/:id/todo` | ✅ | ❌ | Any user, assignment-checked |
| `GET /api/reports/export/*` | ✅ | ✅ | Admin only |
| `GET /api/users/` | ✅ | ✅ | Admin only |

**Assignment check inside `updateTaskStatus`**:
```js
const isAssigned = task.assignedTo.some(
  userId => userId.toString() === req.user._id.toString()
);
if (!isAssigned && req.user.role !== "admin") {
  return res.status(403).json({ message: "Not authorized" });
}
```
This is correct defence-in-depth: even if `adminOnly` wasn't applied to a route, a member cannot update a task they aren't assigned to.

---

## 4. 🎨 Frontend Architecture

### Technology Stack
| Concern | Technology |
|---|---|
| Framework | **React 19** (concurrent features, compiler-safe) |
| Build tool | **Vite 7** |
| Routing | **React Router DOM v7** |
| Styling | **Tailwind CSS v4** (plugin-driven, `@import "tailwindcss"`) |
| HTTP client | **Axios** (with interceptors) |
| Charts | **Recharts 3** |
| Toast | **react-hot-toast** |
| Icons | **Lucide React** + **react-icons** (Lu prefix = Lucide) |
| Date utils | **Moment.js** |

### Component Hierarchy

```
main.jsx
└── App.jsx
    ├── ThemeProvider          (themeContext.jsx)
    │   └── UserProvider       (userContext.jsx)
    │       ├── <Router>
    │       │   ├── /login     → Login.jsx
    │       │   ├── /signUp    → SignUp.jsx
    │       │   ├── /          → Root (smart redirect based on role)
    │       │   │
    │       │   ├── PrivateRoute (allowedRoles=["admin"])
    │       │   │   ├── /admin/dashboard    → Dashboard.jsx
    │       │   │   │   └── DashboardLayout
    │       │   │   │       ├── Navbar
    │       │   │   │       ├── SideMenu
    │       │   │   │       └── [page content]
    │       │   │   ├── /admin/tasks        → ManageTasks.jsx
    │       │   │   ├── /admin/create-task  → CreateTask.jsx
    │       │   │   └── /admin/users        → ManageUsers.jsx
    │       │   │
    │       │   └── PrivateRoute (allowedRoles=["member","admin"])
    │       │       ├── /user/dashboard          → UserDashboard.jsx
    │       │       ├── /user/tasks              → MyTasks.jsx
    │       │       └── /user/task-details/:id   → ViewTaskDetails.jsx
    │       │
    │       └── <Toaster />    (global toast notifications)
    │
    └── (ThemeProvider injects .dark class on <html>)
```

### `App.jsx` Root Component (Smart Redirect)

```jsx
const Root = () => {
  const { user, loading } = useContext(UserContext);
  if (loading) return <Outlet />;
  if (!user)   return <Navigate to="/login" />;
  return user.role === "admin"
    ? <Navigate to="/admin/dashboard" />
    : <Navigate to="/user/dashboard" />;
};
```

**Hidden behaviour**: While `loading=true`, `<Outlet />` is returned. At the `/` route there is no outlet, so this renders nothing — effectively a blank screen until user is resolved. This is acceptable (loading is fast — just one `GET /api/auth/profile` call).

### `PrivateRoute.jsx` — Guards

Three states:
1. `loading=true` → Renders a centered Tailwind spinner (prevents flash of redirect)
2. `!user` → `<Navigate to="/login" replace />` (replace prevents back-button loop)
3. `allowedRoles && !allowedRoles.includes(user.role)` → `<Navigate to="/" replace />` (hits Root → smart redirect)

### `UserContext.jsx` — Global Auth State

```js
// On mount: if token exists in localStorage, fetch user profile
useEffect(() => {
  if (user) return;          // Already hydrated — skip
  const accessToken = localStorage.getItem("token");
  if (!accessToken) { setLoading(false); return; }
  fetchUser();               // GET /api/auth/profile
}, []);
```

**Why fetch profile on mount instead of decoding the JWT client-side?**
- The JWT payload only contains `{ id, iat, exp }` — no name, email, role, or avatar.
- The profile fetch ensures the UI always has fresh user data even if the server-side user was updated between sessions.
- **Tradeoff**: Every page refresh makes one extra network request.

### `useUserAuth.jsx` — Imperative Redirect Hook

Used inside page components as a secondary auth guard (defence-in-depth):
```js
export const useUserAuth = () => {
  const { user, loading, clearUser } = useContext(UserContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (user) return;
    clearUser();              // Wipes stale localStorage token
    navigate("/login");
  }, [user, loading, clearUser, navigate]);
  return { user, loading };
};
```

**Why both `PrivateRoute` AND `useUserAuth`?**
- `PrivateRoute` guards the route from rendering.
- `useUserAuth` catches session expiry that occurs **while the user is on the page** (e.g., token expires, another tab logs out). The axios interceptor also handles this at the HTTP layer (401 → `window.location.href = "/login"`), but `useUserAuth` provides a React-native alternative.

### `axiosInstance.js` — The HTTP Layer

```js
// Request interceptor: attaches JWT to every request
config.headers.Authorization = `Bearer ${accessToken}`;

// Response interceptor:
if (status === 401) window.location.href = "/login";
```

**Critical design choice**: `window.location.href` is used instead of React Router's `navigate()`. This causes a **full page reload**, which:
1. Clears all React state
2. Re-initialises `UserContext` with no token → redirects to login

This is intentional — a 401 means the token is invalid or expired, so clearing all state is the correct behaviour.

---

## 5. 🎨 Styling & Design System

### Tailwind v4 Setup
```css
/* index.css */
@import url('https://fonts.googleapis.com/css2?...');  /* Poppins + Sora + Fira Code */
@import "tailwindcss";

@theme {
  --font-display: "Poppins", "sans-serif";
  --breakpoint-3xl: 1920px;
  --color-primary: #1368EC;   /* Blue — used as `text-primary`, `bg-primary` */
}

@custom-variant dark (&:where(.dark, .dark *));  /* Class-based dark mode */
```

**Why `@custom-variant` instead of `darkMode: "class"` in tailwind.config.js?**
Tailwind v4 no longer uses `tailwind.config.js` for dark mode configuration. The new way is the `@custom-variant` directive in the main CSS file.

### Component Classes (Reusable Utilities)

| Class | Purpose | Dark variant |
|---|---|---|
| `.card` | White rounded card with shadow | `dark:bg-[#1a1d2e]` |
| `.form-card` | Same but for forms (less rounded) | Same |
| `.form-input` | Styled input / textarea | `dark:bg-slate-800 dark:border-slate-600` |
| `.card-btn` | Outlined ghost button | `dark:bg-slate-700/50 dark:text-slate-300` |
| `.card-btn-fill` | Solid primary button | bg-primary |
| `.add-btn` | Blue tinted submit button | `dark:bg-blue-900/20` |
| `.user-card` | Member card | Same as `.card` |
| `.download-btn` | Lime green report download | `dark:bg-lime-900/30` |

### Color Palette
- **Primary**: `#1368EC` (blue) — actions, links, selected states
- **Dark background**: `#0f1117` (page), `#1a1d2e` (cards)
- **Light background**: `#fcfbfc` (page), `#ffffff` (cards)
- **Semantic**: Rose/red for delete, Lime/green for success, Amber/orange for medium priority, Cyan for in-progress

### Typography
- **Headings**: Poppins, font-bold, text-xl to text-3xl
- **Body**: Poppins, text-sm (13px) to text-base (16px)
- **Labels**: uppercase, tracking-wide, text-[13px], font-semibold (auth pages)
- **Monospace**: Fira Code (loaded but not actively applied in reviewed components)

### Auth Page Design
- **Split screen**: form panel (left/right) + animated visual panel
- **Animated mesh gradient**: 12s `background-position` animation on visual panel
- **Floating orbs**: CSS `radial-gradient` circles with `translateY` animation
- **Custom checkbox**: SVG checkmark inside a `div`, styled via peer CSS
- **Password strength**: 4-segment colour bar (red → orange → yellow → green)

---

## 6. 🔗 Frontend ↔ Backend Integration

### API Endpoints — Complete Map

```
Authentication
  POST   /api/auth/register      → registerUser
  POST   /api/auth/login         → loginUser
  GET    /api/auth/profile       → getUserProfile       [protect]
  PUT    /api/auth/profile       → updateUserProfile    [protect]
  POST   /api/auth/upload-image  → Multer+Cloudinary    [no auth!]

Users
  GET    /api/users/             → getUsers             [protect, adminOnly]
  GET    /api/users/:id          → getUserById          [protect]

Tasks
  GET    /api/tasks/dashboard-data      → getDashboardData      [protect]
  GET    /api/tasks/user-dashboard-data → getUserDashboardData  [protect]
  GET    /api/tasks/                    → getTasks              [protect]
  GET    /api/tasks/:id                 → getTaskById           [protect]
  POST   /api/tasks/                    → createTask            [protect, adminOnly]
  PUT    /api/tasks/:id                 → updateTask            [protect]
  DELETE /api/tasks/:id                 → deleteTask            [protect, adminOnly]
  PUT    /api/tasks/:id/status          → updateTaskStatus      [protect]
  PUT    /api/tasks/:id/todo            → updateTaskChecklist   [protect]

Reports
  GET    /api/reports/export/tasks → exportTasksReport   [protect, adminOnly]
  GET    /api/reports/export/users → exportUsersReport   [protect, adminOnly]
```

**Security gap**: `POST /api/auth/upload-image` has **no `protect` middleware**. Anyone can upload images to your Cloudinary account without authentication. This is a storage cost + abuse risk.

### Full Data Flow Trace: Creating a Task

```
1. Admin fills CreateTask.jsx form
   ↓
2. handleSubmit() validates: title, description, dueDate, assignedTo, todoChecklist
   ↓
3. todoList items mapped: "text string" → { text: string, completed: false }
   ↓
4. axiosInstance.post(API_PATHS.TASKS.CREATE_TASK, payload)
   → Request interceptor attaches: Authorization: Bearer <token>
   ↓
5. Backend: protect middleware
   → Extracts token, jwt.verify(), User.findById() → req.user
   ↓
6. adminOnly middleware
   → req.user.role === "admin"? next() : 403
   ↓
7. createTask controller
   → Validates assignedTo is Array
   → Task.create({ ...payload, createdBy: req.user._id })
   → Returns 201 { message, task }
   ↓
8. Frontend toast.success("Task Created Successfully")
   ↓
9. clearData() resets form state
```

### Full Data Flow Trace: Toggling a Todo Checklist Item

```
1. User clicks checkbox on ViewTaskDetails.jsx
   ↓
2. updateTodoChecklist(index) clones task.todoChecklist array
   → todoChecklist[index].completed = !current
   ↓
3. axiosInstance.put(API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId), { todoChecklist })
   ↓
4. updateTaskChecklist controller:
   → Verifies user is assigned to this task (or is admin)
   → task.todoChecklist = todoChecklist  (full replace)
   → Auto-compute progress: completedCount / totalItems * 100
   → Auto-update status:
       progress === 100 → "Completed"
       progress > 0     → "In Progress"
       progress === 0   → "Pending"
   → task.save()
   → Re-fetch task with .populate("assignedTo") → return full updated task
   ↓
5. Frontend: setTask(response.data?.task || task)
   → UI re-renders with new checked state + progress bar
```

---

## 7. 🏗️ Architecture Overview

### Pattern: Modular Monolith
- **Single Express server** — no microservices, no separate services layer.
- **MVC-ish**: Routes (thin) → Controllers (business logic) → Models (data).
- Separation of concerns is clean: routes never contain logic, controllers never define schemas.

### Scalability Analysis

**Current bottlenecks**:
1. `protect` middleware: DB query per request (no caching).
2. `getTasks` with status summary: 4 sequential `countDocuments()` calls — can collapse into one aggregation.
3. `exportUsersReport`: loads ALL tasks into memory for processing — will fail at scale.
4. No database indexing defined on `assignedTo`, `status`, `priority` fields despite frequent filter queries.

**Improvement roadmap**:
```js
// Add indexes to Task model
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ status: 1, assignedTo: 1 });  // compound
taskSchema.index({ dueDate: 1, status: 1 });      // for overdue queries
userSchema.index({ email: 1 });                   // already unique, ensure index
```

---

## 8. ⚙️ Configuration & Setup

### Backend Environment Variables (`.env`)
| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | HMAC secret for JWT signing |
| `PORT` | Server listen port (default 5000 in code, proxy targets 8000) |
| `ADMIN_INVITE_TOKEN` | Static numeric token (`787878`) to grant admin role on register |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account identifier |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Frontend Environment Variables (`.env`)
| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Base URL for axiosInstance (empty in dev — uses Vite proxy) |

### Vite Dev Proxy
```js
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
  }
}
```
In development, calls to `/api/*` in the frontend are proxied to the backend at `localhost:8000`, avoiding CORS issues. **Discrepancy**: backend defaults to port 5000, proxy targets 8000 — one of these must match `process.env.PORT`.

### Local Setup Instructions

```bash
# 1. Clone repository
git clone <repo> WorkSync
cd WorkSync

# 2. Backend setup
cd backend
npm install
# Create .env with all variables listed above
npm run dev    # nodemon server.js → http://localhost:8000

# 3. Frontend setup
cd ../frontend
npm install
# Create .env: VITE_API_BASE_URL= (empty for proxy mode)
npm run dev    # vite → http://localhost:5173

# 4. Navigate to http://localhost:5173
# Register with adminInviteToken = 787878 to get admin access
```

---

## 9. 🧩 Key Features — Internal Mapping

### Feature 1: Authentication (Login + Signup)
- **login**: `POST /api/auth/login` → bcrypt compare → JWT → stored in `localStorage`
- **signup**: `POST /api/auth/register` → optional admin token check → bcrypt hash → JWT
- **profile pic**: Upload via `POST /api/auth/upload-image` → Cloudinary CDN URL stored in User document
- **2-step signup**: Step 1 = basic info / Step 2 = optional admin token (UX only — both call the same API)
- **password strength**: Client-side only — 4 heuristics (length, uppercase, numbers, symbols)
- **remember me**: Stores email in `localStorage.rememberedEmail` (cosmetic — does NOT extend token TTL)

### Feature 2: Task Management (Admin)
- **Create task**: Form with title, description, priority, dueDate, assignedTo (multi-user), todoChecklist, attachments
- **Update task**: Same form, pre-populated. `taskId` passed via `location.state`.
- **Delete task**: Soft-confirm via DeleteAlert modal inside Modal shell → `DELETE /api/tasks/:id`
- **Status management**: Dropdown in ManageTasks row → `PUT /api/tasks/:id/status`
  - Setting "Completed" auto-marks all todo items and sets progress=100

### Feature 3: Dashboard Data
- **Admin dashboard**: 4 KPI cards (total, pending, completed, overdue) + pie chart (status distribution) + bar chart (priority levels) + recent 10 tasks table
- **User dashboard**: Same structure but filtered to `assignedTo: userId`
- **Overdue query**: `status: { $ne: "Completed" }, dueDate: { $lt: new Date() }`

### Feature 4: Todo Checklist with Auto-Status
The most sophisticated feature:
```
Check/uncheck item → PUT /api/tasks/:id/todo
→ Backend recomputes:
    progress = checkedItems / totalItems * 100
    status = progress===100 ? "Completed" : progress>0 ? "In Progress" : "Pending"
```
Status is **automatically derived from checklist** — user never manually sets status via this flow.

### Feature 5: Excel Reports
- `GET /api/reports/export/tasks` → Streams `.xlsx` with HTTP headers `Content-Disposition: attachment`
- `GET /api/reports/export/users` → Pivot table: user → task counts per status
- Frontend triggers via `window.location.href = API_URL` (not axios) — this forces browser download

### Feature 6: Dark Mode
- **ThemeContext**: Reads `localStorage.theme` or `prefers-color-scheme` on init
- **Toggle**: Adds/removes `.dark` class on `document.documentElement`
- **Tailwind**: `@custom-variant dark (&:where(.dark, .dark *))` — child elements inherit
- **Charts**: Recharts ignores Tailwind classes on SVG — `useTheme()` is used to pass JS color values as props

### Feature 7: User Management (ManageUsers)
- Fetches all members with task counts via single MongoDB aggregation (N+1 eliminated)
- Shows per-member: pending / in-progress / completed task counts
- Download buttons trigger Excel reports

---

## 10. 🚨 Issues & Improvement Areas

### Critical Security Issues

| Issue | Risk | Fix |
|---|---|---|
| `POST /api/auth/upload-image` — no auth | Any user can fill your Cloudinary storage | Add `protect` middleware |
| `ADMIN_INVITE_TOKEN = "787878"` | Trivially guessable — anyone can become admin | Replace with server-generated one-time invite links |
| JWT in `localStorage` | XSS attack can steal token | Migrate to `HttpOnly` cookie |
| `.env` committed to repo (historical) | All secrets exposed | Rotate all secrets immediately |
| No rate limiting on auth routes | Brute force attacks possible | Add `express-rate-limit` on `/api/auth/login` and `/api/auth/register` |
| Error messages expose `error.message` in 500 responses | Information leakage | Only return generic message in production |

### Performance Issues

| Issue | Impact | Fix |
|---|---|---|
| `protect` middleware: DB query per request | High latency at scale | Redis cache: `user:${id}` with 5-min TTL |
| `getTasks` status summary: 4 `countDocuments()` | 4 DB round-trips | Replace with single `$facet` aggregation |
| `exportUsersReport`: loads all tasks in memory | OOM at scale | Stream with cursor or paginate |
| No DB indexes on `assignedTo`, `status`, `dueDate` | Full collection scans | Add compound indexes |
| No pagination on `GET /api/tasks/` | Unbounded response at scale | Add `?page=&limit=` with `.skip().limit()` |

### Code Quality Issues

| Issue | Fix |
|---|---|
| `updateTask` uses `||` for falsy-check: `task.title = req.body.title \|\| task.title` — empty string `""` would be ignored | Use `req.body.title !== undefined` check |
| `getUserDashboardData` uses `new mongoose.Types.ObjectId(req.user.id)` — deprecated constructor | Use `new mongoose.Types.ObjectId.createFromHexString()` or just pass string directly (Mongoose 8 auto-casts) |
| Report routes still have N+1 pattern in `exportUsersReport` | Rewrite with aggregation |
| No input validation / sanitisation library (no Joi/Zod) | Add `express-validator` or Zod |
| `tailwind.config.js` in frontend is a no-op (v4 doesn't use it) | Delete or document |
| `test.txt`, `out.txt`, `test_cloudinary.js` in backend root | Remove before production |
| Task `updateTask` doesn't recalculate progress when `todoChecklist` changes | Should trigger same auto-progress logic as `updateTaskChecklist` |

---

## 11. ⚡ Performance & Optimization

### Frontend

| Optimization | How |
|---|---|
| **Code splitting** | React Router lazy loading: `const Dashboard = lazy(() => import('./pages/Admin/Dashboard'))` |
| **Memoize expensive renders** | Wrap `CustomBarChart`, `CustomPieChart` in `React.memo` |
| **AbortController on fetches** | Already implemented in page-level `useEffect`s — prevents memory leaks on unmount |
| **Image optimization** | Cloudinary URLs support transform params: `?width=200&quality=auto` |
| **Bundle size** | `moment.js` (300KB) → replace with `date-fns` or `dayjs` (5KB) |

### Backend

| Optimization | How |
|---|---|
| **Index compound queries** | `{ assignedTo: 1, status: 1 }` for member task filter |
| **Pagination** | `GET /api/tasks?page=1&limit=20` with `.skip((page-1)*limit).limit(limit)` |
| **Lean queries** | `.lean()` on read-only queries (already used in `getUsers`) — saves ~20ms per doc by skipping Mongoose document hydration |
| **Cache dashboard data** | Dashboard stats change infrequently — Redis with 30s TTL |
| **Connection pool** | Mongoose default pool is 5 — increase for high concurrency: `mongoose.connect(uri, { maxPoolSize: 20 })` |

---

## 12. 🧠 Peak Detailing — Hidden Logic & Edge Cases

### Edge Case: `getTasks` status filter bug

```js
const pendingTasks = await Task.countDocuments({
  ...filter,          // ← includes { status: "Completed" } if ?status=Completed was passed
  status: "Pending",  // ← this OVERRIDES filter.status
  ...countFilter,
});
```
When a status filter is active (e.g., `?status=Completed`), the `pendingTasks` count is still correct because `status: "Pending"` overrides the spread `filter.status`. However, the `inProgressTasks` count does NOT apply the current filter, so the returned `statusSummary` is only partially filtered. This makes the counter badges inconsistent with the filtered view.

### Edge Case: Progress Bar on Task Update (Not Checklist Update)

When `PUT /api/tasks/:id` (general update) changes the `todoChecklist`, the `progress` field is NOT recalculated. Only `PUT /api/tasks/:id/todo` recalculates it. So if an admin adds/removes todo items via the task edit form, progress goes stale.

### Edge Case: `updateTask` falsy-check vulnerability

```js
task.title = req.body.title || task.title;
```
If an admin intentionally sends `title: ""`, the empty string is falsy — the old title is silently preserved. The client-side validates that title is non-empty, but there's no server-side validation, so direct API calls could expose this.

### Hidden Behaviour: `Root` Component and `Outlet`

```jsx
const Root = () => {
  if (loading) return <Outlet />;  // ← At "/" route there's no Outlet, renders nothing
  ...
}
```
During loading, users at `/` see a blank screen. This is unintuitive but harmless (typically < 200ms).

### Hidden Behaviour: `SelectUsers` Modal Key Preservation

When the admin opens the "Assign To" modal a second time, `tempSelectedUsers` is pre-populated from `selectedUsers` (confirmed selections). This ensures the visual toggle state matches the actual database state. Without this seeding, the toggles would always start unchecked.

### Hidden Behaviour: `updateTaskStatus` Auto-complete Checklist

```js
if (task.status === "Completed") {
  task.todoChecklist.forEach(item => { item.completed = true; });
  task.progress = 100;
}
```
Setting status to "Completed" via the status dropdown **force-completes all todo items** and sets progress=100. This is a shortcut for admins. However, setting status back to "In Progress" or "Pending" does NOT uncheck the todos — progress would remain 100% while status is "In Progress". This is a logical inconsistency.

---

## 13. 📝 Final Summary

### What the Project Does
WorkSync is a full-stack MERN team task management application (SaaS-grade design). It provides:
- **Admins**: Create and assign tasks, manage team members, view analytics dashboards, export Excel reports
- **Members**: View their assigned tasks, track progress, update checklist items, view details

### How Authentication Works
1. Register (with optional admin token) → bcrypt hash → JWT (7d TTL)
2. Token stored in `localStorage` → attached to every API request via Axios interceptor
3. On page load: `UserContext` fetches `/api/auth/profile` to hydrate user state
4. `PrivateRoute` blocks unauthenticated + wrong-role navigation
5. 401 responses → full page redirect to `/login`

### How Data Flows
```
User Action → React state update → axiosInstance (+ JWT header)
    → Express route → protect middleware (DB lookup) → controller
    → Mongoose query → MongoDB Atlas → JSON response
    → React state update → UI re-render
```

### Frontend ↔ Backend Connection
- **Dev**: Vite proxy (`/api` → `localhost:8000`) — no CORS needed
- **Prod**: CORS allowlist (`["https://taskme-puce.vercel.app", "localhost:5173"]`)
- **Transport**: JSON over HTTP/1.1 (no WebSockets — real-time requires polling or future SSE)
- **Image upload**: Multipart form-data → Multer → Cloudinary → URL stored in MongoDB

### Architecture Verdict
Clean, well-structured modular monolith suitable for a team of 2–10 engineers. The main production-blocking issues are:
1. **Unprotected image upload endpoint** — fix immediately
2. **JWT in localStorage** — migrate to HttpOnly cookies before public launch  
3. **Hardcoded admin token** — replace with invite-link system
4. **No DB indexes** — add before any real load
5. **Rotate all secrets** — the `.env` was committed

These fixes aside, the architecture is sound, the RBAC is correctly implemented at both route and controller level, and the dark mode implementation is complete and technically correct for Tailwind v4.
