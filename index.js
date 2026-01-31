import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import cors from "cors";
import homeRoute from "./route/home.route.js";
import uploadRoute from "./route/upload.route.js";
import aboutUsRoute from "./route/aboutUs.route.js";
import toursRoute from "./route/tours.route.js";
import packagesRoute from "./route/packages.route.js";
import { application } from "./config/application.js";
import authRoute from './route/auth.route.js';
import serviceRoute from './route/service.route.js';
import thingsToDoRoute from './route/thingsToDo.route.js';

import contactUsRoute from './route/contactUs.route.js';
import excursionRoute from './route/excursion.route.js';
import messageRoute from './route/message.route.js';

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
app.use('/api/auth', authRoute);
app.use("/api/home", homeRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/aboutus", aboutUsRoute);
app.use("/api/tours", toursRoute);
app.use("/api/packages", packagesRoute);
app.use('/api/service', serviceRoute);
app.use('/api/things-to-do', thingsToDoRoute);

app.use('/api/contactus', contactUsRoute);
app.use('/api/message', messageRoute);
app.use('/api/excursion', excursionRoute);

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