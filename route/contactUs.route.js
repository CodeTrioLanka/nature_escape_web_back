import { Router } from "express";

import { getContactUsData, setContactUsData } from "../controllers/contactUs.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();


router.get("/", getContactUsData);
router.post("/", authenticate, setContactUsData);

export default router;