import { Router } from "express";
import {
    packageCreate,
    packageGet,
    packageGetById,
    packageGetBySlug,
    packageGetByCategory,
    packageEdit,
    packageDelete,
} from "../controllers/packages.controller.js";
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
        { name: "heroBackground", maxCount: 1 },
        { name: "mapImage", maxCount: 1 },
        { name: "galleryImages", maxCount: 20 },
        { name: "attractionImages", maxCount: 10 },
    ])(req, res, next);
};

router.get("/", packageGet);
router.get("/slug/:slug", packageGetBySlug);
router.get("/category/:categoryId", packageGetByCategory);
router.get("/:id", packageGetById);

router.post("/", authenticate, upload.fields([
    { name: "heroBackground", maxCount: 1 },
    { name: "mapImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 20 },
    { name: "attractionImages", maxCount: 10 },
]), packageCreate);

router.put("/:id", authenticate, handleBothFormats, packageEdit);
router.delete("/:id", authenticate, packageDelete);

export default router;
