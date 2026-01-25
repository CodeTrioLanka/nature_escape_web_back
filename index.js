import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import cors from "cors";
import homeRoute from "./route/home.route.js";
import uploadRoute from "./route/upload.route.js";
import { application } from "./config/application.js";
import authRoute from './route/auth.route.js';
const app = express();
const PORT = application.PORT;

// Middleware
app.use(
  cors({
    origin: application.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

//endpoints

app.use("/api/home", homeRoute);
app.use("/api/upload", uploadRoute);
app.use('/api/auth', authRoute);

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true }));

try {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}