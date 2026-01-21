import { Router } from "express";
import { homeCretae, homeGet, homeEdit, homeDelete } from "../controllers/home.controller.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/", homeGet);
router.post("/", upload.fields([
  { name: "gallery", maxCount: 1 },
  { name: "homebg", maxCount: 1 },
  { name: "destinationImage", maxCount: 1 },
  { name: "personalizedImage", maxCount: 1 },
]), homeCretae);
router.put("/:id", upload.fields([
  { name: "gallery", maxCount: 1 },
  { name: "homebg", maxCount: 1 },
  { name: "destinationImage", maxCount: 1 },
  { name: "personalizedImage", maxCount: 1 },
]), homeEdit);

router.delete("/:id", homeDelete);

export default router;
