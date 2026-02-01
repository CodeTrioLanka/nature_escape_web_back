import { Router } from "express";
import {
    addService,
    deleteService,
    getServices,
    getServiceById,
    updateService
} from "../controllers/service.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

// Get all services
router.get("/", getServices);

// Get single service by ID
router.get("/:id", getServiceById);

// Create new service (with image upload support)
router.post("/", upload.single("image"), addService);

// Update service (with image upload support)
router.put("/:id", upload.single("image"), updateService);

// Delete service
router.delete("/:id", deleteService);

export default router;