import { Router } from "express";
import {
    addExcursion,
    deleteExcursion,
    getExcursion,
    updateExcursion,
    getExcursionFilters,
    getExcursionBySlug
} from "../controllers/excursion.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/", upload.fields([
    { name: 'heroImages', maxCount: 10 },
    { name: 'excursionImages', maxCount: 10 }
]), addExcursion);

router.get("/filters", getExcursionFilters);
router.get("/", getExcursion);
router.get("/slug/:slug", getExcursionBySlug);

router.put("/:id", upload.fields([
    { name: 'heroImages', maxCount: 10 },
    { name: 'excursionImages', maxCount: 10 }
]), updateExcursion);

router.delete("/:id", deleteExcursion);

export default router;