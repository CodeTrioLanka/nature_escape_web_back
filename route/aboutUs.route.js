import { Router } from "express";
import { getData, setData, updateData, deleteData } from "../controllers/aboutUs.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Middleware to handle both JSON and multipart requests
const handleBothFormats = (req, res, next) => {
  // If content-type is application/json, skip multer
  if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
    return next();
  }
  // Otherwise, use multer for file uploads
  return upload.any()(req, res, next);
};

router.get("/getData", getData);
router.post("/setData", upload.any(), setData);
router.put("/:id", handleBothFormats, updateData);
router.delete("/:id", deleteData);

export default router;