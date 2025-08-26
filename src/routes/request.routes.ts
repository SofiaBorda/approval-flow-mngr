import { Router } from "express";
import { RequestController } from "../controllers/Request.controller";

const router = Router();

router.post("/", RequestController.create);
router.post("/filter", RequestController.getAll);
router.get("/:id", RequestController.getById);
router.put("/:id", RequestController.updateStatus);
router.put("/update/:id", RequestController.update);

export default router; 
