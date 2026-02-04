import { Router } from "express";
import { addExcursion, deleteExcursion, getExcursion, updateExcursion, getExcursionFilters } from "../controllers/excursion.controller.js";

const router = Router();

router.post("/", addExcursion);
router.get("/filters", getExcursionFilters);
router.get("/", getExcursion);
router.put("/:id", updateExcursion);
router.delete("/:id", deleteExcursion);

export default router;