import { Router } from "express";
import { submitContactForm } from "../controllers/message.controller.js";

const router = Router();


router.post("/", submitContactForm);

export default router;
