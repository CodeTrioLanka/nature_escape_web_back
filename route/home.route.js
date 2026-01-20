import { Router } from "express";
import { homeCretae,homeGet,homeEdit,homeDelete } from "../controllers/home.controller.js";


const router = Router();

router.get("/",homeGet );
router.post("/",homeCretae);
router.put("/:id",homeEdit);
router.delete("/:id", homeDelete);


export default router;