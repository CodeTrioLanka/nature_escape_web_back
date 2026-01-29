import { Router } from "express";
import { addThingsToDo, deleteThingsToDo, getThingsToDo, updateThingsToDo } from "../controllers/thingsToDo.controller.js";

const router = Router();

router.post("/", addThingsToDo);
router.get("/", getThingsToDo);
router.put("/:id", updateThingsToDo);
router.delete("/:id", deleteThingsToDo);

export default router;