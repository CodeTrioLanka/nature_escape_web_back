import { Router } from "express";
import { addService, deleteService, getServices, updateService } from "../controllers/service.controller.js";

const router = Router();

router.post("/", addService);
router.get("/", getServices);
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;