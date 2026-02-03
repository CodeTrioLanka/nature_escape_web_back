import { Router } from "express";
import { tourCreate, tourGet, tourGetById, tourGetBySlug, tourEdit, tourDelete } from "../controllers/tours.controller.js";
import { upload } from "../middleware/upload.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Middleware to handle both JSON and multipart requests
const handleBothFormats = (req, res, next) => {
    // If content-type is application/json, skip multer
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        return next();
    }
    // Otherwise, use multer for file uploads
    return upload.fields([
        { name: "images", maxCount: 2 }
    ])(req, res, next);
};

router.get("/", tourGet);
router.get("/slug/:slug", tourGetBySlug);
router.get("/:id", tourGetById);
router.post("/", authenticate, upload.fields([
    { name: "images", maxCount: 2 }
]), tourCreate);
router.put("/:id", authenticate, handleBothFormats, tourEdit);
router.delete("/:id", authenticate, tourDelete);

export default router;

