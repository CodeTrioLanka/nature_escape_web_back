import { Router } from "express";
import { tourCreate, tourGet, tourGetById, tourEdit, tourDelete } from "../controllers/tours.controller.js";
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
        { name: "images", maxCount: 2 }
    ])(req, res, next);
};

router.get("/", tourGet);
router.get("/:id", tourGetById);
router.post("/", upload.fields([
    { name: "images", maxCount: 2 }
]), tourCreate);
router.put("/:id", handleBothFormats, tourEdit);
router.delete("/:id", tourDelete);

export default router;
