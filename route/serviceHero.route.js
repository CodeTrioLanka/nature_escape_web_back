import { Router } from "express";
import {
    getServiceHero,
    setServiceHero,
    updateServiceHero
} from "../controllers/serviceHero.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Get service hero data
router.get("/", getServiceHero);

// Create service hero data (with image upload support)
router.post("/", upload.single("image"), setServiceHero);

// Update service hero data (with image upload support)
router.put("/:id", upload.single("image"), updateServiceHero);

export default router;
