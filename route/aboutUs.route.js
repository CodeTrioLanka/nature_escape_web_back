import { Router } from "express";
import { getData, setData } from "../controllers/aboutUs.controller.js";

const router = Router();

router.get("/getData", getData);
router.post("/setData", setData);

export default router;