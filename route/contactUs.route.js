import { Router } from "express";
import { getContactUsData, setContactUsData } from "../controllers/contactUs.controller.js";

const router = Router();

router.get("/", getContactUsData);
router.post("/", setContactUsData);

export default router;