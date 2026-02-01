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

const router = Router();

// --- PUBLIC / COMBINED ENDPOINT ---
router.get("/", getServicePageData);

// --- HERO ENDPOINTS ---
router.get("/hero", getServiceHero);
router.post("/hero", upload.single("image"), setServiceHero);

// --- INDIVIDUAL SERVICES ENDPOINTS ---
router.get("/services", getServices);
router.get("/services/:id", getServiceById);
router.post("/services", upload.single("image"), addService);
router.put("/services/:id", upload.single("image"), updateService);
router.delete("/services/:id", deleteService);

export default router;
