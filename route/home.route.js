import { Router } from "express";
import { homeCretae, homeGet, homeEdit, homeDelete } from "../controllers/home.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Middleware to handle both JSON and multipart requests
const handleBothFormats = (req, res, next) => {
  // If content-type is application/json, skip multer
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    return next();
  }
  // Otherwise, use multer for file uploads
  return upload.fields([
    { name: "gallery", maxCount: 10 },
    { name: "homebg", maxCount: 1 },
    { name: "destinationImage", maxCount: 1 },
    { name: "personalizedImage", maxCount: 1 },
  ])(req, res, next);
};

router.get("/", homeGet);
router.post("/", upload.fields([
  { name: "gallery", maxCount: 10 },
  { name: "homebg", maxCount: 1 },
  { name: "destinationImage", maxCount: 1 },
  { name: "personalizedImage", maxCount: 1 },
]), homeCretae);
router.put("/:id", handleBothFormats, homeEdit);

router.delete("/:id", homeDelete);

export default router;
