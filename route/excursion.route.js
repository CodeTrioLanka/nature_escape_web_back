import { Router } from "express";
import { addExcursion, deleteExcursion, getExcursion, updateExcursion, getExcursionFilters } from "../controllers/excursion.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/", authenticate, addExcursion);
router.get("/filters", getExcursionFilters);
router.get("/", getExcursion);
router.put("/:id", authenticate, updateExcursion);
router.delete("/:id", authenticate, deleteExcursion);

export default router;