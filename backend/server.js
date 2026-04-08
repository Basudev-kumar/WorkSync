const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const express    = require("express");
const cors       = require("cors");
const connectDB  = require("./config/db.js");
const errorHandler = require("./utils/errorHandler.js");

const authRoutes   = require("./routes/authRoutes.js");
const userRoutes   = require("./routes/userRoutes.js");
const taskRoutes   = require("./routes/taskRoutes.js");
const reportRoutes = require("./routes/reportRoutes.js");


const app = express();

/* ── CORS ─────────────────────────────────────────────────────
   ALLOWED_ORIGINS env var is a comma-separated list of origins.
   Falls back to localhost for local development.
   ─────────────────────────────────────────────────────────── */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* ── Body parsing ─────────────────────────────────────────── */
app.use(express.json({ limit: "10kb" }));   // Prevent large payload attacks

/* ── Health check ─────────────────────────────────────────── */
app.get("/health", (req, res) =>
  res.json({ status: "ok", timestamp: new Date().toISOString() })
);

/* ── API Routes ────────────────────────────────────────────── */
app.use("/api/auth",    authRoutes);
app.use("/api/users",   userRoutes);
app.use("/api/tasks",   taskRoutes);
app.use("/api/reports", reportRoutes);

/* ── 404 handler ───────────────────────────────────────────── */
app.use((req, res) =>
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` })
);

/* ── Global error handler (MUST be last) ───────────────────── */
app.use(errorHandler);


/* ── Start ─────────────────────────────────────────────────── */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });