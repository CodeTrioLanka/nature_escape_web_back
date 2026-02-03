import { Router } from "express";
import {
    getServicePageData,
    getServiceHero,
    setServiceHero,
    getServices,
    addService,
    updateService,
    deleteService,
    getServiceById
} from "../controllers/servicePage.controller.js";
import { upload } from "../middleware/upload.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// --- PUBLIC / COMBINED ENDPOINT ---
router.get("/", getServicePageData);

// --- HERO ENDPOINTS ---
router.get("/hero", getServiceHero);
router.post("/hero", authenticate, upload.single("image"), setServiceHero);

// --- INDIVIDUAL SERVICES ENDPOINTS ---
router.get("/services", getServices);
router.get("/services/:id", getServiceById);
router.post("/services", authenticate, upload.single("image"), addService);
router.put("/services/:id", authenticate, upload.single("image"), updateService);
router.delete("/services/:id", authenticate, deleteService);

export default router;
