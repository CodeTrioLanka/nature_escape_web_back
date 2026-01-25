import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import cors from "cors";
import homeRoute from "./route/home.route.js";
import { application } from "./config/application.js";
import authRoute from './route/auth.route.js';

const app = express();

// Middleware
app.use(cors({
  origin: application.CLIENT_URL,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Connect to DB on first request
let isConnected = false;
const ensureDBConnection = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await ensureDBConnection();
    next();
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use("/api/home", homeRoute);
app.use('/api/auth', authRoute);
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Export for Vercel
export default app;
